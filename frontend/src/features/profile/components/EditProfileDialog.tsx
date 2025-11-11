// features/profile/components/EditProfileDialog.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, UserCircle } from "lucide-react";
import { useUpdateProfile } from "../useProfile";
import { queryClient } from "@/features/root/Providers";
import { useAppDispatch } from "@/lib/hooks";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  onSuccess: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentUsername,
  onSuccess,
}: EditProfileDialogProps) {
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUsername(currentUsername);
    setError(null);
  }, [currentUsername, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (username.trim() === currentUsername) {
      setError("Username is the same as before.");
      return;
    }

    setError(null);

    updateProfile(username.trim(), {
      onSuccess: (data) => {
        // Update Redux store with new username
        if (data?.data) {
          dispatch.auth.setUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));
        }

        // Invalidate queries
        queryClient.invalidateQueries(["profile"] as any);

        onSuccess();
        onOpenChange(false);
        setError(null);
      },
      onError: (err: any) => {
        setError(
          err.response?.data?.message ||
            "Failed to update profile. Please try again."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-primary" />
            </div>
            Edit Profile
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your profile information
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Username
            </Label>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-9"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              This is your display name visible to others in the organization.
            </p>
          </div>

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
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
