import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader, CheckCircle2, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterAdmin } from "../../useAuth";
import { useAppDispatch } from "@/lib/hook";
import { useNavigate } from "react-router";

interface InvitedEmail {
  email: string;
  role: "HR" | "Employee";
}

interface AddMembersProps {
  data: any;
  onBack: () => void;
  onUpdate: (data: Partial<any>) => void;
}

export const AddMembers = ({ data, onBack }: AddMembersProps) => {
  const [invitedEmails, setInvitedEmails] = useState<InvitedEmail[]>(
    data.invitedEmails || []
  );
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentRole, setCurrentRole] = useState<"HR" | "Employee">("Employee");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail);
  const dispatch = useAppDispatch();
  const { mutate: registerAdmin, isPending: isSubmitting } = useRegisterAdmin();
  const navigate = useNavigate();
  const addEmail = () => {
    if (
      isValidEmail &&
      !invitedEmails.some((item) => item.email === currentEmail)
    ) {
      const newEmail = { email: currentEmail, role: currentRole };
      setInvitedEmails([...invitedEmails, newEmail]);
      setCurrentEmail("");
      setCurrentRole("Employee");
    }
  };

  const removeEmail = (email: string) => {
    setInvitedEmails(invitedEmails.filter((item) => item.email !== email));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    const payload = {
      email: data.email,
      username: data.username,
      password: data.password,
      organizationName: data.organizationName,
      organizationCode: data.organizationCode,
      organizationDescription: data.organizationDescription,
      invitedEmails,
    };

    registerAdmin(payload, {
      onSuccess: (res) => {
        if (res.data?.user) {
          dispatch.auth.setUser(res.data?.user);
          navigate("/in");
        } else {
          setErrorMsg("Something went wrong. Please try again.");
        }
      },
      onError: (error: any) => {
        const msg =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";
        setErrorMsg(msg);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-bold text-foreground">
            Invite Team Members
          </h2>
          <p className="text-sm text-muted-foreground">
            Add members to your organization before completing setup.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Add Email Form */}
        <div className="flex flex-col gap-3 p-3 bg-secondary rounded-lg border border-border">
          <label className="text-sm font-semibold text-foreground">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="colleague@example.com"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addEmail()}
            className="bg-muted/50"
          />

          <label className="text-sm font-semibold text-foreground block">
            Role
          </label>
          <div className="flex gap-2">
            <Select
              value={currentRole}
              onValueChange={(value: any) => setCurrentRole(value)}
            >
              <SelectTrigger className="flex-1 bg-muted/50">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR / Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={addEmail}
              disabled={!isValidEmail}
              size="lg"
              className="px-4 font-semibold"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invited Emails List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members ({invitedEmails.length})
            </h3>
            {invitedEmails.length > 0 && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </div>
          {invitedEmails.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {invitedEmails.map((item, index) => (
                <div
                  key={item.email}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {item.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.role === "HR" ? "HR / Manager" : "Employee"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeEmail(item.email)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center rounded-lg bg-muted/30 border border-dashed border-border">
              No team members invited yet. Add at least one to continue.
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1 font-semibold bg-transparent"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || invitedEmails.length === 0}
            size="lg"
            className="flex-1 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <p className="text-xs text-destructive font-medium text-center mt-1">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
