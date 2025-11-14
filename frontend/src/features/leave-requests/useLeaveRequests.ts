// features/leave-requests/useLeaveRequests.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import LeaveRequestsService, {
  type LeaveRequest,
  type LeaveRequestStats,
} from "./LeaveRequestsService";
import { useMemo } from "react";
import type { AxiosError } from "axios";
import type { ApiResponse } from "../auth/authService";
export function useGetAllLeaves(organizationId: string) {
  return useQuery<ApiResponse<LeaveRequest[]>, AxiosError<ApiResponse>>({
    queryKey: ["leave-requests", organizationId],
    queryFn: () => LeaveRequestsService.getAllLeaves(organizationId),
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

export function useLeaveFilters(leaves: LeaveRequest[], activeTab: string) {
  const filteredLeaves = useMemo(() => {
    return activeTab === "all"
      ? leaves
      : leaves.filter((l) => l.status.toLowerCase() === activeTab);
  }, [leaves, activeTab]);

  return { filteredLeaves };
}
