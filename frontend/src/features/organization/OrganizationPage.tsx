import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users2, Search, X } from "lucide-react";
import { EditMemberDialog } from "./components/EditMemberDialog";
import { InviteDialog } from "./components/InviteDialog";
import {
  useGetOrganizationById,
  useOrganizationMembers,
} from "./useOrganization";
import { OrganizationSkeleton } from "./components/OrganizationSkeleton";
import { queryClient } from "../root/Providers";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import ErrorPage from "../common/components/ErrorPage";
import { PageHeader } from "../common/components/PageHeader";
import OrganizationPageStats from "./components/OrganizationPageStats";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import { MemberCard } from "./components/MemberCard";
import { MemberTableRow } from "./components/MemberTableRow";
import { getRoleColor } from "./utils";
import { useAuth } from "../auth/useAuth";

export function OrganizationPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { user, hasAccess, isCurrentUser } = useAuth();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetOrganizationById(user?.organization?.id ?? "");

  const org = data?.data;
  const members = org?.users || [];

  const { filteredMembers, roleStats } = useOrganizationMembers(
    members,
    searchQuery
  );
  const canManage = hasAccess(["ADMIN", "HR"]);

  const handleRefetchAfterChange = () => {
    if (org?.id) {
      queryClient.invalidateQueries(["organization", org.id] as any);
    }
  };

  if (isLoading) return <OrganizationSkeleton />;

  if (isError)
    return (
      <ErrorPage
        message={
          error.response?.data?.message || "Failed to load organization."
        }
        refetch={refetch}
      />
    );

  if (!org)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Users2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">
          No organization data available.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Reload
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={org.organizationName}
          isLoading={isFetching}
          subtitle={
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs">{org.organizationCode}</span>
              {org.organizationDescription && (
                <>
                  <span>•</span>
                  <span className="text-xs">{org.organizationDescription}</span>
                </>
              )}
            </div>
          }
          action={
            canManage && (
              <Button
                size="default"
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsInviteOpen(true)}
              >
                <Plus className="w-4 h-4" /> Invite Member
              </Button>
            )
          }
        />

        <OrganizationPageStats roleStats={roleStats} />

        {/* Main Content Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <h2 className="text-lg font-semibold mb-2">
                  Employee Directory
                </h2>

                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, role, or manager..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-9 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {filteredMembers.length}{" "}
                  {filteredMembers.length === 1 ? "member" : "members"}
                  {searchQuery && ` found for "${searchQuery}"`}
                </p>
              </div>

              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Users2 className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-lg font-medium text-foreground">
                  {searchQuery ? "No members found" : "No members yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery
                    ? `Try adjusting your search for "${searchQuery}"`
                    : "Start by inviting team members"}
                </p>
                {searchQuery ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Search
                  </Button>
                ) : canManage ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </Button>
                ) : null}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isCurrent={isCurrentUser(member.id)}
                    canManage={canManage && !isCurrentUser(member.id)}
                    getRoleColor={getRoleColor}
                    onEdit={() => setEditingMember(member)}
                    onDelete={() => setDeletingId(member.id)}
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
                        MEMBER
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        EMAIL
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        ROLE
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        MANAGER
                      </th>
                      {canManage && (
                        <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                          ACTIONS
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <MemberTableRow
                        key={member.id}
                        member={member}
                        isCurrent={isCurrentUser(member.id)}
                        canManage={canManage && !isCurrentUser(member.id)}
                        canManageMembers={canManage}
                        getRoleColor={getRoleColor}
                        onEdit={() => setEditingMember(member)}
                        onDelete={() => setDeletingId(member.id)}
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
          <InviteDialog
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            members={members}
          />
        )}

        {editingMember && (
          <EditMemberDialog
            open={!!editingMember}
            onOpenChange={(open: boolean) => {
              if (!open) setEditingMember(null);
              handleRefetchAfterChange();
            }}
            member={editingMember}
            members={members}
          />
        )}

        {deletingId && (
          <DeleteConfirmDialog
            open={!!deletingId}
            onOpenChange={(open: boolean) => {
              if (!open) setDeletingId(null);
              handleRefetchAfterChange();
            }}
            userId={deletingId}
            username={
              members.find((m) => m.id === deletingId)?.username || "this user"
            }
          />
        )}
      </div>
    </div>
  );
}
