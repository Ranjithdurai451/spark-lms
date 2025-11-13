import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { getStatusColor, getStatusIcon } from "@/features/leave-requests/utils";
import type { Leave } from "../MyleavesService";

interface MyLeaveTableRowProps {
  leave: Leave;
  onView: () => void;
  onCancel: () => void;
}

export function MyLeaveTableRow({
  leave,
  onView,
  onCancel,
}: MyLeaveTableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors group">
      <td className="p-4">
        <Badge variant="secondary" className="font-medium">
          {leave.type}
        </Badge>
      </td>
      <td className="p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {format(new Date(leave.startDate), "dd MMM yyyy")}
          </p>
          <p className="text-xs text-muted-foreground">
            to {format(new Date(leave.endDate), "dd MMM yyyy")}
          </p>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm font-bold">{leave.days}</span>
        <span className="text-xs text-muted-foreground ml-1">
          day{leave.days > 1 ? "s" : ""}
        </span>
      </td>
      <td className="p-4">
        <Badge
          variant="outline"
          className={cn("gap-1.5", getStatusColor(leave.status))}
        >
          {getStatusIcon(leave.status, "w-3 h-3")}
          <span className="text-xs font-medium">{leave.status}</span>
        </Badge>
      </td>
      <td className="p-4">
        <div className="space-y-0.5">
          <p className="text-sm">
            {format(new Date(leave.createdAt), "dd MMM yyyy")}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(leave.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </td>
      <td className="p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {leave.status === "PENDING" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCancel}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
