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
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  Building2,
  Users2,
} from "lucide-react";
import { EditMemberDialog } from "./components/EditMemberDialog";
import { InviteDialog } from "./components/InviteDialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { useGetOrganizationById } from "./useOrganization";
import { OrganizationSkeleton } from "./components/OrganizationSkeleton";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function OrganizationPage() {
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const { data, isLoading, isError, error, refetch } = useGetOrganizationById(
    user?.organization?.id ?? ""
  );

  if (isLoading) return <OrganizationSkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <p className="text-destructive font-semibold text-lg">
          {error.response?.data?.message || "Failed to load organization."}
        </p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );

  const org = data?.data;
  if (!org)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <p className="text-muted-foreground text-lg">
          No organization data available.
        </p>
        <Button onClick={() => refetch()}>Reload</Button>
      </div>
    );

  const members = org.users || [];

  const roleStats = [
    { role: "ADMIN", count: members.filter((m) => m.role === "ADMIN").length },
    { role: "HR", count: members.filter((m) => m.role === "HR").length },
    {
      role: "EMPLOYEE",
      count: members.filter((m) => m.role === "EMPLOYEE").length,
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold">{org.organizationName}</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Code: <span className="font-mono">{org.organizationCode}</span>
          </p>
          {org.organizationDescription && (
            <p className="text-sm mt-1 text-muted-foreground">
              {org.organizationDescription}
            </p>
          )}
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roleStats.map((stat) => (
          <Card
            key={stat.role}
            className="border border-border/40 transition hover:shadow-md bg-muted/30"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.role}</p>
                <p className="text-3xl font-bold">{stat.count}</p>
              </div>
              <Users2 className="text-muted-foreground w-6 h-6" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Directory */}
      <Card className="overflow-hidden border border-border/40 bg-muted/30">
        <CardHeader className="border-b border-border/40 flex justify-between">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Total {members.length} members</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No members found in this organization.
            </div>
          ) : (
            <div className="relative max-h-[420px] overflow-y-auto overflow-x-auto rounded-b-md custom-scrollbar">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-muted/40 backdrop-blur-sm z-10 border-b border-border/40">
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Member
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Email
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Role
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Manager
                    </th>
                    <th className="p-4 text-right font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                    >
                      {/* Member */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium">
                          {m.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {m.username}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="p-4 text-muted-foreground">{m.email}</td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full",
                            "border border-border/50 bg-background/40",
                            "px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                          )}
                        >
                          {m.role}
                        </span>
                      </td>

                      {/* Manager */}
                      <td className="p-4 text-muted-foreground">
                        {m.manager?.username || "-"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10"
                          onClick={() => setEditingMember(m)}
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10"
                          onClick={() => setDeletingId(m.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
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
      <InviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        members={members}
      />
      {editingMember && (
        <EditMemberDialog
          open={!!editingMember}
          onOpenChange={(open: boolean) => !open && setEditingMember(null)}
          member={editingMember}
          members={members}
        />
      )}
      {deletingId && (
        <DeleteConfirmDialog
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
          onConfirm={() => setDeletingId(null)}
          title="Remove Member"
          description="Are you sure you want to remove this member?"
        />
      )}
    </div>
  );
}
