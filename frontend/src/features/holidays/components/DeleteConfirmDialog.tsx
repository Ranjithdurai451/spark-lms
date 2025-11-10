import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteHoliday } from "../useHolidays";
import { useState } from "react";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = () => {
    deleteHoliday(holidayId, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
      },
      onError: (err: any) => {
        setErrorMsg(
          err.response?.data?.message || "Failed to delete this holiday."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Holiday</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this holiday? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {errorMsg && (
          <p className="text-xs text-destructive font-medium mb-2">
            {errorMsg}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
