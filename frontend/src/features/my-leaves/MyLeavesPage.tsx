// features/leaves/MyLeavesPage.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Ban,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  Loader2,
  Loader,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RequestLeaveSheet } from "./components/RequestLeaveSheet";
import { ViewLeaveDialog } from "./components/ViewLeaveDialog";
import { CancelLeaveDialog } from "./components/CancelLeaveDialog";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { LeaveSkeleton } from "./components/LeaveSkeleton";
import { format, formatDistanceToNow } from "date-fns";
import type { Leave } from "./MyleavesService";
import { useGetMyLeaves } from "./useMyLeaves";

export function MyLeavesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState<Leave | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useGetMyLeaves();
  const leaves = data?.data ?? [];

  const handleRefetch = () => {
    queryClient.invalidateQueries(["my-leaves"] as any);
    queryClient.invalidateQueries(["leave-balances"] as any);
  };

  if (isLoading) return <LeaveSkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <XCircle className="w-16 h-16 text-destructive" />
        <p className="text-lg font-semibold text-destructive">
          Failed to load your leaves
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );

  const filteredLeaves =
    activeTab === "all"
      ? leaves
      : leaves.filter((l) => l.status.toLowerCase() === activeTab);

  const stats = {
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
    cancelled: leaves.filter((l) => l.status === "CANCELLED").length,
  };

  const getStatusIcon = (status: string, size: string = "w-4 h-4") => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className={cn(size, "text-green-600")} />;
      case "REJECTED":
        return <XCircle className={cn(size, "text-red-600")} />;
      case "CANCELLED":
        return <Ban className={cn(size, "text-gray-600")} />;
      default:
        return <Clock className={cn(size, "text-yellow-600")} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200 dark:border-none dark:bg-green-950/30";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200  dark:border-none dark:bg-red-950/30";
      case "CANCELLED":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:border-none dark:bg-gray-950/30";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:border-none dark:bg-yellow-950/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                My Leaves
              </h1>
              {isFetching && (
                <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your time off and track leave requests
            </p>
          </div>
          <Button
            size="default"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setIsRequestSheetOpen(true)}
          >
            <Plus className="w-4 h-4" /> Request Leave
          </Button>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Requests
                  </p>
                  <TrendingUp className="w-4 h-4 text-primary/60" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {leaves.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Pending
                  </p>
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                  {stats.pending}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">
                    Approved
                  </p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {stats.approved}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    Rejected
                  </p>
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {stats.rejected}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Cancelled
                  </p>
                  <Ban className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                  {stats.cancelled}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-5 bg-background">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs">
                    Approved
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs">
                    Rejected
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="text-xs">
                    Cancelled
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* View Toggle */}
              <div className="flex gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8"
                >
                  <TableIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredLeaves.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No {activeTab !== "all" && activeTab} leaves found
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Start by requesting your first leave
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsRequestSheetOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Request Leave
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              /* Enhanced Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredLeaves.map((leave) => (
                  <Card
                    key={leave.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-md overflow-hidden"
                    onClick={() => setViewingLeave(leave)}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
                    <CardContent className="p-4 pl-5">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {leave.type}
                          </Badge>
                          <Badge
                            className={cn(
                              "gap-1.5 border",
                              getStatusColor(leave.status)
                            )}
                          >
                            {getStatusIcon(leave.status, "w-3 h-3")}
                            <span className="text-xs font-medium">
                              {leave.status}
                            </span>
                          </Badge>
                        </div>

                        {/* Duration */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                            <p className="text-sm font-medium">
                              {format(new Date(leave.startDate), "dd MMM")} -{" "}
                              {format(new Date(leave.endDate), "dd MMM yyyy")}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground pl-6">
                            <strong>{leave.days}</strong> day
                            {leave.days > 1 ? "s" : ""} •{" "}
                            {formatDistanceToNow(new Date(leave.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {/* Reason */}
                        {leave.reason && (
                          <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                            {leave.reason}
                          </p>
                        )}

                        {/* Actions */}
                        {leave.status === "PENDING" && (
                          <div className="pt-2 border-t flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancellingId(leave.id);
                              }}
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Ban className="w-3 h-3 mr-1.5" />
                              Cancel Request
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Enhanced Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        TYPE
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        DURATION
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        DAYS
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        STATUS
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        APPLIED
                      </th>
                      <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map((leave) => (
                      <tr
                        key={leave.id}
                        className="border-b hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4">
                          <Badge variant="secondary" className="font-medium">
                            {leave.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {format(new Date(leave.startDate), "dd MMM yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              to{" "}
                              {format(new Date(leave.endDate), "dd MMM yyyy")}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold">
                            {leave.days}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            day{leave.days > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={cn(
                              "gap-1.5 border",
                              getStatusColor(leave.status)
                            )}
                          >
                            {getStatusIcon(leave.status, "w-3 h-3")}
                            <span className="text-xs font-medium">
                              {leave.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-sm">
                              {format(new Date(leave.createdAt), "dd MMM yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(leave.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => setViewingLeave(leave)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {leave.status === "PENDING" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setCancellingId(leave.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <RequestLeaveSheet
          open={isRequestSheetOpen}
          onOpenChange={setIsRequestSheetOpen}
          onSuccess={handleRefetch}
        />

        <ViewLeaveDialog
          leave={viewingLeave}
          open={!!viewingLeave}
          onOpenChange={(o) => !o && setViewingLeave(null)}
        />

        {cancellingId && (
          <CancelLeaveDialog
            open={!!cancellingId}
            onOpenChange={(o) => !o && setCancellingId(null)}
            leaveId={cancellingId}
            onSuccess={handleRefetch}
          />
        )}
      </div>
    </div>
  );
}
