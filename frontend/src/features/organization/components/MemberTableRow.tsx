import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { OrganizationMember } from "@/lib/types";

interface MemberTableRowProps {
  member: OrganizationMember;
  isCurrent: boolean;
  canManage: boolean;
  getRoleColor: (role: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemberTableRow({
  member,
  isCurrent,
  canManage,
  getRoleColor,
  onEdit,
  onDelete,
}: MemberTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b hover:bg-muted/30 transition-colors group",
        isCurrent && "bg-primary/5"
      )}
    >
      {/* Member */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
              isCurrent ? "bg-primary text-primary-foreground" : "bg-primary/10"
            )}
          >
            <span
              className={cn(
                "text-xs font-bold",
                isCurrent ? "text-primary-foreground" : "text-primary"
              )}
            >
              {member.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{member.username}</p>
            {isCurrent && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                You
              </Badge>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-3.5 h-3.5" />
          {member.email}
        </div>
      </td>

      {/* Role */}
      <td className="p-4">
        <Badge
          className={cn(
            "text-xs font-medium border",
            getRoleColor(member.role)
          )}
        >
          {member.role}
        </Badge>
      </td>

      {/* Manager */}
      <td className="p-4 text-sm text-muted-foreground">
        {member.manager?.username || "-"}
      </td>

      {/* Actions */}
      {canManage ? (
        <td className="p-4 text-right">
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
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
}
