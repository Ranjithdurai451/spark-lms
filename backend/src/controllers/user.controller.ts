// backend/controllers/userController.ts
import type { Request, Response } from "express";
import { prisma } from "../db";
import { format } from "date-fns";
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
    console.error(" getUserProfile error:", error);
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
    console.error(" updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization.id;
    const userRole = req.user.role;
    const isAdmin = ["ADMIN", "HR"].includes(userRole);

    // My leave stats
    const myLeaveGroups = await prisma.leave.groupBy({
      by: ["status"],
      where: { employeeId: userId, organizationId: orgId },
      _count: { _all: true },
    });
    const totalApprovedDays = await prisma.leave.aggregate({
      where: { employeeId: userId, organizationId: orgId, status: "APPROVED" },
      _sum: { days: true },
    });
    const myUpcoming = await prisma.leave.findFirst({
      where: {
        employeeId: userId,
        organizationId: orgId,
        status: "APPROVED",
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
    });

    // My balances
    const balances = await prisma.leaveBalance.findMany({
      where: { employeeId: userId, organizationId: orgId },
    });
    const totalAllocated = balances.reduce((sum, b) => sum + b.totalDays, 0);
    const totalRemaining = balances.reduce(
      (sum, b) => sum + b.remainingDays,
      0
    );

    // Holidays (next 5)
    const holidays = await prisma.holiday.findMany({
      where: {
        organizationId: orgId,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      take: 5,
    });

    let teamStats = null;
    let pendingApprovals: any = [];
    let recentApprovals: any = [];

    if (isAdmin) {
      const teamUsers = await prisma.user.findMany({
        where: { organizationId: orgId },
        select: { id: true, username: true },
      });
      const teamLeaves = await prisma.leave.findMany({
        where: { organizationId: orgId },
        include: { employee: { select: { username: true } } },
      });
      const today = new Date();

      const onLeaveToday = teamLeaves.filter(
        (l) =>
          l.status === "APPROVED" &&
          new Date(l.startDate) <= today &&
          new Date(l.endDate) >= today
      ).length;
      const pendingCount = teamLeaves.filter(
        (l) => l.status === "PENDING"
      ).length;
      teamStats = {
        totalEmployees: teamUsers.length,
        onLeaveToday,
        pendingCount,
      };

      pendingApprovals = teamLeaves
        .filter((l) => l.status === "PENDING")
        .map((l) => ({
          id: l.id,
          employee: l.employee?.username,
          dates: `${format(new Date(l.startDate), "MMM d")}${
            l.days !== 1 ? `- ${format(new Date(l.endDate), "MMM d")}` : ""
          }`,
          type: l.type,
          reason: l.reason || "",
          days: l.days,
          leave: l, // pass leave object if needed by UI
        }))
        .slice(0, 5);

      recentApprovals = teamLeaves
        .filter((l) => l.status === "APPROVED")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5)
        .map((l) => ({
          employee: l.employee?.username,
          type: l.type,
          dates: `${format(new Date(l.startDate), "MMM d")}${
            l.days !== 1 ? `- ${format(new Date(l.endDate), "MMM d")}` : ""
          }`,
          days: l.days,
        }));
    }

    res.status(200).json({
      message: "Dashboard stats fetched.",
      data: {
        isAdmin,
        stats: {
          totalBalance: totalRemaining,
          totalAllocated,
          pending:
            myLeaveGroups.find((g) => g.status === "PENDING")?._count._all ?? 0,
          approved: totalApprovedDays._sum.days ?? 0,
          utilizationPercent:
            totalAllocated > 0
              ? Math.round(
                  ((totalAllocated - totalRemaining) / totalAllocated) * 100
                )
              : 0,
          upcoming: myUpcoming
            ? {
                days: myUpcoming.days,
                dates: `${format(
                  new Date(myUpcoming.startDate),
                  "MMM d"
                )} - ${format(new Date(myUpcoming.endDate), "MMM d")}`,
              }
            : null,
        },
        teamStats,
        pendingApprovals,
        recentApprovals,
        upcomingHolidays: holidays,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
};
