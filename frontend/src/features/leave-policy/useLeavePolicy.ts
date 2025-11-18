import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";
import LeavePolicyService, {
  type LeavePolicy,
  type LeavePolicyStats,
} from "./leavePolicyService";

/* GET policies (paginated/filter logic if needed) */
export const useGetLeavePolicies = (organizationId: string) =>
  useQuery<ApiResponse<LeavePolicy[]>, AxiosError<ApiResponse>>({
    queryKey: ["leave-policies", organizationId],
    queryFn: () => LeavePolicyService.getAll(organizationId),
    enabled: !!organizationId,
  });

/* GET stats  */
export const useGetLeavePolicyStats = (organizationId: string) =>
  useQuery<ApiResponse<LeavePolicyStats>, AxiosError<ApiResponse>>({
    queryKey: ["leave-policy-stats", organizationId],
    queryFn: () => LeavePolicyService.getStats(organizationId),
    enabled: !!organizationId,
  });

/* CREATE/UPDATE/DELETE  */
export const useCreateLeavePolicy = () =>
  useApiMutation(LeavePolicyService.create);
export const useUpdateLeavePolicy = () =>
  useApiMutation((payload: { id: string; data: Partial<LeavePolicy> }) =>
    LeavePolicyService.update(payload.id, payload.data)
  );
export const useDeleteLeavePolicy = () =>
  useApiMutation(LeavePolicyService.delete);
