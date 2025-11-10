import type { Request, Response } from "express";
import { prisma } from "../db";

/* ──────────────── GET ALL LEAVES (Organization-wide) ──────────────── */
export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organization?.id;
    const leaves = await prisma.leave.findMany({
      where: { organizationId: orgId },
      include: {
        employee: {
          select: { id: true, username: true, email: true, role: true },
        },
        approver: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "All leave requests fetched successfully.",
      data: leaves,
    });
  } catch (error) {
    console.error("❌ getAllLeaves error:", error);
    res.status(500).json({ message: "Failed to fetch leaves." });
  }
};

/* ──────────────── GET MY LEAVES (For Employee) ──────────────── */
export const getMyLeaves = async (req: Request, res: Response) => {
  try {
    const orgId = req.user?.organization?.id;
    const leaves = await prisma.leave.findMany({
      where: { employeeId: req.user.id, organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Your leave requests fetched successfully.",
      data: leaves,
    });
  } catch (error) {
    console.error("❌ getMyLeaves error:", error);
    res.status(500).json({ message: "Failed to fetch your leaves." });
  }
};

/* ──────────────── CREATE LEAVE (Employee Request) ──────────────── */
export const createLeave = async (req: Request, res: Response) => {
  try {
    const orgId = req.user.organization.id;
    const { type, reason, startDate, endDate, days } = req.body;

    if (!type || !startDate || !endDate || !days)
      return res.status(400).json({ message: "Missing required fields." });

    // Find the leave policy
    const policy = await prisma.leavePolicy.findFirst({
      where: { name: type, organizationId: orgId },
    });

    if (!policy)
      return res.status(404).json({ message: "Leave policy not found." });

    // Check user's leave balance
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: req.user.id,
        organizationId: orgId,
        leavePolicyId: policy.id,
      },
    });

    if (!balance)
      return res.status(400).json({
        message: "You don't have a balance for this leave type.",
      });

    if (balance.remainingDays < days)
      return res.status(400).json({
        message: `Insufficient balance. You only have ${balance.remainingDays} days left.`,
      });

    // Create leave + deduct from balance
    const leave = await prisma.$transaction(async (tx) => {
      const newLeave = await tx.leave.create({
        data: {
          employeeId: req.user.id,
          organizationId: orgId,
          type,
          reason,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days: Number(days),
          status: "PENDING",
        },
      });

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { remainingDays: { decrement: Number(days) } },
      });

      return newLeave;
    });

    return res.status(201).json({
      message: "Leave request submitted successfully.",
      data: leave,
    });
  } catch (error) {
    console.error("❌ createLeave error:", error);
    return res.status(500).json({ message: "Failed to create leave." });
  }
};

/* ──────────────── UPDATE LEAVE (Employee Edit) ──────────────── */
export const updateLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, reason, startDate, endDate, days } = req.body;

    const existing = await prisma.leave.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Leave not found." });

    // Only employee who created the leave can update, and only if pending
    if (existing.employeeId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Unauthorized to update this leave." });

    if (existing.status !== "PENDING")
      return res
        .status(400)
        .json({ message: "Only pending leaves can be updated." });

    const updated = await prisma.leave.update({
      where: { id },
      data: {
        type: type ?? existing.type,
        reason: reason ?? existing.reason,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        days: days ?? existing.days,
      },
    });

    res
      .status(200)
      .json({ message: "Leave updated successfully.", data: updated });
  } catch (error) {
    console.error("❌ updateLeave error:", error);
    res.status(500).json({ message: "Failed to update leave." });
  }
};

/* ──────────────── APPROVE / REJECT LEAVE (HR / Manager / Admin) ──────────────── */
export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!["APPROVED", "REJECTED"].includes(status))
      return res.status(400).json({ message: "Invalid status value." });

    const leave = await prisma.leave.findUnique({ where: { id } });
    if (!leave) return res.status(404).json({ message: "Leave not found." });

    const updated = await prisma.leave.update({
      where: { id },
      data: { status, approverId: req.user.id },
    });

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error("❌ updateLeaveStatus error:", error);
    res.status(500).json({ message: "Failed to update leave status." });
  }
};

/* ──────────────── DELETE LEAVE (Employee / HR / Admin) ──────────────── */
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await prisma.leave.findUnique({ where: { id } });
    if (!leave) return res.status(404).json({ message: "Leave not found." });

    // Only employee who created it or HR/Admin can delete
    const allowedRoles = ["HR", "ADMIN"];
    if (
      leave.employeeId !== req.user.id &&
      !allowedRoles.includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this leave." });
    }

    await prisma.leave.delete({ where: { id } });

    res.status(200).json({ message: "Leave deleted successfully." });
  } catch (error) {
    console.error("❌ deleteLeave error:", error);
    res.status(500).json({ message: "Failed to delete leave." });
  }
};
