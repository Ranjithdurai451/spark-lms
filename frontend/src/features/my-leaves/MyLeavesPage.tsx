import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar } from "lucide-react";

import { ViewLeaveDialog } from "./components/ViewLeaveDialog";
import { CancelLeaveDialog } from "./components/CancelLeaveDialog";
import { MyLeaveCard } from "./components/MyLeaveCard";
import { MyLeaveTableRow } from "./components/MyLeaveTableRow";
import { MyLeaveStats } from "./components/MyLeaveStats";
import { queryClient } from "../root/Providers";
import { LeaveSkeleton } from "./components/LeaveSkeleton";
import type { Leave } from "./MyleavesService";
import { useGetMyLeaves, useMyLeaveFilters } from "./useMyLeaves";
import ErrorPage from "../common/components/ErrorPage";
import { PageHeader } from "../common/components/PageHeader";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import { RequestLeaveSheet } from "./components/request-sheet/RequestLeaveSheet";

export function MyLeavesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState<Leave | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useGetMyLeaves();
  const leaves = data?.data ?? [];

  const { filteredLeaves, stats } = useMyLeaveFilters(leaves, activeTab);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["my-leaves"] as any);
    queryClient.invalidateQueries(["leave-balances"] as any);
  };

  if (isLoading) return <LeaveSkeleton />;
  if (isError)
    return <ErrorPage message="Failed to load your leaves" refetch={refetch} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="My Leaves"
          description="Manage your time off and track leave requests"
          isLoading={isFetching}
          action={
            <Button
              size="default"
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
              onClick={() => setIsRequestSheetOpen(true)}
            >
              <Plus className="w-4 h-4" /> Request Leave
            </Button>
          }
        />

        <MyLeaveStats stats={stats} />

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
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredLeaves.map((leave) => (
                  <MyLeaveCard
                    key={leave.id}
                    leave={leave}
                    onView={() => setViewingLeave(leave)}
                    onCancel={() => setCancellingId(leave.id)}
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
                      <MyLeaveTableRow
                        key={leave.id}
                        leave={leave}
                        onView={() => setViewingLeave(leave)}
                        onCancel={() => setCancellingId(leave.id)}
                      />
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
