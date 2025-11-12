// features/holidays/HolidaysPage.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, X, CalendarDays } from "lucide-react";

import { AddHolidayDialog } from "./components/AddHolidayDialog";
import { EditHolidayDialog } from "./components/EditHolidayDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { HolidayCard } from "./components/HolidayCard";
import { HolidayTableRow } from "./components/HolidayTableRow";
import { HolidayStats } from "./components/HolidayStats";
import { useGetHolidays, useHolidaysFilters } from "./useHolidays";
import { queryClient } from "../root/Providers";
import { HolidaySkeleton } from "./components/HolidaysSkeleton";
import ErrorPage from "../common/components/ErrorPage";
import { PageHeader } from "../common/components/PageHeader";
import { ViewModeToggle } from "../common/components/ViewModeToggle";
import { useAuth } from "../auth/useAuth";

export function HolidaysPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user, hasAccess } = useAuth();
  const orgId = user?.organization?.id ?? "";

  const { data, isLoading, isError, refetch, isFetching } =
    useGetHolidays(orgId);
  const holidays = data?.data ?? [];

  const { filteredHolidays, stats } = useHolidaysFilters(
    holidays,
    activeTab,
    searchQuery
  );

  const canManage = hasAccess(["ADMIN", "HR"]);

  const handleRefetch = () => {
    queryClient.invalidateQueries(["holidays", orgId] as any);
  };

  if (isLoading) return <HolidaySkeleton />;
  if (isError)
    return <ErrorPage message="Failed to load holidays." refetch={refetch} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Holidays"
          description="Manage organization and public holidays"
          isLoading={isFetching}
          action={
            canManage && (
              <Button
                size="default"
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4" /> Add Holiday
              </Button>
            )
          }
        />

        <HolidayStats stats={stats} />

        {/* Main Content Card */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Holiday Calendar</h2>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
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
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
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
                ) : canManage ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Holiday
                  </Button>
                ) : null}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredHolidays.map((holiday) => (
                  <HolidayCard
                    key={holiday.id}
                    holiday={holiday}
                    canManage={canManage}
                    onEdit={() => setEditingHoliday(holiday)}
                    onDelete={() => setDeletingId(holiday.id)}
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
                      <HolidayTableRow
                        key={holiday.id}
                        holiday={holiday}
                        canManage={canManage}
                        onEdit={() => setEditingHoliday(holiday)}
                        onDelete={() => setDeletingId(holiday.id)}
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
          <AddHolidayDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSuccess={handleRefetch}
          />
        )}
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
