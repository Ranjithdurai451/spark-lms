// src/features/organization/organizationHooks.ts

import { useQuery } from "@tanstack/react-query";
import OrganizationService from "./organizationService";
import type { ApiResponse } from "@/features/auth/authService";
import type { AxiosError } from "axios";
import type { FullOrganization } from "@/lib/types";
import { useApiMutation } from "@/lib/hooks";

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
