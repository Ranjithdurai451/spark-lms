// features/dashboard/components/ViewHolidaysDialog.tsx
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isFuture, isPast, differenceInDays } from "date-fns";

interface ViewHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holidays: any[];
}

export function ViewHolidaysDialog({
  open,
  onOpenChange,
  holidays,
}: ViewHolidaysDialogProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const { upcoming, past, byMonth } = useMemo(() => {
    const sortedHolidays = [...holidays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const upcomingList = sortedHolidays.filter(
      (h) => isFuture(new Date(h.date)) || isToday(new Date(h.date))
    );

    const pastList = sortedHolidays.filter(
      (h) => isPast(new Date(h.date)) && !isToday(new Date(h.date))
    );

    // Group by month
    const monthGroups: Record<string, any[]> = {};
    sortedHolidays.forEach((h) => {
      const monthKey = format(new Date(h.date), "MMMM yyyy");
      if (!monthGroups[monthKey]) monthGroups[monthKey] = [];
      monthGroups[monthKey].push(h);
    });

    return {
      upcoming: upcomingList,
      past: pastList,
      byMonth: Object.entries(monthGroups),
    };
  }, [holidays]);

  const getTypeColor = (type: string) => {
    return type === "PUBLIC"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400";
  };

  const getDaysUntil = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 0) return `In ${days} days`;
    return null;
  };

  const renderHolidayCard = (holiday: any) => {
    const holidayDate = new Date(holiday.date);
    const isHappeningToday = isToday(holidayDate);
    const daysUntil = getDaysUntil(holidayDate);

    return (
      <div
        key={holiday.id}
        className={cn(
          "group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg",
          isHappeningToday
            ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-md"
            : "bg-card hover:border-primary/50"
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Date Box */}
            <div
              className={cn(
                "shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-sm",
                isHappeningToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <span className="text-xs font-medium uppercase">
                {format(holidayDate, "MMM")}
              </span>
              <span className="text-2xl font-bold">
                {format(holidayDate, "dd")}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate">
                    {holiday.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {format(holidayDate, "EEEE, MMMM dd, yyyy")}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs border shrink-0",
                    getTypeColor(holiday.type)
                  )}
                >
                  {holiday.type}
                </Badge>
              </div>

              {holiday.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {holiday.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {daysUntil && isFuture(holidayDate) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{daysUntil}</span>
                    </div>
                  )}
                  {holiday.recurring && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      Recurring
                    </Badge>
                  )}
                </div>
                {isHappeningToday && (
                  <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
                    Happening Today
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUpcoming = () => {
    if (upcoming.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No upcoming holidays
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back later for future holidays
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {upcoming.map((holiday) => renderHolidayCard(holiday))}
      </div>
    );
  };

  const renderPast = () => {
    if (past.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No past holidays
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {past.map((holiday) => renderHolidayCard(holiday))}
      </div>
    );
  };

  const renderByMonth = () => {
    if (byMonth.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No holidays found
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {byMonth.map(([monthYear, monthHolidays]) => (
          <div key={monthYear} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{monthYear}</h3>
                <p className="text-xs text-muted-foreground">
                  {monthHolidays.length} holiday
                  {monthHolidays.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-3 pl-10">
              {monthHolidays.map((holiday) => renderHolidayCard(holiday))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">
                Holidays {new Date().getFullYear()}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {holidays.length} total • {upcoming.length} upcoming •{" "}
                {past.length} past
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="text-xs">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                By Month
              </TabsTrigger>
              <TabsTrigger value="past" className="text-xs">
                Past ({past.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <TabsContent value="upcoming" className="mt-0">
              {renderUpcoming()}
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              {renderByMonth()}
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {renderPast()}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
