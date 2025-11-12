import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { getStatusColor, getStatusIcon } from "@/features/leave-requests/utils";

interface MyLeaveCardProps {
  leave: any;
  onView: () => void;
  onCancel: () => void;
}

export function MyLeaveCard({ leave, onView, onCancel }: MyLeaveCardProps) {
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-md overflow-hidden"
      onClick={onView}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
      <CardContent className="p-4 pl-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary" className="font-medium">
              {leave.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn("gap-1.5", getStatusColor(leave.status))}
            >
              {getStatusIcon(leave.status, "w-3 h-3")}
              <span className="text-xs font-medium">{leave.status}</span>
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">
                {format(new Date(leave.startDate), "dd MMM")} -{" "}
                {format(new Date(leave.endDate), "dd MMM yyyy")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              <strong>{leave.days}</strong> day{leave.days > 1 ? "s" : ""} •{" "}
              {formatDistanceToNow(new Date(leave.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {leave.reason && (
            <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
              {leave.reason}
            </p>
          )}

          {leave.status === "PENDING" && (
            <div className="pt-2 border-t flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="flex-1 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Ban className="w-3 h-3 mr-1.5" />
                Cancel Request
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
