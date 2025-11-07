import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useLogout } from "../auth/useAuth";
import { useNavigate } from "react-router";

export default function ProfileDropdown() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { mutate: logout, isPending } = useLogout();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    // Clear Redux user and localStorage

    logout(undefined, {
      onSuccess: () => {
        dispatch.auth.clearUser();
        localStorage.removeItem("user");
        navigate("/");
      },
    });
  };

  if (!user) return null; // Hide if not logged in

  return (
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

        <DropdownMenuItem
          onClick={handleSignOut}
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
  );
}
