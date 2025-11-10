import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateLeavePolicy } from "../useLeavePolicy";

export function EditPolicyDialog({
  open,
  onOpenChange,
  policy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: any;
}) {
  const [form, setForm] = useState(policy);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: updatePolicy, isPending } = useUpdateLeavePolicy();

  useEffect(() => {
    setForm(policy);
  }, [policy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Policy name is required.");
      return;
    }
    setErrorMsg(null);
    updatePolicy(
      { id: form.id, data: form },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (err: any) => {
          setErrorMsg(
            err.response?.data?.message || "Failed to update policy."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>
            Modify the leave policy details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Days</Label>
              <Input
                type="number"
                value={form.maxDays}
                onChange={(e) =>
                  setForm({ ...form, maxDays: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Carry Forward</Label>
              <Input
                type="number"
                value={form.carryForward}
                onChange={(e) =>
                  setForm({ ...form, carryForward: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <Label>Minimum Notice (Days)</Label>
            <Input
              type="number"
              value={form.minNotice}
              onChange={(e) =>
                setForm({ ...form, minNotice: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.requiresApproval}
                onCheckedChange={(c) =>
                  setForm({ ...form, requiresApproval: !!c })
                }
              />
              <Label>Requires approval</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.active}
                onCheckedChange={(c) => setForm({ ...form, active: !!c })}
              />
              <Label>Active policy</Label>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive text-center font-medium">
              {errorMsg}
            </p>
          )}

          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
