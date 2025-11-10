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
import { User2, Briefcase, Users } from "lucide-react";
import { useUpdateUser } from "../useOrganization";

export function EditMemberDialog({ member, open, onOpenChange, members }: any) {
  const [formData, setFormData] = useState(member);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    setFormData(member);
    setErrorMsg(null);
  }, [member]);

  const handleSubmit = () => {
    if (!formData.username) {
      setErrorMsg("Name is required.");
      return;
    }

    updateUser(
      {
        id: formData.id,
        username: formData.username,
        role: formData.role,
        managerId: formData.managerId || null,
      },
      {
        onSuccess: () => {
          setErrorMsg(null);
          onOpenChange(false);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            "Something went wrong. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-border/30 bg-background/95 backdrop-blur-md p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User2 className="w-5 h-5 text-primary" /> Edit Member
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update details, role, or reporting manager for this member.
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter full name"
              className="pl-10"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
            >
              <SelectTrigger>
                <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manager */}
          <div className="space-y-1.5">
            <Label>Manager</Label>
            <Select
              value={formData.managerId || ""}
              onValueChange={(v) =>
                setFormData({ ...formData, managerId: v || null })
              }
            >
              <SelectTrigger>
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.username} ({m.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-6 flex flex-col gap-3">
          {/* Error message (like login) */}
          {errorMsg && (
            <p className="text-xs text-destructive font-medium text-center">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50 hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
