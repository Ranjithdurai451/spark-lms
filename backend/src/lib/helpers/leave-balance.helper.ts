import { prisma } from "../../db";

/* ─────────────── Create Balances for All Users ─────────────── */
export async function createBalancesForPolicy(
  organizationId: string,
  leavePolicyId: string,
  maxDays: number
) {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: { id: true },
  });

  if (users.length === 0) return;

  const updatedusers = await prisma.leaveBalance.createMany({
    data: users.map((u) => ({
      employeeId: u.id,
      organizationId,
      leavePolicyId,
      totalDays: maxDays,
      remainingDays: maxDays,
    })),
    skipDuplicates: true,
  });
  console.log("updated Users", updatedusers);
}

/* ─────────────── Create Balances for a New User ─────────────── */
export async function createBalancesForNewUser(
  userId: string,
  organizationId: string
) {
  const policies = await prisma.leavePolicy.findMany({
    where: { organizationId, active: true },
  });

  if (policies.length === 0) return;

  await prisma.leaveBalance.createMany({
    data: policies.map((p) => ({
      employeeId: userId,
      organizationId,
      leavePolicyId: p.id,
      totalDays: p.maxDays,
      remainingDays: p.maxDays,
    })),
    skipDuplicates: true,
  });
}
