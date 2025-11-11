// features/holidays/components/AddHolidayDialog.tsx
import { useState } from "react";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle, Loader2, CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfDay } from "date-fns";
import { useAddHoliday } from "../useHolidays";
import { useAppSelector } from "@/lib/hooks";
import type { HOLIDAY_TYPE } from "@/lib/types";
import { cn } from "@/lib/utils";
import { queryClient } from "@/features/root/Providers";

export function AddHolidayDialog({ open, onOpenChange, onSuccess }: any) {
  const user = useAppSelector((s) => s.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [form, setForm] = useState({
    name: "",
    date: undefined as Date | undefined,
    type: "PUBLIC" as HOLIDAY_TYPE,
    recurring: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { mutate: addHoliday, isPending } = useAddHoliday();

  const handleSubmit = () => {
    if (!form.name || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    addHoliday(
      {
        name: form.name,
        date: form.date.toISOString(),
        type: form.type,
        recurring: form.recurring,
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["holidays"] as any);

          onSuccess();
          onOpenChange(false);
          setForm({
            name: "",
            date: undefined,
            type: "PUBLIC",
            recurring: false,
          });
          setError(null);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Failed to add holiday. Please try again."
          );
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
      if (!open) {
        setForm({
          name: "",
          date: undefined,
          type: "PUBLIC",
          recurring: false,
        });
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            Add Holiday
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create a new holiday for your organization
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Holiday Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Holiday Name
            </Label>
            <Input
              placeholder="Enter holiday name"
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
                    if (
                      date &&
                      isBefore(startOfDay(date), startOfDay(new Date()))
                    ) {
                      return;
                    }
                    setForm({ ...form, date: date ?? undefined });
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) =>
                    isBefore(startOfDay(date), startOfDay(new Date()))
                  }
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
                <SelectValue placeholder="Select type" />
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
              id="recurring"
              checked={form.recurring}
              onCheckedChange={(checked) =>
                setForm({ ...form, recurring: !!checked })
              }
            />
            <Label
              htmlFor="recurring"
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
              onClick={() => handleOpenChange(false)}
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
              {isPending ? "Adding..." : "Add Holiday"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
