// src/features/holidays/useHolidays.ts
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import HolidayService, { type Holiday } from "./holidayService";
import { useApiMutation } from "@/lib/hooks";
import type { ApiResponse } from "@/features/auth/authService";

/* ---------- GET HOLIDAYS ---------- */
export const useGetHolidays = (organizationId: string) =>
  useQuery<ApiResponse<Holiday[]>, AxiosError<ApiResponse>>({
    queryKey: ["holidays", organizationId],
    queryFn: async () => HolidayService.getHolidays(),
    enabled: !!organizationId,
  });

/* ---------- ADD HOLIDAY ---------- */
export const useAddHoliday = () => useApiMutation(HolidayService.addHoliday);

/* ---------- UPDATE HOLIDAY ---------- */
export const useUpdateHoliday = () =>
  useApiMutation(HolidayService.updateHoliday);

/* ---------- DELETE HOLIDAY ---------- */
export const useDeleteHoliday = () =>
  useApiMutation(HolidayService.deleteHoliday);
