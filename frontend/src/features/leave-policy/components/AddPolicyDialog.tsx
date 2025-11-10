import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/lib/hooks";
import { useCreateLeavePolicy } from "../useLeavePolicy";

export function AddPolicyDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxDays: 10,
    carryForward: 0,
    requiresApproval: true,
    minNotice: 1,
    active: true,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: createPolicy, isPending } = useCreateLeavePolicy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Policy name is required.");
      return;
    }
    setErrorMsg(null);

    createPolicy(
      { ...formData, organizationId: orgId },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess();
          setFormData({
            name: "",
            description: "",
            maxDays: 10,
            carryForward: 0,
            requiresApproval: true,
            minNotice: 1,
            active: true,
          });
        },
        onError: (err: any) => {
          setErrorMsg(
            err.response?.data?.message || "Failed to create policy."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>Create Leave Policy</DialogTitle>
          <DialogDescription>
            Add a new leave policy for your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Annual Leave"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              placeholder="Describe this leave policy..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Max Days / Year</Label>
              <Input
                type="number"
                value={formData.maxDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDays: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Carry Forward</Label>
              <Input
                type="number"
                value={formData.carryForward}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carryForward: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Minimum Notice (Days)</Label>
            <Input
              type="number"
              value={formData.minNotice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minNotice: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.requiresApproval}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresApproval: !!checked })
                }
              />
              <Label>Requires approval</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: !!checked })
                }
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
              {isPending ? "Creating..." : "Create Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
