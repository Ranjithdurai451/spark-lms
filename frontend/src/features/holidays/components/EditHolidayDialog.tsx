"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CalendarIcon } from "lucide-react";
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

interface EditHolidayDialogProps {
  holiday: any;
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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
    }
  }, [holiday]);

  const handleSubmit = () => {
    if (!form.name || !form.date) {
      setErrorMsg("Name and date are required.");
      return;
    }
    setErrorMsg(null);

    updateHoliday(
      { id: holiday.id, data: { ...form, date: form.date.toISOString() } },
      {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
        onError: (err: any) => {
          setErrorMsg(
            err.response?.data?.message ||
              "Something went wrong. Please try again."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Holiday
          </DialogTitle>
          <DialogDescription>
            Modify the details of this holiday.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Holiday Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Date Picker with Dropdowns */}
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
                    setForm({ ...form, date: date ?? undefined });
                    setDatePickerOpen(false);
                  }}
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
                <SelectValue />
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
              id="recurring"
              checked={form.recurring}
              onCheckedChange={(checked) =>
                setForm({ ...form, recurring: !!checked })
              }
            />
            <Label htmlFor="recurring">Recurring yearly</Label>
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
            {isPending ? "Updating..." : "Update Holiday"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
