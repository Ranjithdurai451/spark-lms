// features/leave-requests/useLeaveRequests.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import LeaveRequestsService from "./LeaveRequestsService";
import { useMemo } from "react";

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

export function useLeaveFilters(leaves: any[], activeTab: string) {
  const filteredLeaves = useMemo(() => {
    return activeTab === "all"
      ? leaves
      : leaves.filter((l) => l.status.toLowerCase() === activeTab);
  }, [leaves, activeTab]);

  const stats = useMemo(
    () => ({
      pending: leaves.filter((l) => l.status === "PENDING").length,
      approved: leaves.filter((l) => l.status === "APPROVED").length,
      rejected: leaves.filter((l) => l.status === "REJECTED").length,
      cancelled: leaves.filter((l) => l.status === "CANCELLED").length,
    }),
    [leaves]
  );

  return { filteredLeaves, stats };
}
