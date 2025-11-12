import { Card, CardContent } from "@/components/ui/card";
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

interface PolicyCardProps {
  policy: any;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PolicyCard({
  policy,
  canManage,
  onEdit,
  onDelete,
}: PolicyCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
      <CardContent className="p-4 pl-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{policy.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {policy.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] h-5",
                  policy.active
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {policy.active ? "Active" : "Inactive"}
              </Badge>

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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-[10px] text-muted-foreground">Max Days</p>
              <p className="text-sm font-bold">{policy.maxDays}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Carry Forward</p>
              <p className="text-sm font-bold">{policy.carryForward}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Min Notice</p>
              <p className="text-sm font-bold">{policy.minNotice} days</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Approval</p>
              <div className="flex items-center gap-1 mt-0.5">
                {policy.requiresApproval ? (
                  <CheckCircle className="w-3 h-3 text-primary" />
                ) : (
                  <XCircle className="w-3 h-3 text-muted-foreground" />
                )}
                <p className="text-xs font-medium">
                  {policy.requiresApproval ? "Required" : "Not Required"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
