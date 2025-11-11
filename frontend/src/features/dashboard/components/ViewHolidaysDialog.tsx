// features/dashboard/components/ViewHolidaysDialog.tsx
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isFuture, isPast } from "date-fns";

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
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const sortedHolidays = [...holidays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      upcoming: sortedHolidays.filter(
        (h) => isFuture(new Date(h.date)) || isToday(new Date(h.date))
      ),
      past: sortedHolidays.filter(
        (h) => isPast(new Date(h.date)) && !isToday(new Date(h.date))
      ),
    };
  }, [holidays]);

  const getTypeColor = (type: string) => {
    return type === "PUBLIC"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30"
      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30";
  };

  const renderHolidayList = (holidayList: any[], title: string) => {
    if (holidayList.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="space-y-2">
          {holidayList.map((holiday) => (
            <div
              key={holiday.id}
              className={cn(
                "p-3 rounded-lg border transition-all hover:shadow-md",
                isToday(new Date(holiday.date))
                  ? "bg-primary/5 border-primary"
                  : "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      {holiday.name}
                    </h4>
                    {isToday(new Date(holiday.date)) && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-5">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(holiday.date), "EEEE, MMMM dd, yyyy")}
                    </span>
                  </div>
                  {holiday.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {holiday.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge
                    className={cn("text-xs border", getTypeColor(holiday.type))}
                  >
                    {holiday.type}
                  </Badge>
                  {holiday.recurring && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      Recurring
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            All Holidays - {new Date().getFullYear()}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total {holidays.length} holidays this year
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {holidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="w-16 h-16 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No holidays found</p>
            </div>
          ) : (
            <>
              {renderHolidayList(upcoming, "Upcoming Holidays")}
              {renderHolidayList(past, "Past Holidays")}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
