import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { getStatusColor, getStatusIcon } from "../utils";

interface LeaveRequestTableRowProps {
  leave: any;
  canApprove: boolean;
  canDelete: boolean;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function LeaveRequestTableRow({
  leave,
  canApprove,
  canDelete,
  onView,
  onApprove,
  onReject,
  onDelete,
}: LeaveRequestTableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors group">
      <td className="p-4">
        <div>
          <p className="text-sm font-medium">{leave.employee.username}</p>
          <p className="text-xs text-muted-foreground">
            {leave.employee.email}
          </p>
        </div>
      </td>
      <td className="p-4">
        <Badge variant="outline" className="font-medium">
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
            {canApprove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onApprove}>
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReject}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
