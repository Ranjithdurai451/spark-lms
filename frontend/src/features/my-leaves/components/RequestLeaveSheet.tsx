// features/leaves/components/RequestLeaveSheet.tsx
import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  UserPlus,
  Loader2,
  Info,
} from "lucide-react";
import {
  format,
  isBefore,
  startOfDay,
  isWeekend,
  addDays,
  isSameDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/hooks";
import { useAddLeave, useGetMyLeaveBalances } from "../useMyLeaves";
import { useGetOrganizationById } from "@/features/organization/useOrganization";
import { useGetHolidays } from "@/features/holidays/useHolidays";
import { queryClient } from "@/features/root/Providers";

export function RequestLeaveSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const orgId = user?.organization?.id ?? "";

  const { data: balancesData, isLoading: balancesLoading } =
    useGetMyLeaveBalances();
  const { data: orgData, isLoading: orgLoading } =
    useGetOrganizationById(orgId);
  const { data: holidaysData, isLoading: holidaysLoading } =
    useGetHolidays(orgId);

  const balances = balancesData?.data ?? [];
  const orgUsers = orgData?.data?.users ?? [];
  const holidays = holidaysData?.data ?? [];

  const [form, setForm] = useState({
    type: "",
    reason: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    notifyUsers: [] as string[],
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutate: addLeave, isPending } = useAddLeave();

  const selectedBalance = useMemo(
    () => balances.find((b) => b.leavePolicy.name === form.type),
    [balances, form.type]
  );

  const remaining = selectedBalance?.remainingDays ?? 0;

  // ✅ FIXED: Calculate business days excluding weekends AND holidays
  const calculateBusinessDays = (start: Date, end: Date): number => {
    let count = 0;
    const current = new Date(start);

    // Create a Set of holiday dates for O(1) lookup
    const holidayDates = new Set(
      holidays.map((h) => {
        const d = new Date(h.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );

    while (current <= end) {
      const dateString = `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      const isHoliday = holidayDates.has(dateString);

      // Only count if it's not a weekend AND not a holiday
      if (!isWeekend(current) && !isHoliday) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const days =
    form.startDate && form.endDate && !holidaysLoading
      ? calculateBusinessDays(form.startDate, form.endDate)
      : 0;

  const selectedUsers = orgUsers.filter((u) => form.notifyUsers.includes(u.id));

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return orgUsers.filter((u) => u.id !== user?.id);
    const query = searchQuery.toLowerCase();
    return orgUsers.filter(
      (u) =>
        u.id !== user?.id &&
        (u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query))
    );
  }, [orgUsers, searchQuery, user?.id]);

  // ✅ FIXED: Better validation with proper date comparison
  useEffect(() => {
    const errors: string[] = [];

    if (form.type && form.startDate && form.endDate && days >= 0) {
      // Check balance
      if (days > remaining) {
        errors.push(
          `Insufficient balance. You have ${remaining} day(s) left but selected ${days} day(s).`
        );
      }

      // Check minimum notice
      if (selectedBalance?.leavePolicy?.minNotice && form.startDate) {
        const today = startOfDay(new Date());
        const leaveStartDate = startOfDay(form.startDate);
        const diffTime = leaveStartDate.getTime() - today.getTime();
        const noticeInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (noticeInDays < selectedBalance.leavePolicy.minNotice) {
          const earliestDate = addDays(
            today,
            selectedBalance.leavePolicy.minNotice
          );
          errors.push(
            `${form.type} requires ${
              selectedBalance.leavePolicy.minNotice
            } day(s) advance notice. Earliest start date: ${format(
              earliestDate,
              "dd MMM yyyy"
            )}.`
          );
        }
      }

      // Check if no business days selected
      if (days === 0 && form.startDate && form.endDate) {
        errors.push(
          "No business days in selected date range (weekends/holidays only)."
        );
      }
    }

    setValidationErrors(errors);
  }, [
    form.type,
    form.startDate,
    form.endDate,
    days,
    remaining,
    selectedBalance,
  ]);

  // ✅ FIXED: Better date validation
  const handleSubmit = () => {
    const errors: string[] = [];

    if (!form.type) errors.push("Please select a leave type");
    if (!form.startDate || !form.endDate)
      errors.push("Please select start and end dates");

    if (
      form.startDate &&
      isBefore(startOfDay(form.startDate), startOfDay(new Date()))
    ) {
      errors.push("Cannot select past dates");
    }

    if (
      form.endDate &&
      form.startDate &&
      isBefore(form.endDate, form.startDate)
    ) {
      errors.push("End date must be after start date");
    }

    if (days === 0) {
      errors.push("Please select at least one business day");
    }

    if (errors.length > 0 || validationErrors.length > 0) {
      setValidationErrors([...errors, ...validationErrors]);
      return;
    }

    addLeave(
      {
        type: form.type,
        reason: form.reason,
        startDate: form.startDate!.toISOString(),
        endDate: form.endDate!.toISOString(),
        days,
        organizationId: orgId,
        notifyUsers: form.notifyUsers,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["my-leaves"] as any);
          queryClient.invalidateQueries(["leave-balances"] as any);

          onSuccess();
          onOpenChange(false);
          setForm({
            type: "",
            reason: "",
            startDate: undefined,
            endDate: undefined,
            notifyUsers: [],
          });
          setValidationErrors([]);
          setSearchQuery("");
        },
        onError: (err: any) => {
          setValidationErrors([
            err.response?.data?.message ||
              "Failed to submit leave request. Please try again.",
          ]);
        },
      }
    );
  };

  const handleToggleUser = (userId: string) => {
    setForm({
      ...form,
      notifyUsers: form.notifyUsers.includes(userId)
        ? form.notifyUsers.filter((id) => id !== userId)
        : [...form.notifyUsers, userId],
    });
  };

  // ✅ FIXED: Check if date is a holiday
  const isHolidayDate = (date: Date): boolean => {
    return holidays.some((h) => {
      const holidayDate = new Date(h.date);
      return isSameDay(date, holidayDate);
    });
  };

  const isLoading = balancesLoading || orgLoading || holidaysLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col h-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Minimal Header */}
        <SheetHeader className="px-5 py-4 border-b shrink-0">
          <SheetTitle className="text-lg font-semibold">
            Request Leave
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit your time off request with details
          </p>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-4">
              {/* Date Selection - Compact */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Leave Period
                  </Label>
                  {days > 0 && (
                    <Badge className="h-5 px-2 text-[10px] font-semibold bg-primary text-primary-foreground">
                      {days} day{days > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 justify-start text-left font-normal",
                          !form.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        <span className="text-xs truncate">
                          {form.startDate
                            ? format(form.startDate, "dd MMM yyyy")
                            : "Start date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.startDate}
                        onSelect={(date) => {
                          setForm({ ...form, startDate: date });
                          setStartDateOpen(false);
                          if (!form.endDate && date) {
                            setForm({
                              ...form,
                              startDate: date,
                              endDate: date,
                            });
                          }
                        }}
                        disabled={(date) => {
                          const today = startOfDay(new Date());
                          const checkDate = startOfDay(date);

                          // Disable weekends
                          if (isWeekend(date)) return true;

                          // Disable past dates
                          if (isBefore(checkDate, today)) return true;

                          // Disable holidays
                          if (isHolidayDate(date)) return true;

                          // Check minimum notice
                          if (
                            form.type &&
                            selectedBalance?.leavePolicy?.minNotice
                          ) {
                            const diffTime =
                              checkDate.getTime() - today.getTime();
                            const noticeInDays = Math.floor(
                              diffTime / (1000 * 60 * 60 * 24)
                            );
                            if (
                              noticeInDays <
                              selectedBalance.leavePolicy.minNotice
                            )
                              return true;
                          }

                          return false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!form.startDate}
                        className={cn(
                          "h-9 justify-start text-left font-normal",
                          !form.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        <span className="text-xs truncate">
                          {form.endDate
                            ? format(form.endDate, "dd MMM yyyy")
                            : "End date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={form.endDate}
                        onSelect={(date) => {
                          setForm({ ...form, endDate: date });
                          setEndDateOpen(false);
                        }}
                        disabled={(date) =>
                          isWeekend(date) ||
                          isHolidayDate(date) ||
                          isBefore(date, form.startDate || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Leave Type - Fixed Width */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Leave Type
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(type) => setForm({ ...form, type })}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {balances.map((b) => (
                      <SelectItem
                        key={b.id}
                        value={b.leavePolicy.name}
                        disabled={b.remainingDays <= 0}
                      >
                        <div className="flex items-center justify-between w-full gap-6">
                          <span className="text-sm font-medium">
                            {b.leavePolicy.name}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                              b.remainingDays > 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {b.remainingDays} days left
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Errors - Compact */}
              {validationErrors.length > 0 && (
                <Alert
                  variant="destructive"
                  className="py-2 animate-in fade-in-50"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-[11px] leading-relaxed space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {days > 0 && validationErrors.length === 0 && (
                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-xs text-green-900 dark:text-green-100">
                    <div className="flex flex-wrap items-center gap-x-1">
                      <span>You are requesting</span>
                      <span className="font-bold">
                        {days} business day{days > 1 ? "s" : ""}
                      </span>
                      {remaining > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-bold">
                            {remaining - days} day
                            {remaining - days !== 1 ? "s" : ""}
                          </span>
                          <span>will remain</span>
                        </>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Reason - Compact */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Reason (Optional)
                </Label>
                <Textarea
                  placeholder="Provide a brief reason for your leave..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="min-h-[70px] resize-none text-sm"
                />
              </div>

              {/* Rest of your component stays the same... */}
              {/* Notify Users section */}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <SheetFooter className="border-t px-5 py-3 shrink-0">
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
              disabled={
                isPending ||
                isLoading ||
                !form.type ||
                !form.startDate ||
                !form.endDate ||
                days === 0 ||
                validationErrors.length > 0
              }
              className="flex-1 h-9 text-xs font-medium"
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
