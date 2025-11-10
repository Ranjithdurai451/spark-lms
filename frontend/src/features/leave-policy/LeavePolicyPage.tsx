import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  Table,
  RefreshCcw,
  Edit2,
  Trash2,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useGetLeavePolicies } from "./useLeavePolicy";
import { AddPolicyDialog } from "./components/AddPolicyDialog";
import { EditPolicyDialog } from "./components/EditPolicyDialog";
import { DeletePolicyDialog } from "./components/DeletePolicyDialog";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { LeavePolicySkeleton } from "./components/LeavePolicySkeleton";

export function LeavePolicyPage() {
  const user = useAppSelector((state) => state.auth.user);
  const orgId = user?.organization?.id ?? "";

  const { data, isLoading, isError, refetch } = useGetLeavePolicies(orgId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const policies = data?.data ?? [];

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

  const activePolicies = policies.filter((p) => p.active).length;
  const avgDays =
    policies.length > 0
      ? Math.round(
          policies.reduce((sum, p) => sum + p.maxDays, 0) / policies.length
        )
      : 0;

  const handleRefetchAfterChange = () => {
    queryClient.invalidateQueries(["leave-policies", orgId] as any);
    refetch();
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leave Policies</h1>
          <p className="text-muted-foreground text-sm">
            Manage and configure leave policies for your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? (
              <Table className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="w-4 h-4" /> Create Policy
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Policies" value={policies.length} />
        <StatCard title="Active Policies" value={activePolicies} />
        <StatCard title="Avg Max Days" value={avgDays} />
        <StatCard
          title="Total Leave Days"
          value={policies.reduce((sum, p) => sum + p.maxDays, 0)}
        />
      </div>

      {/* Main View */}
      {viewMode === "grid" ? (
        <GridView
          policies={policies}
          onEdit={setEditingPolicy}
          onDelete={setDeletingPolicy}
        />
      ) : (
        <TableView
          policies={policies}
          onEdit={setEditingPolicy}
          onDelete={setDeletingPolicy}
        />
      )}

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
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground uppercase mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ---------- GRID VIEW ---------- */
function GridView({ policies, onEdit, onDelete }: any) {
  if (policies.length === 0)
    return (
      <p className="text-center text-muted-foreground py-10">
        No policies found.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {policies.map((policy: any) => (
        <Card
          key={policy.id}
          className="border border-border/60 hover:shadow-lg transition-all"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{policy.name}</CardTitle>
                <CardDescription>{policy.description}</CardDescription>
              </div>
              <span
                className={cn(
                  "px-2 py-1 text-xs font-semibold rounded-full",
                  policy.active
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground"
                )}
              >
                {policy.active ? "Active" : "Inactive"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 text-sm gap-2">
              <div>
                <p className="text-muted-foreground text-xs">Max Days</p>
                <p className="font-medium">{policy.maxDays}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Carry Forward</p>
                <p className="font-medium">{policy.carryForward}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Min Notice</p>
                <p className="font-medium">{policy.minNotice} days</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Approval Required
                </p>
                <p className="font-medium">
                  {policy.requiresApproval ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(policy)}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(policy)}
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------- TABLE VIEW ---------- */
function TableView({ policies, onEdit, onDelete }: any) {
  return (
    <Card className="border border-border/60">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <Th>Policy</Th>
              <Th>Max Days</Th>
              <Th>Carry Forward</Th>
              <Th>Approval</Th>
              <Th>Min Notice</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p: any) => (
              <tr
                key={p.id}
                className="border-b hover:bg-secondary/20 transition"
              >
                <Td>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                </Td>
                <Td>{p.maxDays}</Td>
                <Td>{p.carryForward}</Td>
                <Td>{p.requiresApproval ? "Yes" : "No"}</Td>
                <Td>{p.minNotice} days</Td>
                <Td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.active
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(p)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">
    {children}
  </th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="p-4 align-top">{children}</td>
);
