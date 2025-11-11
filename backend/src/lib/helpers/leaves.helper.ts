import { prisma } from "../../db";

/**
 * Calculate business days between two dates, excluding weekends and holidays
 */
export async function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  organizationId: string
): Promise<number> {
  // Fetch holidays for the organization
  const holidays = await prisma.holiday.findMany({
    where: {
      organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { date: true },
  });

  const holidayDates = new Set(
    holidays.map((h) => h.date.toISOString().split("T")[0])
  );

  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split("T")[0];

    // Check if it's not weekend (0 = Sunday, 6 = Saturday)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayDates.has(dateString);

    if (!isWeekend && !isHoliday) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

/**
 * Check if leave dates overlap with existing approved/pending leaves
 */
export async function checkLeaveOverlap(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeLeaveId?: string
): Promise<string | null> {
  const overlappingLeave = await prisma.leave.findFirst({
    where: {
      employeeId,
      id: excludeLeaveId ? { not: excludeLeaveId } : undefined,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        {
          // New leave starts during existing leave
          startDate: { lte: startDate },
          endDate: { gte: startDate },
        },
        {
          // New leave ends during existing leave
          startDate: { lte: endDate },
          endDate: { gte: endDate },
        },
        {
          // New leave completely contains existing leave
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      ],
    },
    select: {
      startDate: true,
      endDate: true,
      status: true,
      type: true,
    },
  });

  if (overlappingLeave) {
    return `You have an overlapping ${overlappingLeave.status.toLowerCase()} ${
      overlappingLeave.type
    } leave from ${overlappingLeave.startDate.toISOString().split("T")[0]} to ${
      overlappingLeave.endDate.toISOString().split("T")[0]
    }.`;
  }

  return null;
}

/**
 * Validate minimum notice period for leave requests
 */
export async function validateMinNotice(
  startDate: Date,
  minNoticeDays: number
): Promise<string | null> {
  if (minNoticeDays === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = startDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < minNoticeDays) {
    return `This leave type requires at least ${minNoticeDays} day(s) notice. You provided ${diffDays} day(s).`;
  }

  return null;
}

/**
 * Check if a specific date is a holiday
 */
export async function isHoliday(
  date: Date,
  organizationId: string
): Promise<boolean> {
  const holiday = await prisma.holiday.findFirst({
    where: {
      organizationId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });

  return !!holiday;
}
