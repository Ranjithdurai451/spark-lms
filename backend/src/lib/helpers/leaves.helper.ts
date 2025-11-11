// backend/lib/helpers/leaves.helper.ts
import { prisma } from "../../db";

/**
 * Calculate business days between two dates, excluding weekends and holidays
 */
export async function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  organizationId: string
): Promise<number> {
  // Normalize dates to avoid timezone issues
  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  // Fetch holidays for the organization
  const holidays = await prisma.holiday.findMany({
    where: {
      organizationId,
      date: {
        gte: start,
        lte: end,
      },
    },
    select: { date: true },
  });

  const holidayDates = new Set(
    holidays.map((h) => {
      const d = new Date(h.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  let businessDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

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

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < minNoticeDays) {
    return `This leave type requires at least ${minNoticeDays} day(s) advance notice. You provided ${diffDays} day(s).`;
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
