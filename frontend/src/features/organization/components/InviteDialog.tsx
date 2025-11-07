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
import { MailPlus, Briefcase, Users } from "lucide-react";
import { useInviteMember } from "../useOrganization";
import { useNavigate } from "react-router";
import type { Role } from "@/lib/types";

export function InviteDialog({ open, onOpenChange, members }: any) {
  const [formData, setFormData] = useState({
    email: "",
    role: "EMPLOYEE",
    managerId: "",
  });
  const { mutate: inviteMember, isPending } = useInviteMember();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!formData.managerId && members.length > 0) {
      const firstManager =
        members.find((m: any) => m.role === "Manager") || members[0];
      setFormData((prev) => ({ ...prev, managerId: String(firstManager.id) }));
    }
  }, [members, formData.managerId]);
  const handleSubmit = () => {
    if (!formData.email) return;
    const payload = {
      invitedEmail: formData.email,
      role: formData.role as Role,
      managerId: formData.managerId,
    };
    inviteMember(payload, {
      onSuccess: (res) => {
        setFormData({ email: "", role: "Employee", managerId: "" });
        onOpenChange(false);
      },
      onError: (error: any) => {
        const msg =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";
        setErrorMsg(msg);
      },
    });
  };
  console.log(members);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-border/30 bg-background/95 backdrop-blur-md p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <MailPlus className="w-5 h-5 text-primary" /> Invite Member
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new member by email and assign their initial role.
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="example@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Role + Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Manager
              </Label>
              <Select
                value={formData.managerId}
                onValueChange={(v) =>
                  setFormData({ ...formData, managerId: v })
                }
                disabled={formData.role === "Admin"}
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
        </div>

        <DialogFooter className="pt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border/50 hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Send Invite
          </Button>
        </DialogFooter>
        {errorMsg && (
          <p className="text-xs text-destructive font-medium text-center mt-1">
            {errorMsg}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
