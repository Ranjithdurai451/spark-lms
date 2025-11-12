import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  UserCircle,
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

interface LeaveRequestCardProps {
  leave: any;
  canApprove: boolean;
  canDelete: boolean;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function LeaveRequestCard({
  leave,
  canApprove,
  canDelete,
  onView,
  onApprove,
  onReject,
  onDelete,
}: LeaveRequestCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-md overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
      <CardContent className="p-4 pl-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className="font-medium px-2.5 py-0.5">
              {leave.type}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("gap-1.5", getStatusColor(leave.status))}
              >
                {getStatusIcon(leave.status, "w-3 h-3")}
                <span className="text-xs font-medium">{leave.status}</span>
              </Badge>

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
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <UserCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">
                {leave.employee.username}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {leave.employee.email}
              </p>
            </div>
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

          {canApprove && (
            <div className="pt-2 border-t flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="flex-1 h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
              >
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="flex-1 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-3 h-3 mr-1.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
