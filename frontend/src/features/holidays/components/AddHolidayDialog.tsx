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
import { CalendarIcon } from "lucide-react";
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

export function AddHolidayDialog({ open, onOpenChange, onSuccess }: any) {
  const user = useAppSelector((s) => s.auth.user);
  const orgId = user?.organization?.id ?? "";

  const [form, setForm] = useState({
    name: "",
    date: undefined as Date | undefined,
    type: "PUBLIC" as HOLIDAY_TYPE,
    recurring: false,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { mutate: addHoliday, isPending } = useAddHoliday();

  const handleSubmit = () => {
    if (!form.name || !form.date) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setErrorMsg(null);
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
          onSuccess();
          onOpenChange(false);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            "Something went wrong. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add Holiday
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Holiday Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              placeholder="Enter holiday name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Date Picker with Month & Year Dropdowns */}
          <div className="space-y-1">
            <Label>Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date ? format(form.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 animate-in fade-in-50 slide-in-from-top-2"
                align="start"
              >
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(type: HOLIDAY_TYPE) => setForm({ ...form, type })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.recurring}
              onCheckedChange={(checked) =>
                setForm({ ...form, recurring: !!checked })
              }
            />
            <Label>Recurring yearly</Label>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add Holiday"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
