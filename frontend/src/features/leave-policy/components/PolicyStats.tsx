import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, TrendingUp, Shield } from "lucide-react";
import type { LeavePolicyStats } from "../leavePolicyService";

interface PolicyStatsProps {
  stats?: LeavePolicyStats;
}

export function PolicyStats({ stats }: PolicyStatsProps) {
  const s = {
    total: stats?.total ?? 0,
    active: stats?.active ?? 0,
    avgDays: stats?.avgDays ?? 0,
    totalDays: stats?.totalDays ?? 0,
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Total Policies
              </p>
              <FileText className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-3xl font-bold text-primary">{s.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">Active</p>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{s.active}</p>
          </div>
        </CardContent>
      </Card>
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
              {s.avgDays}
            </p>
          </div>
        </CardContent>
      </Card>
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
              {s.totalDays}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
