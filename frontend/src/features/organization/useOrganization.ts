// src/features/organization/organizationHooks.ts

import { useQuery } from "@tanstack/react-query";
import OrganizationService from "./organizationService";
import type { ApiResponse } from "@/features/auth/authService";
import type { AxiosError } from "axios";
import type { OrganizationMember, RoleStats } from "@/lib/types";
import { useApiMutation } from "@/lib/hooks";
import { useMemo } from "react";

/* ---------- INVITE MEMBER ---------- */
export const useInviteMember = () =>
  useApiMutation(OrganizationService.inviteMember);

/* ---------- UPDATE USER ---------- */
export const useUpdateUser = () =>
  useApiMutation(OrganizationService.updateUser);

/* ---------- DELETE USER ---------- */
export const useDeleteUser = () =>
  useApiMutation(OrganizationService.deleteUser);

/* --- MEMBER LIST --- */
export function useOrganizationMembers(organizationId: string) {
  return useQuery<ApiResponse<OrganizationMember[]>, AxiosError<ApiResponse>>({
    queryKey: ["organization-members", organizationId],
    queryFn: () => OrganizationService.getMembers(organizationId),
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

/* --- FILTER MEMBERS --- */
export function useFilteredMembers(
  members: OrganizationMember[],
  searchQuery: string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.username.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.manager?.username.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);
}
