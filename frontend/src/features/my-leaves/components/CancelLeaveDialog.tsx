// features/leaves/components/CancelLeaveDialog.tsx
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCancelLeave } from "../useMyLeaves";
import { queryClient } from "@/features/root/Providers";

export function CancelLeaveDialog({
  open,
  onOpenChange,
  leaveId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string;
  onSuccess: () => void;
}) {
  const { mutate: cancelLeave, isPending } = useCancelLeave();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);

    cancelLeave(leaveId, {
      onSuccess: () => {
        // Invalidate queries immediately
        queryClient.invalidateQueries(["my-leaves"] as any);
        queryClient.invalidateQueries(["leave-balances"] as any);

        onSuccess();
        onOpenChange(false);
        setError(null);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.message ||
            "Failed to cancel leave. Please try again."
        );
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
      if (!open) {
        setError(null);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel your pending leave request. This action cannot be
            undone.
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
          <AlertDialogCancel disabled={isPending}>
            No, keep it
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Cancelling..." : "Yes, cancel leave"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
