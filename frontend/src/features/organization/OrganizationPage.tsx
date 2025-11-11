// features/organization/OrganizationPage.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  Users2,
  Mail,
  MoreHorizontal,
  UserCircle,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  Search,
  X,
  TrendingUp,
  Loader,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EditMemberDialog } from "./components/EditMemberDialog";
import { InviteDialog } from "./components/InviteDialog";
import { useGetOrganizationById } from "./useOrganization";
import { OrganizationSkeleton } from "./components/OrganizationSkeleton";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { queryClient } from "../root/Providers";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";

export function OrganizationPage() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetOrganizationById(user?.organization?.id ?? "");

  const org = data?.data;
  const members = org?.users || [];

  // useMemo MUST be called before any conditional returns
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.username.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.manager?.username.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const roleStats = useMemo(
    () => ({
      total: members.length,
      admin: members.filter((m) => m.role === "ADMIN").length,
      hr: members.filter((m) => m.role === "HR").length,
      manager: members.filter((m) => m.role === "MANAGER").length,
      employee: members.filter((m) => m.role === "EMPLOYEE").length,
    }),
    [members]
  );

  // Role color helper function
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:border-none dark:text-yellow-400";
      case "HR":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:border-none dark:text-green-400";
      case "MANAGER":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-none dark:text-red-400";
      case "EMPLOYEE":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:border-none dark:text-gray-400";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const handleRefetchAfterChange = () => {
    if (org?.id) {
      queryClient.invalidateQueries(["organization", org.id] as any);
    }
    refetch();
  };

  // NOW CONDITIONAL RETURNS - AFTER ALL HOOKS
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

  if (!org)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <p className="text-muted-foreground text-lg">
          No organization data available.
        </p>
        <Button onClick={() => refetch()}>Reload</Button>
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
                {org.organizationName}
              </h1>
              {isFetching && (
                <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{org.organizationCode}</span>
              {org.organizationDescription && (
                <>
                  <span>•</span>
                  <span className="text-xs">{org.organizationDescription}</span>
                </>
              )}
            </div>
          </div>
          <Button
            size="default"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus className="w-4 h-4" /> Invite Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Members
                  </p>
                  <TrendingUp className="w-4 h-4 text-primary/60" />
                </div>
                <p className="text-3xl font-bold text-primary">
                  {roleStats.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Admin
                  </p>
                  <Users2 className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                  {roleStats.admin}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">
                    HR
                  </p>
                  <Users2 className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {roleStats.hr}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">
                    Manager
                  </p>
                  <Users2 className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {roleStats.manager}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Employee
                  </p>
                  <Users2 className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                  {roleStats.employee}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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

              {/* View Toggle */}
              <div className="flex gap-1 border rounded-lg p-1 bg-background shrink-0">
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
            {filteredMembers.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
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
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredMembers.map((member) => (
                  <Card
                    key={member.id}
                    className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
                    <CardContent className="p-4 pl-5">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {member.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">
                                {member.username}
                              </p>
                              <Badge
                                className={cn(
                                  "mt-1 text-[10px] h-5 font-medium border",
                                  getRoleColor(member.role)
                                )}
                              >
                                {member.role}
                              </Badge>
                            </div>
                          </div>

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
                                onClick={() => setEditingMember(member)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingId(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        {/* Manager */}
                        {member.manager && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <UserCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-muted-foreground">
                                Reports to
                              </p>
                              <p className="text-xs font-medium truncate">
                                {member.manager.username}
                              </p>
                            </div>
                          </div>
                        )}
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
                      <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {member.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">
                              {member.username}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {member.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={cn(
                              "text-xs font-medium border",
                              getRoleColor(member.role)
                            )}
                          >
                            {member.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {member.manager?.username || "-"}
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
                                onClick={() => setEditingMember(member)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingId(member.id)}
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
        <InviteDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          members={members}
        />

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
