import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { DashboardHolidaySlider } from "./components/DashboardHolidaySlider";
import { DashboardPendingApprovals } from "./components/DashboardPendingApprovals";
import { ApproveRejectDialog } from "../leave-requests/components/ApproveRejectDialog";
import { ViewHolidaysDialog } from "./components/ViewHolidaysDialog";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { DashboardStatCard } from "./components/DashboardStatsCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import { useDashboardStats } from "../profile/useProfile";
import ErrorPage from "../common/components/ErrorPage";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user) as User;
  const { data, isLoading, isError, refetch } = useDashboardStats();

  const [actionLeave, setActionLeave] = useState<{
    leave: any;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

  if (isLoading) return <DashboardSkeleton />;
  if (isError)
    return <ErrorPage message="Failed to load your leaves" refetch={refetch} />;
  if (!data || !data?.data?.stats)
    return <div>No dashboard data available.</div>;

  const {
    isAdmin,
    stats,
    teamStats,
    pendingApprovals,
    recentApprovals,
    upcomingHolidays,
  } = data.data;

  const statCards = [
    {
      title: "Total Leave Balance",
      value: (stats.totalBalance ?? 0).toString(),
      unit: "days",
      subtext: `Of ${stats.totalAllocated ?? 0} days`,
      icon: Calendar,
      trend: `${stats.utilizationPercent ?? 0}% utilized`,
      color: "from-primary/5 to-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Pending Approvals",
      value: isAdmin
        ? (pendingApprovals?.length ?? 0).toString()
        : (stats.pending ?? 0).toString(),
      subtext: isAdmin ? "Awaiting your review" : "Awaiting response",
      icon: AlertCircle,
      trend: isAdmin ? "Action needed" : "Submitted",
      color: "from-accent/50 to-accent/30",
      iconColor: "text-accent-foreground",
    },
    {
      title: isAdmin ? "Team on Leave" : "Approved Leaves",
      value: isAdmin
        ? (teamStats?.onLeaveToday ?? 0).toString()
        : (stats.approved ?? 0).toString(),
      unit: isAdmin ? "members" : "days",
      subtext: isAdmin ? "Currently on leave" : "Already consumed",
      icon: CheckCircle2,
      trend: isAdmin ? "Today" : `${stats.utilizationPercent ?? 0}% utilized`,
      color: "from-primary/5 to-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Upcoming Leave",
      value: stats.upcoming?.days?.toString() ?? "0",
      unit: "days",
      subtext: stats.upcoming ? "Next scheduled" : "No upcoming leaves",
      icon: Clock,
      trend: stats.upcoming?.dates || "Plan your leave",
      color: "from-secondary to-secondary/80",
      iconColor: "text-secondary-foreground",
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
          {statCards.map((stat, idx) => (
            <DashboardStatCard {...stat} key={idx} />
          ))}
        </div>

        {/* Holiday Slider */}
        {upcomingHolidays.length > 0 && (
          <DashboardHolidaySlider
            holidays={upcomingHolidays}
            index={currentHolidayIndex}
            setIndex={setCurrentHolidayIndex}
            onPrev={() =>
              setCurrentHolidayIndex((prev) =>
                prev > 0 ? prev - 1 : upcomingHolidays.length - 1
              )
            }
            onNext={() =>
              setCurrentHolidayIndex((prev) =>
                prev < upcomingHolidays.length - 1 ? prev + 1 : 0
              )
            }
            onViewAll={() => setHolidayDialogOpen(true)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          {isAdmin && pendingApprovals.length > 0 && (
            <div className="lg:col-span-2">
              <DashboardPendingApprovals
                requests={pendingApprovals}
                onApprove={(leave) =>
                  setActionLeave({ leave, action: "APPROVED" })
                }
                onReject={(leave) =>
                  setActionLeave({ leave, action: "REJECTED" })
                }
              />
            </div>
          )}

          {/* Team Overview */}
          {isAdmin && !!teamStats && (
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
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${
                          teamStats.totalEmployees
                            ? (teamStats.onLeaveToday /
                                teamStats.totalEmployees) *
                              100
                            : 0
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
                      className="bg-accent rounded-full h-2"
                      style={{
                        width: `${
                          teamStats.totalEmployees
                            ? (teamStats.pendingCount /
                                teamStats.totalEmployees) *
                              100
                            : 0
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
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
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
            leave={actionLeave?.leave}
            action={actionLeave.action}
            onSuccess={() => setActionLeave(null)}
          />
        )}
        <ViewHolidaysDialog
          open={holidayDialogOpen}
          onOpenChange={setHolidayDialogOpen}
          holidays={upcomingHolidays}
        />
      </div>
    </div>
  );
}
