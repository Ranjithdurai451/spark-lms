import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users2, Search, X } from "lucide-react";
import { EditMemberDialog } from "./components/EditMemberDialog";
import { InviteDialog } from "./components/InviteDialog";
import {
  useDeleteUser,
  useMemberStats,
  useOrganizationMembers,
} from "./useOrganization";
import { PaginationControls } from "../common/components/PaginationControls";
import { queryClient } from "../root/Providers";
import ErrorPage from "../common/components/ErrorPage";
import { PageHeader } from "../common/components/PageHeader";
import OrganizationPageStats from "./components/OrganizationPageStats";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import { MemberCard } from "./components/MemberCard";
import { MemberTableRow } from "./components/MemberTableRow";
import { getRoleColor } from "./utils";
import { useAuth } from "../auth/useAuth";
import { DeleteConfirmDialog } from "../common/components/DeleteConfirmDialog";
import type { OrganizationMember, RoleStats } from "@/lib/types";
import { useDebounce } from "../common/hooks/useDebounce";
import { StatsSkeleton } from "../common/components/skeleton-loaders.tsx/StatsSkeleton";
import { ContentSkeleton } from "../common/components/skeleton-loaders.tsx/ContentSkeleton";

export function OrganizationPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { user, hasAccess, isCurrentUser } = useAuth();
  const orgId = user?.organization?.id ?? "";

  const debouncedSearch = useDebounce(searchQuery, 1000);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const {
    data: membersResponse,
    isLoading: membersLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useOrganizationMembers(orgId, {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
  });
  const { data: fullMembersResponse } = useOrganizationMembers(orgId, {
    getAll: true,
  });

  const { data: statsData, isLoading: statsLoading } = useMemberStats(orgId);

  const members = membersResponse?.data.users ?? [];
  const pagination = membersResponse?.data.pagination;
  const roleStats: RoleStats | undefined = statsData?.data;

  const canManage = hasAccess(["ADMIN", "HR"]);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["organization-members", orgId] as any);
    queryClient.invalidateQueries(["organization-member-stats", orgId] as any);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const { mutate: deleteUser } = useDeleteUser();

  if (isError) {
    return (
      <ErrorPage
        message={
          error?.response?.data?.message || "Failed to load organization."
        }
        refetch={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={user?.organization?.organizationName || "Organization"}
          isLoading={isFetching || statsLoading}
          subtitle={
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs">
                {user?.organization?.organizationCode}
              </span>
              {user?.organization?.organizationDescription && (
                <>
                  <span>•</span>
                  <span className="text-xs">
                    {user.organization.organizationDescription}
                  </span>
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

        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <OrganizationPageStats roleStats={roleStats} />
        )}

        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <h2 className="text-lg font-semibold mb-2">
                  Employee Directory
                </h2>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, role, or manager..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-9 text-sm"
                    disabled={membersLoading}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full p-0.5"
                      disabled={membersLoading}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {membersLoading ? (
                    "Loading members..."
                  ) : (
                    <>
                      {pagination?.total ?? 0}{" "}
                      {pagination?.total === 1 ? "member" : "members"}
                      {searchQuery && ` found for "${searchQuery}"`}
                    </>
                  )}
                </p>
              </div>
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {membersLoading ? (
              <ContentSkeleton viewMode={viewMode} />
            ) : members.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {members.map((member) => (
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
                    {members.map((member) => (
                      <MemberTableRow
                        key={member.id}
                        member={member}
                        isCurrent={isCurrentUser(member.id)}
                        canManage={canManage && !isCurrentUser(member.id)}
                        getRoleColor={getRoleColor}
                        onEdit={() => setEditingMember(member)}
                        onDelete={() => setDeletingId(member.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!membersLoading && pagination && pagination.totalPages > 1 && (
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

        {canManage && (
          <InviteDialog
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            members={fullMembersResponse?.data?.users}
          />
        )}

        {editingMember && (
          <EditMemberDialog
            open={!!editingMember}
            onOpenChange={(open: boolean) => {
              if (!open) setEditingMember(null);
              handleRefetch();
            }}
            member={editingMember}
            members={fullMembersResponse?.data?.users}
          />
        )}

        {deletingId && (
          <DeleteConfirmDialog
            open={!!deletingId}
            onOpenChange={(open) => !open && setDeletingId(null)}
            title="Delete Member"
            description={`Are you sure you want to delete ${
              members.find((m) => m.id === deletingId)?.username || "this user"
            }? This action cannot be undone.`}
            onConfirm={() =>
              new Promise((resolve, reject) => {
                deleteUser(deletingId, {
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
