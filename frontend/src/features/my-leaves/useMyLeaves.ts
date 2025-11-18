// features/my-leaves/useMyLeaves.ts
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";
import LeaveService, {
  type MyLeaveFilterParams,
  type MyLeavesResponse,
  type MyLeaveStats,
  type LeaveBalance,
} from "./MyleavesService";

// Get my leaves with filters
export const useGetMyLeaves = (params?: MyLeaveFilterParams) =>
  useQuery<MyLeavesResponse, AxiosError>({
    queryKey: ["my-leaves", params],
    queryFn: () => LeaveService.getMyLeaves(params),
  });

// Get my leave stats
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
