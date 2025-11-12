import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import type { Holiday } from "@/features/holidays/holidayService";

interface Props {
  holidays: Holiday[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onViewAll: () => void;
  setIndex: (idx: number) => void;
}

export function DashboardHolidaySlider({
  holidays,
  index,
  onPrev,
  onNext,
  onViewAll,
  setIndex,
}: Props) {
  const h = holidays[index];
  if (!h) return null;
  return (
    <Card className="border-none shadow-xl bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Upcoming Holidays</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onViewAll}
          >
            <Eye className="w-3 h-3" /> View All
          </Button>
        </div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPrev}
              disabled={holidays.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-lg">{h.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(h.date), "EEEE, MMMM dd, yyyy")}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    h.type === "PUBLIC"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-accent text-accent-foreground border-accent"
                  )}
                >
                  {h.type}
                </Badge>
                {h.recurring && (
                  <Badge variant="secondary" className="text-xs">
                    Recurring
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {differenceInDays(new Date(h.date), new Date())} days away
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNext}
              disabled={holidays.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {holidays.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {holidays.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndex(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === index
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
