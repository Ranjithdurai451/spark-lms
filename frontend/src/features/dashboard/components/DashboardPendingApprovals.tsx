import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { PendingApproval } from "@/features/profile/profileService";

export function DashboardPendingApprovals({
  requests,
  onApprove,
  onReject,
}: {
  requests: PendingApproval[];
  onApprove: (leave: any) => void;
  onReject: (leave: any) => void;
}) {
  if (!requests.length) return null;
  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Pending Approvals
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Requests awaiting your review
            </CardDescription>
          </div>
          <Badge className="bg-accent text-accent-foreground border-accent text-xs font-bold">
            {requests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3 max-h-[350px] overflow-y-auto ">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{req.employee}</p>
                  <Badge variant="outline" className="text-xs">
                    {req.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{req.dates}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  Reason: {req.reason}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onApprove(req.leave)}
                  className="flex-1 sm:flex-none h-8 text-xs bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(req.leave)}
                  className="flex-1 sm:flex-none h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  <AlertCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
