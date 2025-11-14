// src/features/holidays/useHolidays.ts
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import HolidayService, {
  type Holiday,
  type HolidayStats,
} from "./holidayService";
import { useApiMutation } from "@/lib/hooks";
import type { ApiResponse } from "@/features/auth/authService";
import { useMemo } from "react";
import { format } from "date-fns";

export const useGetHolidays = (organizationId: string) =>
  useQuery<ApiResponse<Holiday[]>, AxiosError<ApiResponse>>({
    queryKey: ["holidays", organizationId],
    queryFn: () => HolidayService.getHolidays(organizationId),
    enabled: !!organizationId,
  });

/* ---------- GET HOLIDAY STATS ---------- */
export const useGetHolidayStats = (organizationId: string) =>
  useQuery<ApiResponse<HolidayStats>, AxiosError<ApiResponse>>({
    queryKey: ["holiday-stats", organizationId],
    queryFn: () => HolidayService.getHolidayStats(organizationId),
    enabled: !!organizationId,
  });

/* ---------- FILTERS (only filtering in client) ---------- */
export function useHolidaysFilters(
  holidays: Holiday[],
  activeTab: string,
  searchQuery: string
) {
  const filteredByType = useMemo(() => {
    return activeTab === "all"
      ? holidays
      : holidays.filter((h) => h.type.toLowerCase() === activeTab);
  }, [holidays, activeTab]);

  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType;
    const query = searchQuery.toLowerCase();
    return filteredByType.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.description?.toLowerCase().includes(query) ||
        format(new Date(h.date), "MMM dd, yyyy").toLowerCase().includes(query)
    );
  }, [filteredByType, searchQuery]);

  return { filteredHolidays };
}

/* ---------- ADD HOLIDAY ---------- */
export const useAddHoliday = () => useApiMutation(HolidayService.addHoliday);

/* ---------- UPDATE HOLIDAY ---------- */
export const useUpdateHoliday = () =>
  useApiMutation(HolidayService.updateHoliday);

/* ---------- DELETE HOLIDAY ---------- */
export const useDeleteHoliday = () =>
  useApiMutation(HolidayService.deleteHoliday);
