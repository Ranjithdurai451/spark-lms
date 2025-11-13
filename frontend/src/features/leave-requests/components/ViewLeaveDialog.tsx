// features/leave-requests/components/ViewLeaveDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LeaveRequest } from "../LeaveRequestsService";

interface ViewLeaveDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewLeaveDialog({
  leave,
  open,
  onOpenChange,
}: ViewLeaveDialogProps) {
  if (!leave) return null;

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

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      "Annual Leave":
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
      "Sick Leave":
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
      "Casual Leave":
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
      "Maternity Leave":
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
      "Paternity Leave":
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400",
      "Unpaid Leave":
        "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400",
    };

    return typeColors[type] || "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            Leave Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Employee Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Employee</p>
                <p className="text-sm font-medium">{leave.employee.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{leave.employee.email}</p>
              </div>
            </div>
          </div>

          {/* Leave Type & Status */}
          <div className="flex gap-2">
            <Badge
              className={cn(
                "font-medium border flex-1 justify-center",
                getTypeColor(leave.type)
              )}
            >
              {leave.type}
            </Badge>
            <Badge
              className={cn(
                "font-medium border flex-1 justify-center",
                getStatusColor(leave.status)
              )}
            >
              {leave.status}
            </Badge>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">
                  {format(new Date(leave.startDate), "dd MMM yyyy")} -{" "}
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Days</p>
                <p className="text-sm font-medium">
                  {leave.days} day{leave.days > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {leave.reason && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reason</p>
              <p className="text-sm p-3 bg-muted/50 rounded-lg">
                {leave.reason}
              </p>
            </div>
          )}

          {/* Approver */}
          {leave.approver && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {leave.status === "APPROVED" || leave.status === "REJECTED"
                  ? "Actioned by"
                  : "Assigned to"}
              </p>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {leave.approver.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leave.approver.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Applied On</p>
              <p className="text-sm font-medium">
                {format(new Date(leave.createdAt), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {format(new Date(leave.updatedAt), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
