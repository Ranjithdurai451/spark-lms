import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import HolidayService, {
  type HolidayStats,
  type HolidayPaginationParams,
  type PaginatedHolidayResponse,
} from "./holidayService";
import { useApiMutation } from "@/lib/hooks";
import type { ApiResponse } from "@/features/auth/authService";

/* ---------- GET HOLIDAYS (Paginated or All) ---------- */
export const useGetHolidays = (
  organizationId: string,
  params: HolidayPaginationParams
) =>
  useQuery<PaginatedHolidayResponse, AxiosError<ApiResponse>>({
    queryKey: ["holidays", organizationId, params],
    queryFn: () => HolidayService.getHolidays(organizationId, params),
    enabled: !!organizationId,
  });

/* ---------- GET HOLIDAY STATS ---------- */
export const useGetHolidayStats = (organizationId: string) =>
  useQuery<ApiResponse<HolidayStats>, AxiosError<ApiResponse>>({
    queryKey: ["holiday-stats", organizationId],
    queryFn: () => HolidayService.getHolidayStats(organizationId),
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
