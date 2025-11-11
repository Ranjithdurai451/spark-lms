// features/root/Sidebar.tsx
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
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Role-based access control
  const isAdmin = user?.role === "ADMIN";
  const isHR = user?.role === "HR";
  const isManager = user?.role === "MANAGER";
  const isAdminOrHR = isAdmin || isHR;
  const canManageLeaves = isAdmin || isHR || isManager;

  // Define all navigation links with role-based visibility
  const allLinks = [
    {
      href: "/in/profile",
      label: "My Profile",
      icon: UserCircle,
      show: true, // Everyone can access their profile
    },
    {
      href: "/in",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true, // Everyone can access dashboard
    },
    {
      href: "/in/my-leaves",
      label: "My Leaves",
      icon: Calendar,
      show: true, // Everyone can access their own leaves
    },
    {
      href: "/in/leave-requests",
      label: "Leave Requests",
      icon: ClipboardList,
      show: canManageLeaves, // Admin, HR, Manager only
    },
    {
      href: "/in/leave-policy",
      label: "Leave Policy",
      icon: Shield,
      show: isAdminOrHR, // Admin and HR only
    },
    {
      href: "/in/holidays",
      label: "Holidays",
      icon: CalendarDays,
      show: isAdminOrHR, // Admin and HR only
    },
    {
      href: "/in/organization",
      label: "Organization",
      icon: Building2,
      show: isAdminOrHR, // Admin and HR only
    },
  ];

  // Filter links based on user role
  const visibleLinks = useMemo(
    () => allLinks.filter((link) => link.show),
    [isAdminOrHR, canManageLeaves]
  );

  const handleLogout = () => {
    // Clear user from Redux store
    dispatch.auth.clearUser();

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("auth-token");

    // Clear any cookies if needed
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Close sidebar on mobile
    onClose();

    // Navigate to login
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 h-dvh w-64 bg-muted text-foreground flex flex-col shadow-xl lg:translate-x-0 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
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

        {/* User Info */}
        {/* <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role || "Employee"}
              </p>
            </div>
          </div>
        </div> */}

        {/* Navigation */}
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

        {/* Footer */}
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

      {/* Logout Confirmation Dialog */}
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
