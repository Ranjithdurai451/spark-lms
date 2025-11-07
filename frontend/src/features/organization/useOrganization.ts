// src/features/organization/organizationHooks.ts

import { useQuery } from "@tanstack/react-query";
import OrganizationService from "./organizationService";
import type { ApiResponse } from "@/features/auth/authService";
import type { AxiosError } from "axios";
import type { FullOrganization } from "@/lib/types";
import { useApiMutation } from "@/lib/hooks";

export const useGetOrganizationById = (organizationId: string) =>
  useQuery<ApiResponse<FullOrganization>, AxiosError<ApiResponse>>({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      const res = await OrganizationService.getOrganizationById(organizationId);
      return res;
    },
    enabled: !!organizationId,
  });
export const useInviteMember = () =>
  useApiMutation(OrganizationService.inviteMember);
