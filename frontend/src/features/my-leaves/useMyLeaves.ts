// features/leaves/useLeaves.ts
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import LeaveService from "./MyleavesService";
import type { AxiosError } from "axios";
import { useMemo } from "react";
import type { ApiResponse } from "@/features/auth/authService";
import type { Leave, LeaveBalance, MyLeaveStats } from "./MyleavesService";

// Get my leaves (for employees)
export const useGetMyLeaves = () =>
  useQuery<ApiResponse<Leave[]>, AxiosError>({
    queryKey: ["my-leaves"],
    queryFn: () => LeaveService.getMyLeaves(),
  });

// Get my leave stats (backend calculated!)
export const useGetMyLeaveStats = () =>
  useQuery<ApiResponse<MyLeaveStats>, AxiosError>({
    queryKey: ["my-leave-stats"],
    queryFn: () => LeaveService.getMyLeaveStats(),
  });
// Get my leave balances
export const useGetMyLeaveBalances = () =>
  useQuery<ApiResponse<LeaveBalance[]>, AxiosError>({
    queryKey: ["leave-balances"],
    queryFn: async () => LeaveService.getMyBalances(),
  });

// Create leave request
export const useAddLeave = () => useApiMutation(LeaveService.create);

// Cancel leave (only for pending leaves)
export const useCancelLeave = () => useApiMutation(LeaveService.cancelLeave);

export function useMyLeaveFilters(leaves: Leave[], activeTab: string) {
  const filteredLeaves = useMemo(() => {
    return activeTab === "all"
      ? leaves
      : leaves.filter((l) => l.status.toLowerCase() === activeTab);
  }, [leaves, activeTab]);
  return { filteredLeaves };
}
