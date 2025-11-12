// features/organization/components/InviteDialog.tsx
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
import { MailPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useInviteMember } from "../useOrganization";
import { queryClient } from "@/features/root/Providers";
import type { Role } from "@/lib/types";

export function InviteDialog({ open, onOpenChange, members }: any) {
  const [formData, setFormData] = useState({
    email: "",
    role: "EMPLOYEE",
    managerId: "none",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutate: inviteMember, isPending } = useInviteMember();

  useEffect(() => {
    if (formData.managerId === "none" && members.length > 0) {
      const firstManager =
        members.find((m: any) => m.role === "MANAGER") || members[0];
      setFormData((prev) => ({ ...prev, managerId: String(firstManager.id) }));
    }
  }, [members, formData.managerId]);

  const handleSubmit = () => {
    if (!formData.email) {
      setError("Email is required.");
      return;
    }

    setError(null);
    setSuccess(false);

    const payload = {
      invitedEmail: formData.email,
      role: formData.role as Role,
      managerId: formData.managerId,
    };

    inviteMember(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries(["organization"] as any);

        setSuccess(true);
        setTimeout(() => {
          setFormData({ email: "", role: "EMPLOYEE", managerId: "none" });
          setError(null);
          setSuccess(false);
          onOpenChange(false);
        }, 1500);
      },
      onError: (error: any) => {
        setError(
          error.response?.data?.message ||
            "Failed to send invite. Please try again."
        );
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending && !success) {
      onOpenChange(open);
      if (!open) {
        setError(null);
        setSuccess(false);
        setFormData({ email: "", role: "EMPLOYEE", managerId: "none" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MailPlus className="w-4 h-4 text-primary" />
            </div>
            Invite Member
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send an invitation to join your organization
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="example@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="h-9"
            />
          </div>

          {/* Role + Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
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

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Manager
              </Label>
              <Select
                value={formData.managerId}
                onValueChange={(v) =>
                  setFormData({ ...formData, managerId: v })
                }
                disabled={formData.role === "ADMIN"}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Success Message */}
          {success && (
            <Alert className="py-2 bg-green-50 dark:bg-green-950/20 border-green-200 animate-in fade-in-50">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <AlertDescription className="text-[11px] text-green-900 dark:text-green-100 font-medium">
                Invitation sent successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending || success}
              className="flex-1 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || success}
              className="flex-1 h-9 text-xs font-medium"
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Sending..." : success ? "Sent!" : "Send Invite"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
