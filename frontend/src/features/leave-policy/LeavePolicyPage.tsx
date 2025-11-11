// features/leave-policy/LeavePolicyPage.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  RefreshCcw,
  Edit2,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Loader,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/lib/hooks";
import { useGetLeavePolicies } from "./useLeavePolicy";
import { AddPolicyDialog } from "./components/AddPolicyDialog";
import { EditPolicyDialog } from "./components/EditPolicyDialog";
import { DeletePolicyDialog } from "./components/DeletePolicyDialog";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { LeavePolicySkeleton } from "./components/LeavePolicySkeleton";

export function LeavePolicyPage() {
  // ALL HOOKS AT THE TOP
  const user = useAppSelector((state) => state.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data, isLoading, isError, refetch, isFetching } =
    useGetLeavePolicies(orgId);

  const policies = data?.data ?? [];

  const stats = useMemo(
    () => ({
      total: policies.length,
      active: policies.filter((p) => p.active).length,
      avgDays:
        policies.length > 0
          ? Math.round(
              policies.reduce((sum, p) => sum + p.maxDays, 0) / policies.length
            )
          : 0,
      totalDays: policies.reduce((sum, p) => sum + p.maxDays, 0),
    }),
    [policies]
  );

  const handleRefetchAfterChange = () => {
    queryClient.invalidateQueries(["leave-policies", orgId] as any);
    // refetch();
  };

  // CONDITIONAL RETURNS AFTER HOOKS
  if (isLoading) return <LeavePolicySkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <p className="text-destructive font-semibold text-lg">
          Failed to load leave policies.
        </p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Leave Policies
              </h1>
              {isFetching && (
                <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage and configure leave policies for your organization
            </p>
          </div>
          <Button
            size="default"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create Policy
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Policies
                  </p>
                  <TrendingUp className="w-4 h-4 text-primary/60" />
                </div>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">
                    Active
                  </p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {stats.active}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Avg Days
                  </p>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {stats.avgDays}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Total Days
                  </p>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                  {stats.totalDays}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Policy Management</h2>

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
            {policies.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No policies yet
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Create your first leave policy to get started
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Policy
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {policies.map((policy) => (
                  <Card
                    key={policy.id}
                    className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
                    <CardContent className="p-4 pl-5">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {policy.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {policy.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "text-[10px] h-5 border",
                                policy.active
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
                                  : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400"
                              )}
                            >
                              {policy.active ? "Active" : "Inactive"}
                            </Badge>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => setEditingPolicy(policy)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeletingPolicy(policy)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                          <div>
                            <p className="text-[10px] text-muted-foreground">
                              Max Days
                            </p>
                            <p className="text-sm font-bold">
                              {policy.maxDays}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">
                              Carry Forward
                            </p>
                            <p className="text-sm font-bold">
                              {policy.carryForward}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">
                              Min Notice
                            </p>
                            <p className="text-sm font-bold">
                              {policy.minNotice} days
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">
                              Approval
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {policy.requiresApproval ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-gray-600" />
                              )}
                              <p className="text-xs font-medium">
                                {policy.requiresApproval
                                  ? "Required"
                                  : "Not Required"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                      <tr
                        key={policy.id}
                        className="border-b hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">{policy.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {policy.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold">
                            {policy.maxDays}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            days
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold">
                            {policy.carryForward}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            days
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {policy.requiresApproval ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Yes</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-gray-600" />
                                <span className="text-sm">No</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{policy.minNotice} days</td>
                        <td className="p-4">
                          <Badge
                            className={cn(
                              "text-xs border",
                              policy.active
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:border-none dark:text-green-400"
                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:border-none dark:text-gray-400"
                            )}
                          >
                            {policy.active ? "Active" : "Inactive"}
                          </Badge>
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
                                onClick={() => setEditingPolicy(policy)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingPolicy(policy)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
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
        <AddPolicyDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleRefetchAfterChange}
        />

        {editingPolicy && (
          <EditPolicyDialog
            open={!!editingPolicy}
            onOpenChange={(open) => {
              if (!open) setEditingPolicy(null);
              handleRefetchAfterChange();
            }}
            policy={editingPolicy}
          />
        )}

        {deletingPolicy && (
          <DeletePolicyDialog
            open={!!deletingPolicy}
            onOpenChange={(open) => {
              if (!open) setDeletingPolicy(null);
              handleRefetchAfterChange();
            }}
            policy={deletingPolicy}
          />
        )}
      </div>
    </div>
  );
}
