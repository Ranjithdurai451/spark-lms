// src/features/organization/organizationService.ts

import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";
import type { FullOrganization, Role } from "@/lib/types";

class OrganizationService {
  /* ---------- Get Organization by ID ---------- */
  static async getOrganizationById(
    organizationId: string
  ): Promise<ApiResponse<FullOrganization>> {
    const { data } = await api.get(`/organizations/${organizationId}`);
    return data;
  }
  static async inviteMember(payload: {
    invitedEmail: string;
    role: Role;
    managerId: string;
  }): Promise<ApiResponse> {
    const { data } = await api.post(`/organizations/invite-member`, payload);
    return data;
  }
}

export default OrganizationService;
