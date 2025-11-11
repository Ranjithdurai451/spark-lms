// features/dashboard/DashboardPage.tsx
import { useState, useMemo } from "react";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/hooks";
import {
  useGetMyLeaves,
  useGetMyLeaveBalances,
} from "../my-leaves/useMyLeaves";
import { useGetAllLeaves } from "../leave-requests/useLeaveRequests";
import { useGetHolidays } from "../holidays/useHolidays";
import { useGetOrganizationById } from "../organization/useOrganization";
import { ApproveRejectDialog } from "../leave-requests/components/ApproveRejectDialog";
import { ViewHolidaysDialog } from "./components/ViewHolidaysDialog";
import { format, isFuture, isToday, differenceInDays } from "date-fns";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = ["ADMIN", "HR", "MANAGER"].includes(user?.role || "");

  const [actionLeave, setActionLeave] = useState<{
    leave: any;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

  // Fetch data
  const { data: myLeavesData, isLoading: loadingMyLeaves } = useGetMyLeaves();
  const { data: balancesData, isLoading: loadingBalances } =
    useGetMyLeaveBalances();
  const { data: allLeavesData, isLoading: loadingAllLeaves } =
    useGetAllLeaves();
  const { data: holidaysData, isLoading: loadingHolidays } = useGetHolidays(
    user?.organization?.id ?? ""
  );
  const { data: orgData } = useGetOrganizationById(
    user?.organization?.id ?? ""
  );

  const myLeaves = myLeavesData?.data ?? [];
  const balances = balancesData?.data ?? [];
  const allLeaves = allLeavesData?.data ?? [];
  const holidays = holidaysData?.data ?? [];
  const organization = orgData?.data;

  // Calculate stats with real balance data
  const stats = useMemo(() => {
    const approved = myLeaves.filter((l) => l.status === "APPROVED");
    const pending = myLeaves.filter((l) => l.status === "PENDING");
    const totalUsed = approved.reduce((sum, l) => sum + l.days, 0);

    // Get next upcoming leave
    const upcomingLeaves = approved
      .filter((l) => isFuture(new Date(l.startDate)))
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    const nextLeave = upcomingLeaves[0];

    // Calculate total remaining balance from all leave policies
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

  // Pending requests for admin
  const pendingRequests = useMemo(() => {
    if (!isAdmin) return [];
    return allLeaves
      .filter((l) => l.status === "PENDING")
      .slice(0, 3)
      .map((leave) => ({
        id: leave.id,
        employee: leave.employee.username,
        dates: `${format(new Date(leave.startDate), "MMM d")} - ${format(
          new Date(leave.endDate),
          "MMM d"
        )}`,
        type: leave.type,
        reason: leave.reason || "No reason provided",
        status: leave.status,
        days: leave.days,
        leave,
      }));
  }, [allLeaves, isAdmin]);

  // Recent approvals
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
        dates: `${format(new Date(leave.startDate), "MMM d")} - ${format(
          new Date(leave.endDate),
          "MMM d"
        )}`,
        status: leave.status,
        days: leave.days,
      }));
  }, [allLeaves, myLeaves, isAdmin]);

  // Team overview (admin only)
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

    return {
      totalEmployees,
      onLeaveToday,
      pendingCount,
    };
  }, [allLeaves, organization, isAdmin]);

  // Upcoming holidays
  const upcomingHolidays = useMemo(() => {
    return holidays
      .filter((h) => isFuture(new Date(h.date)) || isToday(new Date(h.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [holidays]);

  const handlePrevHoliday = () => {
    setCurrentHolidayIndex((prev) =>
      prev > 0 ? prev - 1 : upcomingHolidays.length - 1
    );
  };

  const handleNextHoliday = () => {
    setCurrentHolidayIndex((prev) =>
      prev < upcomingHolidays.length - 1 ? prev + 1 : 0
    );
  };

  const currentHoliday = upcomingHolidays[currentHolidayIndex];

  const isLoading =
    loadingMyLeaves ||
    loadingBalances ||
    (isAdmin && loadingAllLeaves) ||
    loadingHolidays;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: "Total Leave Balance",
      value: stats.totalBalance.toString(),
      unit: "days",
      subtext: `Of ${stats.totalAllocated} days`,
      icon: Calendar,
      trend: `${stats.utilizationPercent}% utilized`,
      color:
        "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Approvals",
      value: isAdmin
        ? pendingRequests.length.toString()
        : stats.pending.toString(),
      subtext: isAdmin ? "Awaiting your review" : "Awaiting response",
      icon: AlertCircle,
      trend: isAdmin ? "Action needed" : "Submitted",
      color:
        "from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20",
      iconColor: "text-yellow-600",
    },
    {
      title: isAdmin ? "Team on Leave" : "Approved Leaves",
      value: isAdmin
        ? teamStats?.onLeaveToday.toString() ?? "0"
        : stats.approved.toString(),
      unit: isAdmin ? "members" : "days",
      subtext: isAdmin ? "Currently on leave" : "Already consumed",
      icon: CheckCircle2,
      trend: isAdmin ? "Today" : `${stats.utilizationPercent}% utilized`,
      color:
        "from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20",
      iconColor: "text-green-600",
    },
    {
      title: "Upcoming Leave",
      value: stats.upcoming ? stats.upcoming.days.toString() : "0",
      unit: "days",
      subtext: stats.upcoming ? "Next scheduled" : "No upcoming leaves",
      icon: Clock,
      trend: stats.upcoming ? stats.upcoming.dates : "Plan your leave",
      color:
        "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Manage your team's leave requests"
              : "Here's your leave management overview"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className={cn(
                  "border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br",
                  stat.color
                )}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <Icon className={cn("w-4 h-4", stat.iconColor)} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        {stat.unit && (
                          <p className="text-sm text-muted-foreground">
                            {stat.unit}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.subtext}
                      </p>
                      <p className="text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Holiday Slider */}
        {upcomingHolidays.length > 0 && (
          <Card className="border-none shadow-xl bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Upcoming Holidays</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setHolidayDialogOpen(true)}
                >
                  <Eye className="w-3 h-3" />
                  View All
                </Button>
              </div>

              {currentHoliday && (
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={handlePrevHoliday}
                      disabled={upcomingHolidays.length <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex-1 text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-lg">
                          {currentHoliday.name}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(currentHoliday.date),
                          "EEEE, MMMM dd, yyyy"
                        )}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge
                          className={cn(
                            "text-xs border",
                            currentHoliday.type === "PUBLIC"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30"
                          )}
                        >
                          {currentHoliday.type}
                        </Badge>
                        {currentHoliday.recurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {differenceInDays(
                          new Date(currentHoliday.date),
                          new Date()
                        )}{" "}
                        days away
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={handleNextHoliday}
                      disabled={upcomingHolidays.length <= 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Pagination Dots */}
                  {upcomingHolidays.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {upcomingHolidays.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentHolidayIndex(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === currentHolidayIndex
                              ? "w-6 bg-primary"
                              : "w-1.5 bg-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals - Admin Only */}
          {isAdmin && pendingRequests.length > 0 && (
            <div className="lg:col-span-2">
              <Card className="border-none shadow-xl">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Pending Approvals
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Requests awaiting your review
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs font-bold">
                      {pendingRequests.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              {req.employee}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {req.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {req.dates}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            Reason: {req.reason}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setActionLeave({
                                leave: req.leave,
                                action: "APPROVED",
                              })
                            }
                            className="flex-1 sm:flex-none h-8 text-xs text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-950/30"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setActionLeave({
                                leave: req.leave,
                                action: "REJECTED",
                              })
                            }
                            className="flex-1 sm:flex-none h-8 text-xs text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team Overview - Admin Only */}
          {isAdmin && teamStats && (
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-lg font-semibold">
                  Team Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Total Employees
                    </p>
                    <p className="font-bold text-lg">
                      {teamStats.totalEmployees}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      On Leave Today
                    </p>
                    <p className="font-bold text-lg">
                      {teamStats.onLeaveToday}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 rounded-full h-2"
                      style={{
                        width: `${
                          (teamStats.onLeaveToday / teamStats.totalEmployees) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Pending Requests
                    </p>
                    <p className="font-bold text-lg">
                      {teamStats.pendingCount}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-600 rounded-full h-2"
                      style={{
                        width: `${
                          (teamStats.pendingCount / teamStats.totalEmployees) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Approvals */}
        {recentApprovals.length > 0 && (
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-semibold">
                Recent Approvals
              </CardTitle>
              <CardDescription className="text-xs">
                Leaves approved recently
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                        {isAdmin ? "Employee" : "Status"}
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                        Dates
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                        Days
                      </th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApprovals.map((leave, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 font-medium text-sm">
                          {leave.employee}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {leave.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {leave.dates}
                        </td>
                        <td className="p-3 font-semibold">{leave.days}d</td>
                        <td className="p-3">
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Approved
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        {actionLeave && (
          <ApproveRejectDialog
            open={!!actionLeave}
            onOpenChange={(o) => !o && setActionLeave(null)}
            leave={actionLeave.leave}
            action={actionLeave.action}
            onSuccess={() => setActionLeave(null)}
          />
        )}

        <ViewHolidaysDialog
          open={holidayDialogOpen}
          onOpenChange={setHolidayDialogOpen}
          holidays={holidays}
        />
      </div>
    </div>
  );
}
