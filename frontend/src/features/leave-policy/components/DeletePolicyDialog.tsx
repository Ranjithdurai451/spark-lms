import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteLeavePolicy } from "../useLeavePolicy";

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

  const handleDelete = () => {
    deletePolicy(policy.id, {
      onSuccess: () => onOpenChange(false),
      onError: (err: any) => console.error(err),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Delete Policy</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{policy.name}</b>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 pt-4">
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
