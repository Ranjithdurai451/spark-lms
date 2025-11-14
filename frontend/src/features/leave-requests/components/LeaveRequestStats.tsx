import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Ban } from "lucide-react";
import type { LeaveRequestStats } from "../LeaveRequestsService";
interface LeaveRequestStatsProps {
  stats?: LeaveRequestStats;
}

export function LeaveRequestStats({ stats }: LeaveRequestStatsProps) {
  const s = {
    pending: stats?.pending ?? 0,
    approved: stats?.approved ?? 0,
    rejected: stats?.rejected ?? 0,
    cancelled: stats?.cancelled ?? 0,
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
