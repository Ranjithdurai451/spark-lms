import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import LeaveService from "./leaveService";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";
import type { Leave } from "./leaveService";

export const useGetLeaves = (orgId: string) =>
  useQuery<ApiResponse<Leave[]>, AxiosError>({
    queryKey: ["leaves", orgId],
    queryFn: async () => LeaveService.getAll(orgId),
    enabled: !!orgId,
  });

export const useAddLeave = () => useApiMutation(LeaveService.create);
export const useUpdateLeave = () => useApiMutation(LeaveService.update);
export const useDeleteLeave = () => useApiMutation(LeaveService.delete);
