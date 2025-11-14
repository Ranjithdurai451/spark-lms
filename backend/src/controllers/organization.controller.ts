import type { Request, Response } from "express";
// src/server/controllers/organization.controller.ts
import { prisma } from "../db";
import { sendMemberInviteEmail } from "../lib/helpers/mail.helper";

export const getOrganizationMembers = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const users = await prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        manager: {
          select: { id: true, username: true, email: true },
        },
      },
    });
    return res.status(200).json({ message: "Members fetched.", data: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch members." });
  }
};

// Members stats endpoint
export const getOrganizationMemberStats = async (
  req: Request,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    const result = await prisma.user.groupBy({
      by: ["role"],
      where: { organizationId },
      _count: { _all: true },
    });
    const total = result.reduce((sum, row) => sum + row._count._all, 0);
    const stats = {
      total,
      admin: result.find((r) => r.role === "ADMIN")?._count._all ?? 0,
      hr: result.find((r) => r.role === "HR")?._count._all ?? 0,
      manager: result.find((r) => r.role === "MANAGER")?._count._all ?? 0,
      employee: result.find((r) => r.role === "EMPLOYEE")?._count._all ?? 0,
    };

    return res.status(200).json({
      message: "Member stats fetched.",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { invitedEmail, role, managerId } = req.body;
    const { user } = req;

    if (!invitedEmail || !role) {
      return res.status(400).json({
        message: "Email and role are required.",
      });
    }

    // Check if the invited user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitedEmail },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    // Optional: validate manager
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found." });
      }

      if (manager.organizationId !== user.organization.id) {
        return res.status(400).json({
          message: "Manager must belong to the same organization.",
        });
      }
    }

    // Send invite email
    await sendMemberInviteEmail({
      invitedEmail,
      role,
      organizationId: user.organization.id,
      organizationName: user.organization.organizationName,
      managerId,
    });

    return res.status(200).json({
      message: "Invite sent successfully.",
      data: {
        email: invitedEmail,
        role,
        organization: user.organization.organizationName,
      },
    });
  } catch (error) {
    console.error(" inviteMember error:", error);
    res.status(500).json({ message: "Failed to send invite." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, role, managerId } = req.body;

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate manager if provided
    if (managerId) {
      if (managerId === id) {
        return res
          .status(400)
          .json({ message: "A user cannot be their own manager." });
      }

      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return res.status(400).json({ message: "Manager not found." });
      }

      if (manager.organizationId !== existing.organizationId) {
        return res.status(400).json({
          message: "Manager must belong to the same organization.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: username ?? existing.username,
        role: role ?? existing.role,
        managerId: managerId ?? existing.managerId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        managerId: true,
        organizationId: true,
      },
    });

    res.status(200).json({
      message: "Member updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error(" updateUser error:", error);
    res.status(500).json({ message: "Failed to update user." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    if (existing.role === "ADMIN") {
      return res.status(403).json({
        message: "You cannot delete another admin account.",
      });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Member deleted successfully." });
  } catch (error) {
    console.error(" deleteUser error:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
};
