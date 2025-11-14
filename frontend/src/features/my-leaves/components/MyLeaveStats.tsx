import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, XCircle, Ban } from "lucide-react";
import type { MyLeaveStats } from "../MyleavesService";
interface MyLeaveStatsProps {
  stats?: MyLeaveStats;
}
export function MyLeaveStats({ stats }: MyLeaveStatsProps) {
  const s = {
    total: stats?.total ?? 0,
    pending: stats?.pending ?? 0,
    approved: stats?.approved ?? 0,
    rejected: stats?.rejected ?? 0,
    cancelled: stats?.cancelled ?? 0,
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
      {/* Total */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Total Requests
              </p>
              <TrendingUp className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-3xl font-bold text-primary">{s.total}</p>
          </div>
        </CardContent>
      </Card>
      {/* Pending */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/50 to-accent/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-accent-foreground">
                Pending
              </p>
              <Clock className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-accent-foreground">
              {s.pending}
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Approved */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-primary">Approved</p>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{s.approved}</p>
          </div>
        </CardContent>
      </Card>
      {/* Rejected */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-destructive/5 to-destructive/10">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-destructive">Rejected</p>
              <XCircle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-destructive">{s.rejected}</p>
          </div>
        </CardContent>
      </Card>
      {/* Cancelled */}
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-muted/50 to-muted">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Cancelled
              </p>
              <Ban className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-muted-foreground">
              {s.cancelled}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
