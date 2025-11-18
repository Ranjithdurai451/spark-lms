import { useQuery } from "@tanstack/react-query";
import OrganizationService, {
  type PaginationParams,
  type PaginatedResponse,
} from "./organizationService";
import type { ApiResponse } from "@/features/auth/authService";
import type { AxiosError } from "axios";
import type { OrganizationMember, RoleStats } from "@/lib/types";
import { useApiMutation } from "@/lib/hooks";

/* ---------- INVITE MEMBER ---------- */
export const useInviteMember = () =>
  useApiMutation(OrganizationService.inviteMember);

/* ---------- UPDATE USER ---------- */
export const useUpdateUser = () =>
  useApiMutation(OrganizationService.updateUser);

/* ---------- DELETE USER ---------- */
export const useDeleteUser = () =>
  useApiMutation(OrganizationService.deleteUser);

/* --- MEMBER LIST WITH PAGINATION --- */
export function useOrganizationMembers(
  organizationId: string,
  params: PaginationParams
) {
  return useQuery<
    PaginatedResponse<OrganizationMember[]>,
    AxiosError<ApiResponse>
  >({
    queryKey: ["organization-members", organizationId, params],
    queryFn: () => OrganizationService.getMembers(organizationId, params),
    enabled: !!organizationId,
  });
}

/* --- MEMBER STATS --- */
export function useMemberStats(organizationId: string) {
  return useQuery<ApiResponse<RoleStats>, AxiosError<ApiResponse>>({
    queryKey: ["organization-member-stats", organizationId],
    queryFn: () => OrganizationService.getMemberStats(organizationId),
    enabled: !!organizationId,
  });
}
