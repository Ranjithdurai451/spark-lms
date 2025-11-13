// features/leave-policy/components/EditPolicyDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Edit2 } from "lucide-react";
import { useUpdateLeavePolicy } from "../useLeavePolicy";
import { queryClient } from "@/features/root/Providers";
import type { LeavePolicy } from "../leavePolicyService";

export function EditPolicyDialog({
  open,
  onOpenChange,
  policy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: LeavePolicy;
}) {
  const [form, setForm] = useState(policy);
  const [error, setError] = useState<string | null>(null);

  const { mutate: updatePolicy, isPending } = useUpdateLeavePolicy();

  useEffect(() => {
    setForm(policy);
    setError(null);
  }, [policy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Policy name is required.");
      return;
    }
    setError(null);

    updatePolicy(
      { id: form.id, data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["leave-policies"] as any);

          onOpenChange(false);
          setError(null);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Failed to update policy. Please try again."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-primary" />
            </div>
            Edit Policy
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update leave policy details
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Policy Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Description (Optional)
            </Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Max Days & Carry Forward */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Max Days
              </Label>
              <Input
                type="number"
                min="0"
                value={form.maxDays}
                onChange={(e) =>
                  setForm({ ...form, maxDays: parseInt(e.target.value) || 0 })
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Carry Forward
              </Label>
              <Input
                type="number"
                min="0"
                value={form.carryForward}
                onChange={(e) =>
                  setForm({
                    ...form,
                    carryForward: parseInt(e.target.value) || 0,
                  })
                }
                className="h-9"
              />
            </div>
          </div>

          {/* Min Notice */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Minimum Notice (Days)
            </Label>
            <Input
              type="number"
              min="0"
              value={form.minNotice}
              onChange={(e) =>
                setForm({ ...form, minNotice: parseInt(e.target.value) || 0 })
              }
              className="h-9"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-requires-approval"
                checked={form.requiresApproval}
                onCheckedChange={(c) =>
                  setForm({ ...form, requiresApproval: !!c })
                }
              />
              <Label
                htmlFor="edit-requires-approval"
                className="text-sm font-normal cursor-pointer"
              >
                Requires approval
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-active-policy"
                checked={form.active}
                onCheckedChange={(c) => setForm({ ...form, active: !!c })}
              />
              <Label
                htmlFor="edit-active-policy"
                className="text-sm font-normal cursor-pointer"
              >
                Active policy
              </Label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2 animate-in fade-in-50">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-[11px]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-4">
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="flex-1 h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-9 text-xs font-medium"
              >
                {isPending && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {isPending ? "Updating..." : "Update Policy"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
