import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, RefreshCcw, CalendarDays } from "lucide-react";
import { AddHolidayDialog } from "./components/AddHolidayDialog";
import { EditHolidayDialog } from "./components/EditHolidayDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useGetHolidays } from "./useHolidays";
import { useAppSelector } from "@/lib/hooks";
import { queryClient } from "../root/Providers";
import { cn } from "@/lib/utils";
import { HolidaySkeleton } from "./components/HolidaysSkeleton";

export function HolidaysPage() {
  const user = useAppSelector((state) => state.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [filterType, setFilterType] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetHolidays(orgId);
  const holidays = data?.data ?? [];

  const handleRefetch = () => {
    queryClient.invalidateQueries(["holidays", orgId] as any);
    refetch();
  };

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

  const filteredHolidays = filterType
    ? holidays.filter((h) => h.type === filterType)
    : holidays;

  const publicCount = holidays.filter((h) => h.type === "PUBLIC").length;
  const companyCount = holidays.filter((h) => h.type === "COMPANY").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Holidays</h1>
            <p className="text-sm text-muted-foreground">
              Manage organization and public holidays
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Add Holiday
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Holidays", count: holidays.length },
          { title: "Public Holidays", count: publicCount },
          { title: "Company Holidays", count: companyCount },
        ].map((stat, idx) => (
          <Card
            key={idx}
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
          { label: "All", key: null, count: holidays.length },
          { label: "Public", key: "PUBLIC", count: publicCount },
          { label: "Company", key: "COMPANY", count: companyCount },
        ].map((tab) => (
          <button
            key={tab.key ?? "all"}
            onClick={() => setFilterType(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition",
              filterType === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Holiday Table or Empty State */}
      {filteredHolidays.length === 0 ? (
        <Card className="border border-border/40 bg-muted/20">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No holidays found. Click{" "}
              <span className="font-medium text-primary">“Add Holiday”</span> to
              create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-border/40 bg-muted/30">
          <CardHeader className="border-b border-border/40 flex justify-between">
            <div>
              <CardTitle>All Holidays</CardTitle>
              <CardDescription>
                Showing {filteredHolidays.length} of {holidays.length}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative max-h-[420px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-muted/40 backdrop-blur-sm border-b border-border/40 z-10">
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="p-4 text-left font-semibold text-muted-foreground">
                      Frequency
                    </th>
                    <th className="p-4 text-right font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHolidays.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground">
                        {h.name}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(h.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            h.type === "PUBLIC"
                              ? "text-blue-600 border-blue-400"
                              : "text-green-600 border-green-400"
                          )}
                        >
                          {h.type === "PUBLIC" ? "Public" : "Company"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className="text-xs bg-background/50"
                        >
                          {h.recurring ? "Recurring" : "One-time"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-primary/10"
                          onClick={() => setEditingHoliday(h)}
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-destructive/10"
                          onClick={() => setDeletingId(h.id)}
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
  );
}
