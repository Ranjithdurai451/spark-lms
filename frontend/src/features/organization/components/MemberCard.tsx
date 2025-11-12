// features/organization/components/MemberCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, UserCircle, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface MemberCardProps {
  member: Pick<User, "id" | "role" | "email" | "username" | "manager">;
  isCurrent: boolean;
  canManage: boolean;
  getRoleColor: (role: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemberCard({
  member,
  isCurrent,
  canManage,
  getRoleColor,
  onEdit,
  onDelete,
}: MemberCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden",
        isCurrent && "ring-2 ring-primary/20"
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-1 h-full",
          isCurrent
            ? "bg-gradient-to-b from-primary to-primary/50"
            : "bg-gradient-to-b from-muted to-muted/50"
        )}
      />
      <CardContent className="p-4 pl-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    isCurrent ? "text-primary-foreground" : "text-primary"
                  )}
                >
                  {member.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">
                    {member.username}
                  </p>
                  {isCurrent && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                      You
                    </Badge>
                  )}
                </div>
                <Badge
                  className={cn(
                    "mt-1 text-[10px] h-5 font-medium border",
                    getRoleColor(member.role)
                  )}
                >
                  {member.role}
                </Badge>
              </div>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
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
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>

          {/* Manager */}
          {member.manager && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <UserCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground">Reports to</p>
                <p className="text-xs font-medium truncate">
                  {member.manager.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
