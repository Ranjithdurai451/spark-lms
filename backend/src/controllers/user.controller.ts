// backend/controllers/userController.ts
import type { Request, Response } from "express";
import { prisma } from "../db";

/* ──────────────── GET USER PROFILE (Self or Other) ──────────────── */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // If no userId provided, return own profile
    const targetUserId = userId || requestingUserId;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            id: true,
            organizationName: true,
            organizationCode: true,
          },
        },
        // Get direct reports (people who report to this user)
        _count: {
          select: {
            reports: true, // Count of direct reports
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Get leave statistics
    const leaveStats = await prisma.leave.aggregate({
      where: {
        employeeId: targetUserId,
        status: "APPROVED",
      },
      _sum: {
        days: true,
      },
    });

    const pendingLeaves = await prisma.leave.count({
      where: {
        employeeId: targetUserId,
        status: "PENDING",
      },
    });

    // Get direct reports list
    const directReports = await prisma.user.findMany({
      where: {
        managerId: targetUserId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      take: 10, // Limit to 10 direct reports
    });

    res.status(200).json({
      message: "Profile fetched successfully.",
      data: {
        ...user,
        stats: {
          leaveDaysTaken: leaveStats._sum.days || 0,
          pendingLeaves,
          directReportsCount: user._count.reports,
        },
        directReports,
      },
    });
  } catch (error) {
    console.error("❌ getUserProfile error:", error);
    res.status(500).json({ message: "Failed to fetch user profile." });
  }
};

/* ──────────────── UPDATE OWN PROFILE ──────────────── */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required." });
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username.trim(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        organization: {
          select: {
            id: true,
            organizationName: true,
            organizationCode: true,
          },
        },
        manager: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
};
