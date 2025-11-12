import { Loader } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: ReactNode; // For complex subtitles (e.g., org code + description)
  action?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  action,
  isLoading,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h1>
          {isLoading && (
            <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Simple description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* Custom subtitle (for complex cases like OrganizationPage) */}
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>

      {/* Action button(s) */}
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}
