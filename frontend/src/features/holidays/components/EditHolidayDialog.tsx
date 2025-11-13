// features/holidays/components/EditHolidayDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle, Loader2, Edit2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUpdateHoliday } from "../useHolidays";
import type { HOLIDAY_TYPE } from "@/lib/types";
import { queryClient } from "@/features/root/Providers";
import type { Holiday } from "../holidayService";

interface EditHolidayDialogProps {
  holiday: Holiday;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditHolidayDialog({
  holiday,
  open,
  onOpenChange,
  onSuccess,
}: EditHolidayDialogProps) {
  const [form, setForm] = useState<{
    name: string;
    date: Date | undefined;
    type: HOLIDAY_TYPE;
    recurring: boolean;
  }>({
    name: "",
    date: undefined,
    type: "PUBLIC",
    recurring: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { mutate: updateHoliday, isPending } = useUpdateHoliday();

  useEffect(() => {
    if (holiday) {
      setForm({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        recurring: holiday.recurring,
      });
      setError(null);
    }
  }, [holiday]);

  const handleSubmit = () => {
    if (!form.name || !form.date) {
      setError("Name and date are required.");
      return;
    }
    setError(null);

    updateHoliday(
      { id: holiday.id, data: { ...form, date: form.date.toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["holidays"] as any);

          onSuccess();
          onOpenChange(false);
          setError(null);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Failed to update holiday. Please try again."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-primary" />
            </div>
            Edit Holiday
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update holiday details
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Holiday Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Date
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !form.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date ? format(form.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={form.date}
                  onSelect={(date) => {
                    setForm({ ...form, date: date ?? undefined });
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Type
            </Label>
            <Select
              value={form.type}
              onValueChange={(type: HOLIDAY_TYPE) => setForm({ ...form, type })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring-edit"
              checked={form.recurring}
              onCheckedChange={(checked) =>
                setForm({ ...form, recurring: !!checked })
              }
            />
            <Label
              htmlFor="recurring-edit"
              className="text-sm font-normal cursor-pointer"
            >
              Recurring yearly
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2 animate-in fade-in-50">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-[11px]">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-9 text-xs font-medium"
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Updating..." : "Update Holiday"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
