// features/holidays/HolidaysPage.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCcw,
  CalendarDays,
  Search,
  X,
  MoreHorizontal,
  TrendingUp,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  Loader,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AddHolidayDialog } from "./components/AddHolidayDialog";
import { EditHolidayDialog } from "./components/EditHolidayDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useGetHolidays } from "./useHolidays";
import { useAppSelector } from "@/lib/hooks";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { HolidaySkeleton } from "./components/HolidaysSkeleton";
import { format } from "date-fns";

export function HolidaysPage() {
  // ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const user = useAppSelector((state) => state.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } =
    useGetHolidays(orgId);
  const holidays = data?.data ?? [];

  // Filter by type - useMemo to prevent recalculation
  const filteredByType = useMemo(() => {
    return activeTab === "all"
      ? holidays
      : holidays.filter((h) => h.type.toLowerCase() === activeTab);
  }, [holidays, activeTab]);

  // Filter by search - useMemo to prevent recalculation
  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;

    const query = searchQuery.toLowerCase();
    return filteredByType.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.description?.toLowerCase().includes(query) ||
        format(new Date(h.date), "MMM dd, yyyy").toLowerCase().includes(query)
    );
  }, [filteredByType, searchQuery]);

  const stats = useMemo(
    () => ({
      total: holidays.length,
      public: holidays.filter((h) => h.type === "PUBLIC").length,
      company: holidays.filter((h) => h.type === "COMPANY").length,
    }),
    [holidays]
  );

  const handleRefetch = () => {
    queryClient.invalidateQueries(["holidays", orgId] as any);
    // refetch();
  };

  // NOW CONDITIONAL RETURNS - AFTER ALL HOOKS
  if (isLoading) return <HolidaySkeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center">
        <p className="text-destructive font-semibold text-lg">
          Failed to load holidays.
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
                Holidays
              </h1>
              {isFetching && (
                <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage organization and public holidays
            </p>
          </div>
          <Button
            size="default"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Holiday
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Holidays
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
                    Public
                  </p>
                  <CalendarDays className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {stats.public}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Company
                  </p>
                  <CalendarDays className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                  {stats.company}
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
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Holiday Calendar</h2>

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

                {/* Tabs + Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-background">
                      <TabsTrigger value="all" className="text-xs">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="public" className="text-xs">
                        Public
                      </TabsTrigger>
                      <TabsTrigger value="company" className="text-xs">
                        Company
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search holidays..."
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
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {filteredHolidays.length}{" "}
                  {filteredHolidays.length === 1 ? "holiday" : "holidays"}
                  {searchQuery && ` found for "${searchQuery}"`}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredHolidays.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <CalendarDays className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-lg font-medium text-foreground">
                  {searchQuery ? "No holidays found" : "No holidays yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery
                    ? `Try adjusting your search for "${searchQuery}"`
                    : "Start by adding your first holiday"}
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
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Holiday
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredHolidays.map((holiday) => (
                  <Card
                    key={holiday.id}
                    className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
                    <CardContent className="p-4 pl-5">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {holiday.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] h-5",
                                  holiday.type === "PUBLIC"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:border-none dark:bg-green-950/30"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:border-none dark:bg-yellow-950/30"
                                )}
                              >
                                {holiday.type}
                              </Badge>
                              {holiday.recurring && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5"
                                >
                                  Recurring
                                </Badge>
                              )}
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
                                onClick={() => setEditingHoliday(holiday)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingId(holiday.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium">
                            {format(
                              new Date(holiday.date),
                              "EEEE, MMMM dd, yyyy"
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        {holiday.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
                            {holiday.description}
                          </p>
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
                        NAME
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        DATE
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        TYPE
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-muted-foreground">
                        RECURRING
                      </th>
                      <th className="p-4 text-right text-xs font-semibold text-muted-foreground">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolidays.map((holiday) => (
                      <tr
                        key={holiday.id}
                        className="border-b hover:bg-muted/30 transition-colors group"
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">
                              {holiday.name}
                            </p>
                            {holiday.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {holiday.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {format(new Date(holiday.date), "MMM dd, yyyy")}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              holiday.type === "PUBLIC"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30"
                            )}
                          >
                            {holiday.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {holiday.recurring ? "Yes" : "No"}
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
                                onClick={() => setEditingHoliday(holiday)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingId(holiday.id)}
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
        <AddHolidayDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleRefetch}
        />
        {editingHoliday && (
          <EditHolidayDialog
            holiday={editingHoliday}
            open={!!editingHoliday}
            onOpenChange={(o) => !o && setEditingHoliday(null)}
            onSuccess={handleRefetch}
          />
        )}
        {deletingId && (
          <DeleteConfirmDialog
            open={!!deletingId}
            onOpenChange={(o) => !o && setDeletingId(null)}
            holidayId={deletingId}
            onSuccess={handleRefetch}
          />
        )}
      </div>
    </div>
  );
}
