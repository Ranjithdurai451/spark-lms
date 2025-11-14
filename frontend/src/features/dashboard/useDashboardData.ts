import { useState, useMemo } from "react";
import { format, isFuture, isToday } from "date-fns";
import type { FullOrganization } from "@/lib/types";
import type { Holiday } from "../holidays/holidayService";
import type { Leave, LeaveBalance } from "../my-leaves/MyleavesService";
import { useAuth } from "../auth/useAuth";

export function useDashboardData(
  myLeaves: Leave[],
  balances: LeaveBalance[],
  allLeaves: Leave[],
  holidays: Holiday[],
  organization: FullOrganization | undefined
) {
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);
  const { hasAccess } = useAuth();
  const isAdmin = hasAccess(["ADMIN", "HR"]);

  const stats = useMemo(() => {
    const approved = myLeaves.filter((l) => l.status === "APPROVED");
    const pending = myLeaves.filter((l) => l.status === "PENDING");
    const totalUsed = approved.reduce((sum, l) => sum + l.days, 0);

    const upcomingLeaves = approved
      .filter((l) => isFuture(new Date(l.startDate)))
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    const nextLeave = upcomingLeaves[0];

    const totalRemaining = balances.reduce(
      (sum, b) => sum + b.remainingDays,
      0
    );
    const totalAllocated = balances.reduce((sum, b) => sum + b.totalDays, 0);

    const utilizationPercent =
      totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

    return {
      totalBalance: totalRemaining,
      totalAllocated,
      pending: pending.length,
      approved: totalUsed,
      upcoming: nextLeave
        ? {
            days: nextLeave.days,
            dates: `${format(
              new Date(nextLeave.startDate),
              "MMM d"
            )} - ${format(new Date(nextLeave.endDate), "MMM d")}`,
          }
        : null,
      utilizationPercent,
    };
  }, [myLeaves, balances]);

  const pendingRequests = useMemo(() => {
    if (!isAdmin) return [];
    return (
      allLeaves
        .filter((l) => l.status === "PENDING")
        // .slice(0, 3)
        .map((leave) => ({
          id: leave.id,
          employee: leave?.employee?.username,
          dates: `${format(new Date(leave.startDate), "MMM d")} ${
            leave.days != 1
              ? "- " + format(new Date(leave.endDate), "MMM d")
              : ""
          } `,
          type: leave.type,
          reason: leave.reason || "No reason provided",
          status: leave.status,
          days: leave.days,
          leave,
        }))
    );
  }, [allLeaves, isAdmin]);

  const recentApprovals = useMemo(() => {
    const approvedLeaves = isAdmin
      ? allLeaves.filter((l) => l.status === "APPROVED")
      : myLeaves.filter((l) => l.status === "APPROVED");

    return approvedLeaves
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5)
      .map((leave) => ({
        employee: isAdmin ? leave?.employee?.username : "You",
        type: leave.type,
        dates: `${format(new Date(leave.startDate), "MMM d")} ${
          leave.days != 1 ? "- " + format(new Date(leave.endDate), "MMM d") : ""
        } `,
        status: leave.status,
        days: leave.days,
      }));
  }, [allLeaves, myLeaves, isAdmin]);

  const teamStats = useMemo(() => {
    if (!isAdmin) return null;
    const totalEmployees = organization?.users?.length ?? 0;
    const onLeaveToday = allLeaves.filter((l) => {
      if (l.status !== "APPROVED") return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const today = new Date();
      return start <= today && end >= today;
    }).length;
    const pendingCount = allLeaves.filter((l) => l.status === "PENDING").length;
    return { totalEmployees, onLeaveToday, pendingCount };
  }, [allLeaves, organization, isAdmin]);

  const upcomingHolidays = useMemo(() => {
    return holidays
      .filter((h) => isFuture(new Date(h.date)) || isToday(new Date(h.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [holidays]);

  return {
    isAdmin,
    stats,
    pendingRequests,
    recentApprovals,
    teamStats,
    upcomingHolidays,
    currentHolidayIndex,
    setCurrentHolidayIndex,
  };
}
