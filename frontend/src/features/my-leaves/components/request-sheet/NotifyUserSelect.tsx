import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, UserPlus, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface NotifyUsersSelectProps {
  selectedUserIds: string[];
  allUsers: User[];
  filteredUsers: User[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleUser: (userId: string) => void;
  onClearAll: () => void;
}

export function NotifyUsersSelect({
  selectedUserIds,
  allUsers,
  filteredUsers,
  searchQuery,
  onSearchChange,
  onToggleUser,
  onClearAll,
}: NotifyUsersSelectProps) {
  const selectedUsers = allUsers.filter((u) => selectedUserIds.includes(u.id));

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        Notify (Optional)
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 justify-start font-normal"
          >
            {selectedUsers.length > 0 ? (
              <>
                <UserPlus className="h-3.5 w-3.5 mr-2" />
                <span className="text-xs">{selectedUsers.length} selected</span>
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Search employees
                </span>
              </>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <div className="flex flex-col max-h-[280px]">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-1.5">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-center py-6 text-muted-foreground">
                  No employees found
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filteredUsers.map((member) => {
                    const isSelected = selectedUserIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => onToggleUser(member.id)}
                        className={cn(
                          "w-full flex items-center gap-2 p-1.5 rounded transition-colors text-left",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {member.username}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1"
                          >
                            {member.role}
                          </Badge>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <>
                <Separator />
                <div className="p-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-6 text-[10px] px-2"
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedUsers.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="pl-0.5 pr-1.5 py-0.5 gap-1 h-6"
            >
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">
                  {member.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] max-w-[80px] truncate">
                {member.username}
              </span>
              <button
                onClick={() => onToggleUser(member.id)}
                className="hover:bg-muted/80 rounded-full p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
