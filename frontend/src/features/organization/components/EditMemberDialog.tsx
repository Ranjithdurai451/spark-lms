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
import { User2, Mail, Briefcase, Users } from "lucide-react";

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onUpdate,
  members,
}: any) {
  const [formData, setFormData] = useState(member);

  useEffect(() => {
    setFormData(member);
  }, [member]);

  useEffect(() => {
    if (!formData.managerId && members.length > 0) {
      const firstManager =
        members.find((m: any) => m.role === "Manager") || members[0];
      setFormData((prev: any) => ({
        ...prev,
        managerId: String(firstManager.id),
      }));
    }
  }, [members, formData.managerId]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;
    onUpdate(formData);
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                className="pl-10"
              />
              <User2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@company.com"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Role + Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
              <Select
                value={formData.role || "Employee"}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Manager
              </Label>
              <Select
                value={formData.managerId ? String(formData.managerId) : ""}
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
                      {m.name} ({m.role})
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
