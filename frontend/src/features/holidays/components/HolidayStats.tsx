import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CalendarDays } from "lucide-react";
import type { HolidayStats } from "../holidayService";
interface HolidayStatsProps {
  stats?: HolidayStats;
}

export function HolidayStats({ stats }: HolidayStatsProps) {
  const s = {
    total: stats?.total ?? 0,
    public: stats?.public ?? 0,
    company: stats?.company ?? 0,
  };
  return (
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
            <p className="text-3xl font-bold text-primary">{s.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">Public</p>
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{s.public}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/50 to-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-accent-foreground">
                Company
              </p>
              <CalendarDays className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-accent-foreground">
              {s.company}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
