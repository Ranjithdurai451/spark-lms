import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, TrendingUp, Shield } from "lucide-react";

interface PolicyStatsProps {
  stats: {
    total: number;
    active: number;
    avgDays: number;
    totalDays: number;
  };
}

export function PolicyStats({ stats }: PolicyStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Total */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Total Policies
              </p>
              <FileText className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
        </CardContent>
      </Card>

      {/* Active */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">Active</p>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.active}</p>
          </div>
        </CardContent>
      </Card>

      {/* Avg Days */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/50 to-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-accent-foreground">
                Avg Days
              </p>
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-accent-foreground">
              {stats.avgDays}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Days */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary to-secondary/80">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-secondary-foreground">
                Total Days
              </p>
              <Shield className="w-4 h-4 text-secondary-foreground" />
            </div>
            <p className="text-3xl font-bold text-secondary-foreground">
              {stats.totalDays}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
