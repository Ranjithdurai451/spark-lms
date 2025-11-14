// features/root/ProfileDropdown.tsx
import { useState } from "react";
import { LogOut, Loader2, User, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useLogout } from "../auth/useAuth";
import { useNavigate } from "react-router";
import { queryClient } from "./Providers";
import { AccountSwitcherDialog } from "./AccountSwitcherDialog";

export default function ProfileDropdown() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { mutate: logout, isPending } = useLogout();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  const handleSignOut = async () => {
    logout(undefined, {
      onSuccess: () => {
        dispatch.auth.clearUser();
        queryClient.clear();
        navigate("/login", { replace: true });
      },
    });
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.username || "User"}</span>
              <span className="text-xs text-muted-foreground">
                {user.email || "user"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => navigate("/in/profile")}
            className="cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTimeout(() => setShowAccountDialog(true), 100)}
            className="cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Switch Account
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isPending ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Switcher Dialog outside Dropdown tree */}
      <AccountSwitcherDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />

      {/* Logout Confirm Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will be redirected to the
              login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
