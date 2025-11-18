import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { AddPolicyDialog } from "./components/AddPolicyDialog";
import { EditPolicyDialog } from "./components/EditPolicyDialog";
import { PolicyCard } from "./components/PolicyCard";
import { PolicyTableRow } from "./components/PolicyTableRow";
import { PolicyStats } from "./components/PolicyStats";
import {
  useDeleteLeavePolicy,
  useGetLeavePolicies,
  useGetLeavePolicyStats,
} from "./useLeavePolicy";
import { queryClient } from "../root/Providers";
import ErrorPage from "../common/components/ErrorPage";
import { PageHeader } from "../common/components/PageHeader";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import { useAuth } from "../auth/useAuth";
import { DeleteConfirmDialog } from "../common/components/DeleteConfirmDialog";
import { StatsSkeleton } from "../common/components/skeleton-loaders.tsx/StatsSkeleton";
import { ContentSkeleton } from "../common/components/skeleton-loaders.tsx/ContentSkeleton";

export function LeavePolicyPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { user, hasAccess } = useAuth();
  const orgId = user?.organization?.id ?? "";
  const {
    data,
    isLoading: isPolicyLoading,
    isError,
    refetch,
    isFetching,
  } = useGetLeavePolicies(orgId);
  const { data: statsData, isLoading: statsLoading } =
    useGetLeavePolicyStats(orgId);

  const policies = data?.data ?? [];
  const stats = statsData?.data;

  const canManage = hasAccess(["ADMIN", "HR"]);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["leave-policies", orgId] as any);
  };
  const { mutate: deletePolicy } = useDeleteLeavePolicy();

  if (isError)
    return (
      <ErrorPage message="Failed to load leave policies." refetch={refetch} />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Leave Policies"
          description="Manage and configure leave policies for your organization"
          isLoading={isFetching}
          action={
            canManage && (
              <Button
                size="default"
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4" /> Create Policy
              </Button>
            )
          }
        />

        {statsLoading ? (
          <StatsSkeleton count={4} />
        ) : (
          <PolicyStats stats={stats} />
        )}

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Policy Management</h2>
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isPolicyLoading ? (
              <ContentSkeleton viewMode={viewMode} />
            ) : policies.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No policies yet
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Create your first leave policy to get started
                </p>
                {canManage && (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Policy
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {policies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    canManage={canManage}
                    onEdit={() => setEditingPolicy(policy)}
                    onDelete={() => setDeletingPolicy(policy)}
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
                        POLICY
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        MAX DAYS
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        CARRY FORWARD
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        APPROVAL
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        MIN NOTICE
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        STATUS
                      </th>
                      <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <PolicyTableRow
                        key={policy.id}
                        policy={policy}
                        canManage={canManage}
                        onEdit={() => setEditingPolicy(policy)}
                        onDelete={() => setDeletingPolicy(policy)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        {canManage && (
          <AddPolicyDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSuccess={handleRefetch}
          />
        )}

        {editingPolicy && (
          <EditPolicyDialog
            open={!!editingPolicy}
            onOpenChange={(open) => {
              if (!open) setEditingPolicy(null);
              handleRefetch();
            }}
            policy={editingPolicy}
          />
        )}

        {deletingPolicy && (
          <DeleteConfirmDialog
            open={!!deletingPolicy}
            onOpenChange={(open) => {
              if (!open) setDeletingPolicy(null);
              handleRefetch();
            }}
            title="Delete Policy"
            description={`Are you sure you want to delete ${deletingPolicy.name}? This action cannot be undone.`}
            onConfirm={() =>
              new Promise((resolve, reject) => {
                deletePolicy(deletingPolicy.id, {
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
