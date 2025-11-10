import {
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  Shield,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const links = [
    { href: "/in", label: "Dashboard", icon: LayoutDashboard },
    { href: "/in/leaves", label: "Leave Requests", icon: Calendar },
    { href: "/in/leave-policy", label: "Leave Policy", icon: Shield },
    { href: "/in/holidays", label: "Holidays", icon: Clock },
    { href: "/in/organization", label: "Organization", icon: Building2 },
  ];

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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end
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
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-sm font-medium">
            <LogOut className="w-5 h-5" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
