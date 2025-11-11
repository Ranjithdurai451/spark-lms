// features/leave-policy/components/DeletePolicyDialog.tsx
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
import { useDeleteLeavePolicy } from "../useLeavePolicy";
import { queryClient } from "@/features/root/Providers";

export function DeletePolicyDialog({
  open,
  onOpenChange,
  policy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: any;
}) {
  const { mutate: deletePolicy, isPending } = useDeleteLeavePolicy();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    deletePolicy(policy.id, {
      onSuccess: () => {
        queryClient.invalidateQueries(["leave-policies"] as any);

        onOpenChange(false);
        setError(null);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.message ||
            "Failed to delete policy. Please try again."
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
          <AlertDialogTitle>Delete Policy</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{policy.name}</strong>? This
            action cannot be undone.
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
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
