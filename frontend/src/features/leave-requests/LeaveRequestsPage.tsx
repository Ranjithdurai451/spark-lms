import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcw, Calendar } from "lucide-react";

import { ViewLeaveDialog } from "./components/ViewLeaveDialog";
import { ApproveRejectDialog } from "./components/ApproveRejectDialog";
import { LeaveRequestCard } from "./components/LeaveRequestCard";
import { LeaveRequestTableRow } from "./components/LeaveRequestTableRow";
import { LeaveRequestStats } from "./components/LeaveRequestStats";
import {
  useDeleteLeave,
  useGetAllLeaves,
  useGetAllLeaveStats,
  useLeaveFilters,
} from "./useLeaveRequests";
import { queryClient } from "../root/Providers";
import { LeaveSkeleton } from "../my-leaves/components/LeaveSkeleton";
import { PageHeader } from "../common/components/PageHeader";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import ErrorPage from "../common/components/ErrorPage";
import { useAuth } from "../auth/useAuth";
import type { LeaveRequest } from "./LeaveRequestsService";
import { DeleteConfirmDialog } from "../common/components/DeleteConfirmDialog";

export function LeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);
  const [actionLeave, setActionLeave] = useState<{
    leave: LeaveRequest;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, hasAccess } = useAuth();

  const orgId = user?.organization?.id ?? "";

  const { data, isLoading, isError, refetch, isFetching } =
    useGetAllLeaves(orgId);
  const { data: statsData, isLoading: statsLoading } =
    useGetAllLeaveStats(orgId);

  const leaves = data?.data ?? [];
  const stats = statsData?.data;

  const { filteredLeaves } = useLeaveFilters(leaves, activeTab);

  const canApprove = hasAccess(["ADMIN", "HR", "MANAGER"]);
  const canDelete = hasAccess(["ADMIN", "HR"]);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["leave-requests"] as any);
  };
  const { mutate: deleteLeave } = useDeleteLeave();
  if (isLoading || statsLoading) return <LeaveSkeleton />;
  if (isError)
    return (
      <ErrorPage message="Failed to load leave requests" refetch={refetch} />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Leave Requests"
          description="Review and manage leave requests"
          isLoading={isFetching}
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

        <LeaveRequestStats stats={stats} />

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

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredLeaves.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No {activeTab !== "all" && activeTab} leave requests found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Leave requests will appear here
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredLeaves.map((leave) => (
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
              /* Table View */
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
                    {filteredLeaves.map((leave) => (
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
