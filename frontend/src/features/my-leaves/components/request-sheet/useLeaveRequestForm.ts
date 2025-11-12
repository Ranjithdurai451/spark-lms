import { useState, useMemo, useEffect } from "react";
import {
  startOfDay,
  addDays,
  isBefore,
  isWeekend,
  isSameDay,
  format,
} from "date-fns";

interface FormState {
  type: string;
  reason: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  notifyUsers: string[];
}

export function useLeaveRequestForm(
  balances: any[],
  holidays: any[],
  holidaysLoading: boolean
) {
  const [form, setForm] = useState<FormState>({
    type: "",
    reason: "",
    startDate: undefined,
    endDate: undefined,
    notifyUsers: [],
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const selectedBalance = useMemo(
    () => balances.find((b) => b.leavePolicy.name === form.type),
    [balances, form.type]
  );

  const remaining = selectedBalance?.remainingDays ?? 0;

  const calculateBusinessDays = (start: Date, end: Date): number => {
    let count = 0;
    const current = new Date(start);

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

  const isHolidayDate = (date: Date): boolean => {
    return holidays.some((h) => {
      const holidayDate = new Date(h.date);
      return isSameDay(date, holidayDate);
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);

    if (isWeekend(date)) return true;
    if (isBefore(checkDate, today)) return true;
    if (isHolidayDate(date)) return true;

    if (form.type && selectedBalance?.leavePolicy?.minNotice) {
      const diffTime = checkDate.getTime() - today.getTime();
      const noticeInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (noticeInDays < selectedBalance.leavePolicy.minNotice) return true;
    }

    return false;
  };

  // Validation
  useEffect(() => {
    const errors: string[] = [];

    if (form.type && form.startDate && form.endDate && days >= 0) {
      if (days > remaining) {
        errors.push(
          `Insufficient balance. You have ${remaining} day(s) left but selected ${days} day(s).`
        );
      }

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

  const resetForm = () => {
    setForm({
      type: "",
      reason: "",
      startDate: undefined,
      endDate: undefined,
      notifyUsers: [],
    });
    setValidationErrors([]);
  };

  return {
    form,
    setForm,
    days,
    remaining,
    selectedBalance,
    validationErrors,
    setValidationErrors,
    isDateDisabled,
    isHolidayDate,
    resetForm,
  };
}
