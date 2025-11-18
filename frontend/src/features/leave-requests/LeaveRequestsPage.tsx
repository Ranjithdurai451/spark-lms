import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Calendar, Search, X } from "lucide-react";

import { ViewLeaveDialog } from "./components/ViewLeaveDialog";
import { ApproveRejectDialog } from "./components/ApproveRejectDialog";
import { LeaveRequestCard } from "./components/LeaveRequestCard";
import { LeaveRequestTableRow } from "./components/LeaveRequestTableRow";
import { LeaveRequestStats } from "./components/LeaveRequestStats";
import { PaginationControls } from "../common/components/PaginationControls";
import {
  useDeleteLeave,
  useGetAllLeaves,
  useGetAllLeaveStats,
} from "./useLeaveRequests";
import { queryClient } from "../root/Providers";
import { PageHeader } from "../common/components/PageHeader";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import ErrorPage from "../common/components/ErrorPage";
import { useAuth } from "../auth/useAuth";
import { useDebounce } from "../common/hooks/useDebounce";
import type { LeaveRequest } from "./LeaveRequestsService";
import { DeleteConfirmDialog } from "../common/components/DeleteConfirmDialog";
import { StatsSkeleton } from "../common/components/skeleton-loaders.tsx/StatsSkeleton";
import { ContentSkeleton } from "../common/components/skeleton-loaders.tsx/ContentSkeleton";

export function LeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected" | "cancelled"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);
  const [actionLeave, setActionLeave] = useState<{
    leave: LeaveRequest;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user, hasAccess } = useAuth();
  const orgId = user?.organization?.id ?? "";

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllLeaves(orgId, {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: activeTab,
  });

  const { data: statsData, isLoading: statsLoading } =
    useGetAllLeaveStats(orgId);

  const leaves = leavesResponse?.data?.leaves ?? [];
  const pagination = leavesResponse?.data?.pagination;
  const stats = statsData?.data;

  const canApprove = hasAccess(["ADMIN", "HR", "MANAGER"]);
  const canDelete = hasAccess(["ADMIN", "HR"]);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["leave-requests", orgId] as any);
    queryClient.invalidateQueries(["leave-request-stats", orgId] as any);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const { mutate: deleteLeave } = useDeleteLeave();

  if (isError) {
    return (
      <ErrorPage message="Failed to load leave requests" refetch={refetch} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Leave Requests"
          description="Review and manage leave requests"
          isLoading={isFetching || statsLoading}
          action={
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleRefetch}
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
          }
        />

        {statsLoading ? (
          <StatsSkeleton count={4} />
        ) : (
          <LeaveRequestStats stats={stats} />
        )}

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Leave Requests</h2>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value: any) => setActiveTab(value)}
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

                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 h-9 text-sm"
                      disabled={leavesLoading}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-0.5"
                        disabled={leavesLoading}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {leavesLoading ? (
                    "Loading leave requests..."
                  ) : (
                    <>
                      {pagination?.total ?? 0}{" "}
                      {pagination?.total === 1 ? "request" : "requests"}
                      {searchQuery && ` found for "${searchQuery}"`}
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {leavesLoading ? (
              <ContentSkeleton viewMode={viewMode} />
            ) : leaves.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-lg font-medium text-foreground">
                  {searchQuery
                    ? "No leave requests found"
                    : `No ${
                        activeTab !== "all" ? activeTab : ""
                      } leave requests found`}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery
                    ? `Try adjusting your search for "${searchQuery}"`
                    : "Leave requests will appear here"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Search
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {leaves.map((leave) => (
                  <LeaveRequestCard
                    key={leave.id}
                    leave={leave}
                    canApprove={canApprove && leave.status === "PENDING"}
                    canDelete={canDelete}
                    onView={() => setViewingLeave(leave)}
                    onApprove={() =>
                      setActionLeave({ leave, action: "APPROVED" })
                    }
                    onReject={() =>
                      setActionLeave({ leave, action: "REJECTED" })
                    }
                    onDelete={() => setDeletingId(leave.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        EMPLOYEE
                      </th>
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
                    {leaves.map((leave) => (
                      <LeaveRequestTableRow
                        key={leave.id}
                        leave={leave}
                        canApprove={canApprove && leave.status === "PENDING"}
                        canDelete={canDelete}
                        onView={() => setViewingLeave(leave)}
                        onApprove={() =>
                          setActionLeave({ leave, action: "APPROVED" })
                        }
                        onReject={() =>
                          setActionLeave({ leave, action: "REJECTED" })
                        }
                        onDelete={() => setDeletingId(leave.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination - Show only when not loading and has data */}
            {!leavesLoading && pagination && pagination.totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                pageSize={pageSize}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <ViewLeaveDialog
          leave={viewingLeave}
          open={!!viewingLeave}
          onOpenChange={(o) => !o && setViewingLeave(null)}
        />

        {actionLeave && (
          <ApproveRejectDialog
            open={!!actionLeave}
            onOpenChange={(o) => !o && setActionLeave(null)}
            leave={actionLeave.leave}
            action={actionLeave.action}
            onSuccess={handleRefetch}
          />
        )}

        {deletingId && (
          <DeleteConfirmDialog
            open={!!deletingId}
            onOpenChange={(o) => !o && setDeletingId(null)}
            title="Delete Leave Request"
            description="Are you sure you want to delete this leave request? This action cannot be undone. If the leave was approved, the balance will be restored."
            onConfirm={() =>
              new Promise((resolve, reject) => {
                deleteLeave(deletingId, {
                  onSuccess: () => {
                    handleRefetch();
                    resolve();
                  },
                  onError: (err) => reject(err),
                });
              })
            }
          />
        )}
      </div>
    </div>
  );
}
