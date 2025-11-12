// src/features/organization/organizationHooks.ts

import { useQuery } from "@tanstack/react-query";
import OrganizationService from "./organizationService";
import type { ApiResponse } from "@/features/auth/authService";
import type { AxiosError } from "axios";
import type { FullOrganization } from "@/lib/types";
import { useApiMutation } from "@/lib/hooks";
import { useMemo } from "react";

/* ---------- GET ORGANIZATION ---------- */
export const useGetOrganizationById = (organizationId: string) =>
  useQuery<ApiResponse<FullOrganization>, AxiosError<ApiResponse>>({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      const res = await OrganizationService.getOrganizationById(organizationId);
      return res;
    },
    enabled: !!organizationId,
  });

/* ---------- INVITE MEMBER ---------- */
export const useInviteMember = () =>
  useApiMutation(OrganizationService.inviteMember);

/* ---------- UPDATE USER ---------- */
export const useUpdateUser = () =>
  useApiMutation(OrganizationService.updateUser);

/* ---------- DELETE USER ---------- */
export const useDeleteUser = () =>
  useApiMutation(OrganizationService.deleteUser);

export function useOrganizationMembers(members: any[], searchQuery: string) {
  // Filter members based on search
  const filteredMembers = useMemo(() => {
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

  // Calculate role stats
  const roleStats = useMemo(
    () => ({
      total: members.length,
      admin: members.filter((m) => m.role === "ADMIN").length,
      hr: members.filter((m) => m.role === "HR").length,
      manager: members.filter((m) => m.role === "MANAGER").length,
      employee: members.filter((m) => m.role === "EMPLOYEE").length,
    }),
    [members]
  );

  return {
    filteredMembers,
    roleStats,
  };
}
