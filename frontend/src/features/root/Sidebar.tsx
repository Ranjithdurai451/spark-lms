import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Building2,
  Shield,
  LogOut,
  X,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router";
import { useAppDispatch } from "@/lib/hooks";
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
import { useState, useMemo } from "react";
import { useAuth } from "../auth/useAuth";
import { queryClient } from "./Providers";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasAccess } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Role-based permissions using hasAccess
  const isAdmin = hasAccess(["ADMIN"]);
  const isHR = hasAccess(["HR"]);
  const isManager = hasAccess(["MANAGER"]);
  const isAdminOrHR = isAdmin || isHR;
  const canManageLeaves = isAdmin || isHR || isManager;

  const allLinks = [
    {
      href: "/in",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/in/my-leaves",
      label: "My Leaves",
      icon: Calendar,
      show: true,
    },
    {
      href: "/in/leave-requests",
      label: "Leave Requests",
      icon: ClipboardList,
      show: canManageLeaves,
    },
    {
      href: "/in/leave-policy",
      label: "Leave Policy",
      icon: Shield,
      show: isAdminOrHR,
    },
    {
      href: "/in/holidays",
      label: "Holidays",
      icon: CalendarDays,
      show: isAdminOrHR,
    },
    {
      href: "/in/organization",
      label: "Organization",
      icon: Building2,
      show: true,
    },
  ];

  const visibleLinks = useMemo(
    () => allLinks.filter((link) => link.show),
    [allLinks]
  );

  const handleLogout = () => {
    dispatch.logout();
    queryClient.clear();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative z-40 h-dvh w-64 bg-muted text-foreground flex flex-col shadow-xl lg:translate-x-0 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 w-full border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SparkLMS
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/in"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm scale-[1.02]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]"
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>

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
              onClick={handleLogout}
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
