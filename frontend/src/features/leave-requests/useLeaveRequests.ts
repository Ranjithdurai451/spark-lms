import { useQuery, useMutation } from "@tanstack/react-query";
import LeaveRequestsService, {
  type LeaveRequestStats,
  type LeavePaginationParams,
  type PaginatedLeaveResponse,
} from "./LeaveRequestsService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../auth/authService";

export function useGetAllLeaves(
  organizationId: string,
  params: LeavePaginationParams
) {
  return useQuery<PaginatedLeaveResponse, AxiosError<ApiResponse>>({
    queryKey: ["leave-requests", organizationId, params],
    queryFn: () => LeaveRequestsService.getAllLeaves(organizationId, params),
    enabled: !!organizationId,
  });
}

export function useGetAllLeaveStats(organizationId: string) {
  return useQuery<ApiResponse<LeaveRequestStats>, AxiosError<ApiResponse>>({
    queryKey: ["leave-request-stats", organizationId],
    queryFn: () => LeaveRequestsService.getAllLeaveStats(organizationId),
    enabled: !!organizationId,
  });
}

export function useUpdateLeaveStatus() {
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => LeaveRequestsService.updateLeaveStatus(id, status),
  });
}

export function useDeleteLeave() {
  return useMutation({
    mutationFn: (id: string) => LeaveRequestsService.deleteLeave(id),
  });
}
