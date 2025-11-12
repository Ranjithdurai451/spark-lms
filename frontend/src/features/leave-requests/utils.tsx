import { Clock, CheckCircle, XCircle, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function getStatusIcon(status: string, size: string = "w-4 h-4") {
  const iconMap: Record<string, { Icon: LucideIcon; color: string }> = {
    APPROVED: { Icon: CheckCircle, color: "text-primary" },
    REJECTED: { Icon: XCircle, color: "text-destructive" },
    CANCELLED: { Icon: Ban, color: "text-muted-foreground" },
    PENDING: { Icon: Clock, color: "text-accent-foreground" },
  };

  const { Icon, color } = iconMap[status] || {
    Icon: Clock,
    color: "text-accent-foreground",
  };

  return <Icon className={cn(size, color)} />;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    APPROVED: "bg-primary/10 text-primary border-primary/20",
    REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
    CANCELLED: "bg-muted text-muted-foreground border-border",
    PENDING: "bg-accent text-accent-foreground border-accent",
  };
  return colors[status] || "bg-accent text-accent-foreground border-accent";
}
