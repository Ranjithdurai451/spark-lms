import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit2, Trash2, MoreHorizontal, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Holiday } from "../holidayService";

interface HolidayCardProps {
  holiday: Holiday;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function HolidayCard({
  holiday,
  canManage,
  onEdit,
  onDelete,
}: HolidayCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
      <CardContent className="p-4 pl-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{holiday.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5",
                    holiday.type === "PUBLIC"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-accent text-accent-foreground border-accent"
                  )}
                >
                  {holiday.type}
                </Badge>
                {holiday.recurring && (
                  <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                    <Repeat className="w-3 h-3" />
                    Annual
                  </Badge>
                )}
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

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">
              {format(new Date(holiday.date), "EEEE, MMMM dd, yyyy")}
            </span>
          </div>

          {/* Description */}
          {holiday.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
              {holiday.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
