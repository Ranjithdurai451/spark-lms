import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LeavePolicy } from "../leavePolicyService";

interface PolicyTableRowProps {
  policy: LeavePolicy;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PolicyTableRow({
  policy,
  canManage,
  onEdit,
  onDelete,
}: PolicyTableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors group">
      <td className="p-4">
        <div>
          <p className="text-sm font-medium">{policy.name}</p>
          <p className="text-xs text-muted-foreground truncate max-w-xs">
            {policy.description}
          </p>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm font-bold">{policy.maxDays}</span>
        <span className="text-xs text-muted-foreground ml-1">days</span>
      </td>
      <td className="p-4">
        <span className="text-sm font-bold">{policy.carryForward}</span>
        <span className="text-xs text-muted-foreground ml-1">days</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5">
          {policy.requiresApproval ? (
            <>
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">Yes</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">No</span>
            </>
          )}
        </div>
      </td>
      <td className="p-4 text-sm">{policy.minNotice} days</td>
      <td className="p-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            policy.active
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {policy.active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="p-4 text-right">
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}
