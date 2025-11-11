// features/leave-requests/useLeaveRequests.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import LeaveRequestsService from "./LeaveRequestsService";

export function useGetAllLeaves() {
  return useQuery({
    queryKey: ["leave-requests"],
    queryFn: () => LeaveRequestsService.getAllLeaves(),
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
