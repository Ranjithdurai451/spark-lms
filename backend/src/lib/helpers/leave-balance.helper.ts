import { prisma } from "../../db";

/**
 * Create balances for all users when a new policy is created
 */
export async function createBalancesForPolicy(
  organizationId: string,
  leavePolicyId: string,
  maxDays: number,
  carryForward: number = 0
) {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: { id: true },
  });

  if (users.length === 0) {
    console.log("⚠️ No users found in organization");
    return;
  }

  const balancesCreated = await prisma.leaveBalance.createMany({
    data: users.map((u) => ({
      employeeId: u.id,
      organizationId,
      leavePolicyId,
      totalDays: maxDays,
      usedDays: 0,
      remainingDays: maxDays + carryForward,
      carryForward: carryForward,
      lastReset: new Date(),
    })),
    skipDuplicates: true,
  });

  console.log(
    `✅ Created ${balancesCreated.count} leave balances for policy ${leavePolicyId}`
  );
  return balancesCreated;
}

/**
 * Create balances for a new user (all active policies)
 */
export async function createBalancesForNewUser(
  userId: string,
  organizationId: string
) {
  const policies = await prisma.leavePolicy.findMany({
    where: { organizationId, active: true },
    select: { id: true, maxDays: true, carryForward: true },
  });

  if (policies.length === 0) {
    console.log("⚠️ No active policies found in organization");
    return;
  }

  const balancesCreated = await prisma.leaveBalance.createMany({
    data: policies.map((p) => ({
      employeeId: userId,
      organizationId,
      leavePolicyId: p.id,
      totalDays: p.maxDays,
      usedDays: 0,
      remainingDays: p.maxDays,
      carryForward: 0,
      lastReset: new Date(),
    })),
    skipDuplicates: true,
  });

  console.log(
    `Created ${balancesCreated.count} leave balances for user ${userId}`
  );
  return balancesCreated;
}

/**
 * Reset leave balances at year-end with carry forward
 */
export async function resetAnnualBalances(organizationId: string) {
  const balances = await prisma.leaveBalance.findMany({
    where: { organizationId },
    include: {
      leavePolicy: {
        select: { maxDays: true, carryForward: true },
      },
    },
  });

  const updates = balances.map(async (balance) => {
    const carryForwardDays = Math.min(
      balance.remainingDays,
      balance.leavePolicy.carryForward
    );

    return prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        totalDays: balance.leavePolicy.maxDays,
        usedDays: 0,
        remainingDays: balance.leavePolicy.maxDays + carryForwardDays,
        carryForward: carryForwardDays,
        lastReset: new Date(),
      },
    });
  });

  const results = await Promise.all(updates);
  console.log(
    ` Reset ${results.length} leave balances for organization ${organizationId}`
  );
  return results;
}

/**
 * Recalculate remaining days (fix data inconsistencies)
 */
export async function recalculateRemainingDays(employeeId: string) {
  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId },
  });

  const updates = balances.map((balance) => {
    const correctRemaining =
      balance.totalDays + balance.carryForward - balance.usedDays;

    if (balance.remainingDays !== correctRemaining) {
      console.log(
        `🔧 Fixing balance for employee ${employeeId}: ${balance.remainingDays} → ${correctRemaining}`
      );

      return prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { remainingDays: correctRemaining },
      });
    }

    return Promise.resolve(balance);
  });

  return Promise.all(updates);
}
