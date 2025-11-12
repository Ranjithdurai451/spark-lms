import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  icon: LucideIcon;
  iconColor: string;
  color: string;
  title: string;
  value: string;
  unit?: string;
  subtext: string;
  trend: string;
}

export function DashboardStatCard({
  icon: Icon,
  iconColor,
  color,
  title,
  value,
  unit,
  subtext,
  trend,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br",
        color
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-bold">{value}</p>
              {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
            </div>
            <p className="text-xs text-muted-foreground">{subtext}</p>
            <p className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
