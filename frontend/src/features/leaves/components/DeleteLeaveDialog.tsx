import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteLeave } from "../useLeaves";

export function DeleteLeaveDialog({
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
  const { mutate: deleteLeave, isPending } = useDeleteLeave();

  const handleDelete = () => {
    deleteLeave(leaveId, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Delete Leave Request
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground pt-2">
          Are you sure you want to delete this leave request? This action cannot
          be undone.
        </p>

        <DialogFooter className="pt-4">
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
