// features/leave-requests/components/ApproveRejectDialog.tsx
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useUpdateLeaveStatus } from "../useLeaveRequests";
import { queryClient } from "@/features/root/Providers";
import type { LeaveRequest } from "../leaveRequestsService";
import { format } from "date-fns";

interface ApproveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: LeaveRequest;
  action: "APPROVED" | "REJECTED";
  onSuccess: () => void;
}

export function ApproveRejectDialog({
  open,
  onOpenChange,
  leave,
  action,
  onSuccess,
}: ApproveRejectDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateLeaveStatus();
  const [error, setError] = useState<string | null>(null);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default dialog close behavior
    setError(null);

    updateStatus(
      { id: leave.id, status: action },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["leave-requests"] as any);

          onSuccess();
          onOpenChange(false);
          setError(null);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              `Failed to ${action.toLowerCase()} leave. Please try again.`
          );
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
      if (!open) {
        setError(null);
      }
    }
  };

  const isApprove = action === "APPROVED";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {isApprove ? "Approve" : "Reject"} Leave Request
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to {isApprove ? "approve" : "reject"}{" "}
              <strong>{leave.employee.username}</strong>'s leave request?
            </p>
            <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{leave.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {format(new Date(leave.startDate), "dd MMM")} -{" "}
                  {format(new Date(leave.endDate), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days:</span>
                <span className="font-medium">
                  {leave.days} day{leave.days > 1 ? "s" : ""}
                </span>
              </div>
              {leave.reason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1 text-foreground">{leave.reason}</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          {/* Use Button instead of AlertDialogAction for proper loading control */}
          <Button
            onClick={handleAction}
            disabled={isPending}
            className={
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-destructive hover:bg-destructive/90"
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? `${isApprove ? "Approving" : "Rejecting"}...`
              : `${isApprove ? "Approve" : "Reject"}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
