// src/features/leave-policy/useLeavePolicy.ts
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";
import LeavePolicyService, { type LeavePolicy } from "./leavePolicyService";

/* GET all leave policies */
export const useGetLeavePolicies = (organizationId: string) =>
  useQuery<ApiResponse<LeavePolicy[]>, AxiosError<ApiResponse>>({
    queryKey: ["leave-policies", organizationId],
    queryFn: async () => {
      const res = await LeavePolicyService.getAll();
      return res;
    },
    enabled: !!organizationId,
  });

/* CREATE */
export const useCreateLeavePolicy = () =>
  useApiMutation(LeavePolicyService.create);

/* UPDATE */
export const useUpdateLeavePolicy = () =>
  useApiMutation((payload: { id: string; data: Partial<LeavePolicy> }) =>
    LeavePolicyService.update(payload.id, payload.data)
  );

/* DELETE */
export const useDeleteLeavePolicy = () =>
  useApiMutation(LeavePolicyService.delete);
