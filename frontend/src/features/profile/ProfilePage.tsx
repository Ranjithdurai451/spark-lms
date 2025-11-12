// features/profile/ProfilePage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Mail,
  Building2,
  Calendar,
  Users,
  Clock,
  Edit2,
  ArrowLeft,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useGetProfile } from "./useProfile";
import { useAppSelector } from "@/lib/hooks";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "./components/EditProfileDialog";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { useGetMyLeaveBalances } from "../my-leaves/useMyLeaves";

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetProfile(userId);
  const profile = data?.data;

  const { data: balancesData } = useGetMyLeaveBalances();
  const balances = balancesData?.data ?? [];

  const isOwnProfile = !userId || userId === currentUser?.id;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "HR":
        return "bg-primary/10 text-primary border-primary/20";
      case "MANAGER":
        return "bg-accent text-accent-foreground border-accent";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full mx-4 border-none shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Profile Not Found</h2>
              <p className="text-sm text-muted-foreground mt-2">
                This profile doesn't exist or you don't have access.
              </p>
            </div>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Profile Card */}
        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {profile.username}
                    </h1>
                    <Badge
                      className={cn("mt-2 border", getRoleColor(profile.role))}
                    >
                      {profile.role}
                    </Badge>
                  </div>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditDialogOpen(true)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {format(new Date(profile.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                    <Building2 className="w-4 h-4" />
                    <span>{profile.organization.organizationName}</span>
                    <span className="text-xs">
                      ({profile.organization.organizationCode})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances */}
        {isOwnProfile && balances.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Leave Balances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <Card
                  key={balance.id}
                  className="border-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          {balance.leavePolicy.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {balance.leavePolicy.maxDays} max
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Remaining:
                          </span>
                          <span className="font-bold text-2xl">
                            {balance.remainingDays}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Used:</span>
                          <span>{balance.usedDays} days</span>
                        </div>
                        {balance.carryForward > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Carried:
                            </span>
                            <span>{balance.carryForward} days</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${
                                (balance.usedDays / balance.totalDays) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          {Math.round(
                            (balance.usedDays / balance.totalDays) * 100
                          )}
                          % utilized
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid - SHADCN COLORS ONLY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Leave Days Taken - Primary */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-primary">
                    Leave Days Taken
                  </p>
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {profile.stats.leaveDaysTaken}
                </p>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="w-3 h-3" />
                  <span>This year</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Leaves - Accent */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/50 to-accent/30">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-accent-foreground">
                    Pending Leaves
                  </p>
                  <Clock className="w-4 h-4 text-accent-foreground" />
                </div>
                <p className="text-3xl font-bold text-accent-foreground">
                  {profile.stats.pendingLeaves}
                </p>
                <div className="flex items-center gap-1 text-xs text-accent-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>Awaiting approval</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Reports - Secondary */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary to-secondary/80">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-secondary-foreground">
                    Direct Reports
                  </p>
                  <Users className="w-4 h-4 text-secondary-foreground" />
                </div>
                <p className="text-3xl font-bold text-secondary-foreground">
                  {profile.stats.directReportsCount}
                </p>
                <div className="flex items-center gap-1 text-xs text-secondary-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>Team members</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manager & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manager */}
          {profile.manager && (
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Reports To
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <button
                  onClick={() => navigate(`/in/profile/${profile.manager!.id}`)}
                  className="w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {profile.manager.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {profile.manager.username}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.manager.email}
                      </p>
                      <Badge
                        className={cn(
                          "mt-1.5 text-xs border",
                          getRoleColor(profile.manager.role)
                        )}
                      >
                        {profile.manager.role}
                      </Badge>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          )}

          {/* Direct Reports */}
          {profile.directReports.length > 0 && (
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Direct Reports
                  </CardTitle>
                  <Badge variant="secondary">
                    {profile.directReports.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-2">
                  {profile.directReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => navigate(`/in/profile/${report.id}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {report.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {report.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {report.email}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs border",
                            getRoleColor(report.role)
                          )}
                        >
                          {report.role}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          currentUsername={profile.username}
          onSuccess={refetch}
        />
      </div>
    </div>
  );
}
