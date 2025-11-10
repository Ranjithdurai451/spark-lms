"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, UserCheck } from "lucide-react";
import { EditLeaveDialog } from "./components/EditLeaveDialog";
import { DeleteLeaveDialog } from "./components/DeleteLeaveDialog";
import { useAppSelector } from "@/lib/hooks";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { useGetLeaves } from "./useLeaves";
import { LeaveSkeleton } from "./components/LeaveSkeleton";
import { AddLeaveDialog } from "./components/AddLeaveDialog";

export function LeavesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetLeaves(orgId);
  const leaves = data?.data ?? [];

  const handleRefetch = () => {
    queryClient.invalidateQueries(["leaves", orgId] as any);
    refetch();
  };

  if (isLoading) return <LeaveSkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <p className="text-destructive font-semibold">Failed to load leaves</p>
        <Button onClick={() => refetch()} className="gap-2">
          Retry
        </Button>
      </div>
    );

  const filteredLeaves = filterStatus
    ? leaves.filter((l) => l.status === filterStatus.toUpperCase())
    : leaves;

  const pending = leaves.filter((l) => l.status === "PENDING").length;
  const approved = leaves.filter((l) => l.status === "APPROVED").length;
  const rejected = leaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Leave Requests</h1>
            <p className="text-sm text-muted-foreground">
              Manage employee leave requests
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Request Leave
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Requests", count: leaves.length },
          { title: "Approved", count: approved },
          { title: "Pending", count: pending },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border border-border/40 bg-muted/30 hover:shadow-sm transition"
          >
            <CardContent className="p-6 space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h2 className="text-3xl font-bold">{stat.count}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-1 overflow-x-auto">
        {[
          { label: "All", key: null, count: leaves.length },
          { label: "Pending", key: "PENDING", count: pending },
          { label: "Approved", key: "APPROVED", count: approved },
          { label: "Rejected", key: "REJECTED", count: rejected },
        ].map((tab) => (
          <button
            key={tab.key ?? "all"}
            onClick={() => setFilterStatus(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition",
              filterStatus === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredLeaves.length === 0 ? (
        <Card className="border border-border/40 bg-muted/20">
          <CardContent className="p-12 text-center space-y-3">
            <p className="text-muted-foreground">
              No leave requests found. Click{" "}
              <span className="font-medium text-primary">“Request Leave”</span>{" "}
              to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/40 bg-muted/30 overflow-hidden">
          <CardHeader className="border-b border-border/40">
            <CardTitle>All Leave Requests</CardTitle>
            <CardDescription>
              Showing {filteredLeaves.length} of {leaves.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-muted/40 border-b border-border/40">
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Employee
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Dates
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Days
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Reason
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 text-right font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-border/20 hover:bg-secondary/20"
                    >
                      <td className="p-4 font-medium">
                        {l.employee?.username ?? "N/A"}
                      </td>
                      <td className="p-4">{l.type}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(l.startDate).toLocaleDateString()} -{" "}
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">{l.days}</td>
                      <td className="p-4 text-muted-foreground">{l.reason}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            l.status === "APPROVED"
                              ? "text-green-600 border-green-400"
                              : l.status === "REJECTED"
                              ? "text-red-600 border-red-400"
                              : "text-yellow-600 border-yellow-400"
                          )}
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingLeave(l)}
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingId(l.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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
      <AddLeaveDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleRefetch}
      />
      {editingLeave && (
        <EditLeaveDialog
          leave={editingLeave}
          open={!!editingLeave}
          onOpenChange={(o) => !o && setEditingLeave(null)}
          onSuccess={handleRefetch}
        />
      )}
      {deletingId && (
        <DeleteLeaveDialog
          open={!!deletingId}
          onOpenChange={(o) => !o && setDeletingId(null)}
          leaveId={deletingId}
          onSuccess={handleRefetch}
        />
      )}
    </div>
  );
}
