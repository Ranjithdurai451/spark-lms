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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/lib/hook";

export default function ProfileDropdown() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Handle logout
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Clear Redux user and localStorage
      dispatch.auth.clearUser();
      localStorage.removeItem("user");

      // Optionally redirect to home or login page
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) return null; // Hide if not logged in

  // Generate avatar URL using ui-avatars
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.username || "User"
  )}&background=random&color=fff&size=128`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarUrl} alt={user.username || "User"} />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl} alt={user.username || "User"} />
          </Avatar>
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
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
