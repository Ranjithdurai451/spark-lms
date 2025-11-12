import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { isBefore, startOfDay } from "date-fns";
import { useAppSelector } from "@/lib/hooks";
import { useGetOrganizationById } from "@/features/organization/useOrganization";
import { useGetHolidays } from "@/features/holidays/useHolidays";
import { queryClient } from "@/features/root/Providers";
import { useGetMyLeaveBalances, useAddLeave } from "../../useMyLeaves";
import { DateRangePicker } from "./DateRangePicker";
import { NotifyUsersSelect } from "./NotifyUserSelect";
import { useLeaveRequestForm } from "./useLeaveRequestForm";
import { useUserSearch } from "./useUserSearch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestLeaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RequestLeaveSheet({
  open,
  onOpenChange,
  onSuccess,
}: RequestLeaveSheetProps) {
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

  const {
    form,
    setForm,
    days,
    remaining,
    validationErrors,
    setValidationErrors,
    isDateDisabled,
    resetForm,
  } = useLeaveRequestForm(balances, holidays, holidaysLoading);

  const { searchQuery, setSearchQuery, filteredUsers } = useUserSearch(
    orgUsers,
    user?.id
  );

  const { mutate: addLeave, isPending } = useAddLeave();

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
    if (days === 0) errors.push("Please select at least one business day");

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
          resetForm();
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

  const isLoading = balancesLoading || orgLoading || holidaysLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col h-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-5 py-4 border-b shrink-0">
          <SheetTitle className="text-lg font-semibold">
            Request Leave
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit your time off request with details
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-4">
              <DateRangePicker
                startDate={form.startDate}
                endDate={form.endDate}
                days={days}
                onStartDateChange={(date) =>
                  setForm({
                    ...form,
                    startDate: date,
                    endDate: date || form.endDate,
                  })
                }
                onEndDateChange={(date) => setForm({ ...form, endDate: date })}
                isDateDisabled={isDateDisabled}
              />

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

              {/* <ValidationAlerts
                validationErrors={validationErrors}
                days={days}
                remaining={remaining}
              /> */}
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

              {days > 0 && (
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

              <NotifyUsersSelect
                selectedUserIds={form.notifyUsers}
                allUsers={orgUsers}
                filteredUsers={filteredUsers}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleUser={(userId) => {
                  setForm({
                    ...form,
                    notifyUsers: form.notifyUsers.includes(userId)
                      ? form.notifyUsers.filter((id) => id !== userId)
                      : [...form.notifyUsers, userId],
                  });
                }}
                onClearAll={() => setForm({ ...form, notifyUsers: [] })}
              />
            </div>
          )}
        </div>

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
