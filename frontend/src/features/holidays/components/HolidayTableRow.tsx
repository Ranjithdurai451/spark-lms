import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MoreHorizontal, Repeat } from "lucide-react";
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

interface HolidayTableRowProps {
  holiday: Holiday;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function HolidayTableRow({
  holiday,
  canManage,
  onEdit,
  onDelete,
}: HolidayTableRowProps) {
  return (
    <tr className="border-b hover:bg-muted/30 transition-colors group">
      <td className="p-4">
        <div>
          <p className="text-sm font-medium">{holiday.name}</p>
          {holiday.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {holiday.description}
            </p>
          )}
        </div>
      </td>
      <td className="p-4 text-sm">
        {format(new Date(holiday.date), "MMM dd, yyyy")}
      </td>
      <td className="p-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            holiday.type === "PUBLIC"
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-accent text-accent-foreground border-accent"
          )}
        >
          {holiday.type}
        </Badge>
      </td>
      <td className="p-4">
        {holiday.recurring ? (
          <Badge variant="secondary" className="text-xs gap-1">
            <Repeat className="w-3 h-3" />
            Annual
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            No
          </Badge>
        )}
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
