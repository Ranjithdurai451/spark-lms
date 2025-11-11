// features/leaves/components/ViewLeaveDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  CalendarDays,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Leave } from "../MyleavesService";

export function ViewLeaveDialog({
  leave,
  open,
  onOpenChange,
}: {
  leave: Leave | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!leave) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "CANCELLED":
        return <Ban className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30";
      case "CANCELLED":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Leave Request
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(leave.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge
              className={cn(
                "gap-1.5 shrink-0 border",
                getStatusColor(leave.status)
              )}
            >
              {getStatusIcon(leave.status)}
              <span className="text-xs font-medium">{leave.status}</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Leave Type & Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <p className="text-xs font-medium">Leave Type</p>
              </div>
              <p className="text-sm font-semibold">{leave.type}</p>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <CalendarDays className="w-4 h-4" />
                <p className="text-xs font-medium">Duration</p>
              </div>
              <p className="text-sm font-semibold text-primary">
                {leave.days} day{leave.days > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <p className="text-xs font-medium">Leave Period</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-medium">
                  {format(new Date(leave.startDate), "dd MMM yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(leave.startDate), "EEEE")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-medium">
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(leave.endDate), "EEEE")}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {leave.reason && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs font-medium">Reason</p>
              </div>
              <p className="text-sm leading-relaxed p-3 rounded-lg bg-muted/30">
                {leave.reason}
              </p>
            </div>
          )}

          <Separator />

          {/* Approver Info */}
          {leave.approver && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <p className="text-xs font-medium">
                  {leave.status === "APPROVED"
                    ? "Approved By"
                    : leave.status === "REJECTED"
                    ? "Rejected By"
                    : "Assigned Approver"}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {leave.approver.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {leave.approver.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {leave.approver.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between py-2">
              <span>Applied on</span>
              <span className="font-medium text-foreground">
                {format(new Date(leave.createdAt), "dd MMM yyyy, hh:mm a")}
              </span>
            </div>
            {leave.updatedAt !== leave.createdAt && (
              <div className="flex items-center justify-between py-2 border-t">
                <span>Last updated</span>
                <span className="font-medium text-foreground">
                  {format(new Date(leave.updatedAt), "dd MMM yyyy, hh:mm a")}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
