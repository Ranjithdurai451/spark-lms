// features/leaves/useLeaves.ts
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import LeaveService from "./MyleavesService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";
import type { Leave, LeaveBalance } from "./MyleavesService";

// Get my leaves (for employees)
export const useGetMyLeaves = () =>
  useQuery<ApiResponse<Leave[]>, AxiosError>({
    queryKey: ["my-leaves"],
    queryFn: async () => LeaveService.getMyLeaves(),
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
