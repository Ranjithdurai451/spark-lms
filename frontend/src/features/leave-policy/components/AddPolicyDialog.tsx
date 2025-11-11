// features/leave-policy/components/AddPolicyDialog.tsx
import { useState } from "react";
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
import { AlertCircle, Loader2, FileText } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useCreateLeavePolicy } from "../useLeavePolicy";
import { queryClient } from "@/features/root/Providers";

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
  const [error, setError] = useState<string | null>(null);

  const { mutate: createPolicy, isPending } = useCreateLeavePolicy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Policy name is required.");
      return;
    }
    setError(null);

    createPolicy(
      { ...formData, organizationId: orgId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["leave-policies"] as any);

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
          setError(null);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Failed to create policy. Please try again."
          );
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
      if (!open) {
        setFormData({
          name: "",
          description: "",
          maxDays: 10,
          carryForward: 0,
          requiresApproval: true,
          minNotice: 1,
          active: true,
        });
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            Create Leave Policy
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add a new leave policy for your organization
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Policy Name
            </Label>
            <Input
              placeholder="e.g. Annual Leave"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Description (Optional)
            </Label>
            <Input
              placeholder="Describe this leave policy..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Max Days & Carry Forward */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Max Days / Year
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.maxDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDays: parseInt(e.target.value) || 0,
                  })
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
                value={formData.carryForward}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
              value={formData.minNotice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minNotice: parseInt(e.target.value) || 0,
                })
              }
              className="h-9"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires-approval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresApproval: !!checked })
                }
              />
              <Label
                htmlFor="requires-approval"
                className="text-sm font-normal cursor-pointer"
              >
                Requires approval
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active-policy"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: !!checked })
                }
              />
              <Label
                htmlFor="active-policy"
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
                onClick={() => handleOpenChange(false)}
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
                {isPending ? "Creating..." : "Create Policy"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
