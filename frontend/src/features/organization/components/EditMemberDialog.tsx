import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User2, AlertCircle, Loader2 } from "lucide-react";
import { useUpdateUser } from "../useOrganization";
import { queryClient } from "@/features/root/Providers";
import type { OrganizationMember, Role } from "@/lib/types";
interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (current: boolean) => void;
  members?: OrganizationMember[];
  member: OrganizationMember;
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  members,
}: EditMemberDialogProps) {
  const [formData, setFormData] = useState({
    ...member,
    managerId: member?.manager?.id || "none",
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    setFormData({
      ...member,
      managerId: member?.manager?.id || "none",
    });
    setError(null);
  }, [member]);
  const handleSubmit = () => {
    if (!formData.username) {
      setError("Name is required.");
      return;
    }

    setError(null);

    updateUser(
      {
        id: formData.id,
        username: formData.username,
        role: formData.role,
        managerId: formData.managerId === "none" ? null : formData.managerId, // Convert "none" to null
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["organization"] as any);

          setError(null);
          onOpenChange(false);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Failed to update member. Please try again."
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
              <User2 className="w-4 h-4 text-primary" />
            </div>
            Edit Member
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update member details and permissions
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Full Name
            </Label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter full name"
              className="h-9"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(v) =>
                setFormData({ ...formData, role: v as Role })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Manager (Optional)
            </Label>
            <Select
              value={formData.managerId}
              onValueChange={(v) => setFormData({ ...formData, managerId: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {members
                  ?.filter((m) => m.id !== formData.id)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.username} ({m.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
        </div>

        <DialogFooter className="pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-9 text-xs font-medium"
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
