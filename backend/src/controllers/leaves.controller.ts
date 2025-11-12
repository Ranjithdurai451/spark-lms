// backend/controllers/leaveController.ts
import type { Request, Response } from "express";
import { prisma } from "../db";
import {
  validateMinNotice,
  calculateBusinessDays,
  checkLeaveOverlap,
} from "../lib/helpers/leaves.helper";
import { sendLeaveRequestEmail } from "../lib/helpers/mail.helper";

/* ──────────────── GET ALL LEAVES (Organization-wide) ──────────────── */
export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organization?.id;

    if (!orgId) {
      return res.status(400).json({ message: "Organization not found." });
    }

    const leaves = await prisma.leave.findMany({
      where: { organizationId: orgId },
      include: {
        employee: {
          select: { id: true, username: true, email: true, role: true },
        },
        approver: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "All leave requests fetched successfully.",
      data: leaves,
    });
  } catch (error) {
    console.error(" getAllLeaves error:", error);
    res.status(500).json({ message: "Failed to fetch leaves." });
  }
};

/* ──────────────── GET MY LEAVES (For Employee) ──────────────── */
export const getMyLeaves = async (req: Request, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: {
        employeeId: req.user.id,
        organizationId: req.user.organization.id,
      },
      include: {
        approver: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Your leave requests fetched successfully.",
      data: leaves,
    });
  } catch (error) {
    console.error(" getMyLeaves error:", error);
    res.status(500).json({ message: "Failed to fetch your leaves." });
  }
};

/* ──────────────── CREATE LEAVE (Employee Request) ──────────────── */
export const createLeave = async (req: Request, res: Response) => {
  try {
    const orgId = req.user.organization.id;
    const { type, reason, startDate, endDate, notifyUsers } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Calculate business days
    const days = await calculateBusinessDays(
      new Date(startDate),
      new Date(endDate),
      orgId
    );

    if (days <= 0) {
      return res.status(400).json({
        message: "No business days in the selected range.",
      });
    }

    // Check overlap
    const overlapError = await checkLeaveOverlap(
      req.user.id,
      new Date(startDate),
      new Date(endDate)
    );
    if (overlapError) {
      return res.status(400).json({ message: overlapError });
    }

    // Get leave policy
    const policy = await prisma.leavePolicy.findFirst({
      where: {
        name: type,
        organizationId: orgId,
        active: true,
      },
    });

    if (!policy) {
      return res.status(404).json({ message: "Leave policy not found." });
    }

    // Check balance
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: req.user.id,
        leavePolicyId: policy.id,
      },
    });

    if (!balance || balance.remainingDays < days) {
      return res.status(400).json({
        message: `Insufficient balance. You have ${
          balance?.remainingDays || 0
        } day(s) but requested ${days} day(s).`,
      });
    }

    // Validate minimum notice
    const minNoticeError = await validateMinNotice(
      new Date(startDate),
      policy.minNotice
    );
    if (minNoticeError) {
      return res.status(400).json({ message: minNoticeError });
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: req.user.id,
        organizationId: orgId,
        approverId: req.user.manager?.id || null,
        type,
        reason,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        status: "PENDING",
      },
      include: {
        employee: {
          select: { id: true, username: true, email: true },
        },
        approver: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    // Send email notifications
    const notifyEmails: string[] = [];

    if (leave.approver?.email) {
      notifyEmails.push(leave.approver.email);
    }

    if (notifyUsers && Array.isArray(notifyUsers)) {
      const users = await prisma.user.findMany({
        where: { id: { in: notifyUsers } },
        select: { email: true },
      });
      notifyEmails.push(...users.map((u) => u.email));
    }

    await Promise.allSettled(
      notifyEmails.map((email) =>
        sendLeaveRequestEmail({
          to: email,
          employeeName: leave.employee.username,
          leaveType: type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days,
          reason,
        })
      )
    );

    return res.status(201).json({
      message: "Leave request submitted successfully.",
      data: leave,
    });
  } catch (error) {
    console.error(" createLeave error:", error);
    return res.status(500).json({ message: "Failed to create leave." });
  }
};

/* ──────────────── CANCEL LEAVE (Employee) ──────────────── */
export const cancelLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    // Only owner can cancel
    if (leave.employeeId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this leave." });
    }

    // Only pending leaves can be cancelled
    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: `Cannot cancel a ${leave.status.toLowerCase()} leave request.`,
      });
    }

    const updated = await prisma.leave.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        approver: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.status(200).json({
      message: "Leave cancelled successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(" cancelLeave error:", error);
    res.status(500).json({ message: "Failed to cancel leave." });
  }
};

/* ──────────────── UPDATE LEAVE STATUS (HR / Manager / Admin) ──────────────── */
export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            email: true,
            managerId: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    // Only pending leaves can be approved/rejected
    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: `This leave is already ${leave.status.toLowerCase()}.`,
      });
    }

    // Authorization
    const isDirectManager = req.user.id === leave.employee.managerId;
    const isAuthorizedRole = ["HR", "ADMIN", "MANAGER"].includes(req.user.role);
    const isAssignedApprover = req.user.id === leave.approverId;

    if (!isDirectManager && !isAuthorizedRole && !isAssignedApprover) {
      return res.status(403).json({
        message: "Unauthorized to approve/reject this leave.",
      });
    }

    // Check balance before approval
    if (status === "APPROVED") {
      const policy = await prisma.leavePolicy.findFirst({
        where: {
          name: leave.type,
          organizationId: leave.organizationId,
          active: true,
        },
      });

      if (!policy) {
        return res.status(404).json({ message: "Leave policy not found." });
      }

      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: leave.employeeId,
          leavePolicyId: policy.id,
        },
      });

      if (!balance || balance.remainingDays < leave.days) {
        return res.status(400).json({
          message: `Employee has insufficient balance. Available: ${
            balance?.remainingDays || 0
          } days, Required: ${leave.days} days.`,
        });
      }
    }

    // Update leave and balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedLeave = await tx.leave.update({
        where: { id },
        data: {
          status,
          approverId: req.user.id,
        },
        include: {
          employee: {
            select: { id: true, username: true, email: true },
          },
          approver: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      // Handle balance based on status
      if (status === "APPROVED") {
        const balance = await tx.leaveBalance.findFirst({
          where: {
            employeeId: leave.employeeId,
            leavePolicy: { name: leave.type },
          },
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: { increment: leave.days },
              remainingDays: { decrement: leave.days },
            },
          });
        }
      }

      return updatedLeave;
    });

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully.`,
      data: result,
    });
  } catch (error) {
    console.error(" updateLeaveStatus error:", error);
    res.status(500).json({ message: "Failed to update leave status." });
  }
};

/* ──────────────── DELETE LEAVE (HR / Admin only) ──────────────── */
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    // Only HR/ADMIN can delete
    const allowedRoles = ["HR", "ADMIN"];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Unauthorized to delete leaves.",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Restore balance if leave was APPROVED
      if (leave.status === "APPROVED") {
        const balance = await tx.leaveBalance.findFirst({
          where: {
            employeeId: leave.employeeId,
            leavePolicy: { name: leave.type },
          },
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              usedDays: { decrement: leave.days },
              remainingDays: { increment: leave.days },
            },
          });
        }
      }

      await tx.leave.delete({ where: { id } });
    });

    res.status(200).json({
      message: "Leave deleted successfully.",
    });
  } catch (error) {
    console.error("deleteLeave error:", error);
    res.status(500).json({ message: "Failed to delete leave." });
  }
};
