import type { Request, Response } from "express";
import { prisma } from "../db";
import { createBalancesForPolicy } from "../lib/helpers/leave-balance.helper";

export const getLeavePolicies = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user.organization.id;
    const policies = await prisma.leavePolicy.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
      message: "Policies fetched successfully.",
      data: policies,
    });
  } catch (err) {
    console.error("getLeavePolicies error:", err);
    res.status(500).json({ message: "Failed to fetch policies." });
  }
};
// GET /leave-policies/stats
export const getLeavePolicyStats = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user.organization.id;

    // Group by active status if you ever want active/inactive breakdown
    const [aggregates, activeAgg] = await Promise.all([
      prisma.leavePolicy.aggregate({
        where: { organizationId },
        _count: { _all: true },
        _sum: { maxDays: true },
        _avg: { maxDays: true },
      }),
      prisma.leavePolicy.count({ where: { organizationId, active: true } }),
    ]);
    res.status(200).json({
      message: "Stats fetched successfully.",
      data: {
        total: aggregates._count._all,
        active: activeAgg,
        totalDays: aggregates._sum.maxDays ?? 0,
        avgDays: aggregates._avg.maxDays
          ? Math.round(aggregates._avg.maxDays)
          : 0,
      },
    });
  } catch (err) {
    console.error("getLeavePolicyStats error:", err);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

/* ─────────────────── Create Leave Policy ─────────────────── */
export const createLeavePolicy = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user.organization.id;

    const newPolicy = await prisma.leavePolicy.create({
      data: { ...req.body, organizationId },
    });

    // Initialize balances for all current users
    await createBalancesForPolicy(
      organizationId,
      newPolicy.id,
      newPolicy.maxDays
    );

    res.status(201).json({
      message: "Leave policy created and balances initialized successfully.",
      data: newPolicy,
    });
  } catch (err) {
    console.error(" createLeavePolicy error:", err);
    res.status(400).json({ message: "Failed to create policy." });
  }
};

/* ─────────────────── Update Leave Policy ─────────────────── */
export const updateLeavePolicy = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    const updateData = req.body;

    const oldPolicy = await prisma.leavePolicy.findUnique({
      where: { id: policyId },
    });

    if (!oldPolicy)
      return res.status(404).json({ message: "Policy not found." });

    const updatedPolicy = await prisma.leavePolicy.update({
      where: { id: policyId },
      data: updateData,
    });

    // If maxDays changed, update all user balances
    if (updateData.maxDays && updateData.maxDays !== oldPolicy.maxDays) {
      const diff = updateData.maxDays - oldPolicy.maxDays;

      await prisma.leaveBalance.updateMany({
        where: { leavePolicyId: policyId },
        data: {
          totalDays: updateData.maxDays,
          // Optionally adjust remaining days proportionally
          remainingDays: {
            increment: diff,
          },
        },
      });

      console.log(` Leave balances updated for policy ${policyId}.`);
    }

    res.status(200).json({
      message: "Policy updated successfully.",
      data: updatedPolicy,
    });
  } catch (err) {
    console.error(" updateLeavePolicy error:", err);
    res.status(400).json({ message: "Failed to update policy." });
  }
};

/* ─────────────────── Delete Leave Policy ─────────────────── */
export const deleteLeavePolicy = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;

    const existing = await prisma.leavePolicy.findUnique({
      where: { id: policyId },
    });

    if (!existing)
      return res.status(404).json({ message: "Policy not found." });

    // Delete both policy and related balances atomically
    await prisma.$transaction([
      prisma.leaveBalance.deleteMany({ where: { leavePolicyId: policyId } }),
      prisma.leavePolicy.delete({ where: { id: policyId } }),
    ]);

    res.status(200).json({
      message: "Leave policy and balances deleted successfully.",
    });
  } catch (err) {
    console.error(" deleteLeavePolicy error:", err);
    res.status(500).json({ message: "Failed to delete leave policy." });
  }
};
