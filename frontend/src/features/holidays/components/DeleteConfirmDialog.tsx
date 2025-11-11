// features/holidays/components/DeleteConfirmDialog.tsx
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
import { AlertCircle, Loader2 } from "lucide-react";
import { useDeleteHoliday } from "../useHolidays";
import { queryClient } from "@/features/root/Providers";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holidayId: string;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  holidayId,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteHoliday, isPending } = useDeleteHoliday();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default dialog close behavior
    setError(null);

    deleteHoliday(holidayId, {
      onSuccess: () => {
        queryClient.invalidateQueries(["holidays"] as any);

        onSuccess();
        onOpenChange(false);
        setError(null);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.message ||
            "Failed to delete holiday. Please try again."
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
          <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this holiday? This action cannot be
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          {/* Use Button instead of AlertDialogAction for proper loading control */}
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
