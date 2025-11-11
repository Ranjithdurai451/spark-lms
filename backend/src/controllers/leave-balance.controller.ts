import type { Request, Response } from "express";
import { prisma } from "../db";

/* ─────────────────── Get Current User Leave Balances ─────────────────── */
export const getMyLeaveBalances = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.organization.id;

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: userId,
        organizationId: orgId,
      },
      include: {
        leavePolicy: {
          select: {
            id: true,
            name: true,
            description: true,
            maxDays: true,
            carryForward: true,
            minNotice: true,
          },
        },
      },
    });

    if (!balances.length)
      return res
        .status(404)
        .json({ message: "No leave balances found for this user." });

    return res.status(200).json({
      message: "User leave balances fetched successfully.",
      data: balances,
    });
  } catch (error) {
    console.error("❌ getMyLeaveBalances error:", error);
    return res.status(500).json({
      message: "Failed to fetch user leave balances.",
    });
  }
};

/* ─────────────────── Get Organization-wide Balances (for HR/Admin) ─────────────────── */
// export const getOrganizationLeaveBalances = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const orgId = req.user.organization.id;

//     const balances = await prisma.leaveBalance.findMany({
//       where: { organizationId: orgId },
//       include: {
//         employee: { select: { id: true, username: true, email: true } },
//         leavePolicy: { select: { id: true, name: true, maxDays: true } },
//       },
//       orderBy: { employeeId: "asc" },
//     });

//     res.status(200).json({
//       message: "Organization leave balances fetched successfully.",
//       data: balances,
//     });
//   } catch (error) {
//     console.error("❌ getOrganizationLeaveBalances error:", error);
//     res.status(500).json({ message: "Failed to fetch organization balances." });
//   }
// };
