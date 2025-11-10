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

  /* ---------- Invite Member ---------- */
  static async inviteMember(payload: {
    invitedEmail: string;
    role: Role;
    managerId: string;
  }): Promise<ApiResponse> {
    const { data } = await api.post(`/organizations/invite-member`, payload);
    return data;
  }

  /* ---------- Update User ---------- */
  static async updateUser(payload: {
    id: string;
    username?: string;
    role?: Role;
    managerId?: string | null;
  }): Promise<ApiResponse> {
    const { data } = await api.put(`/organizations/members/${payload.id}`, {
      username: payload.username,
      role: payload.role,
      managerId: payload.managerId,
    });
    return data;
  }

  /* ---------- Delete User ---------- */
  static async deleteUser(userId: string): Promise<ApiResponse> {
    const { data } = await api.delete(`/organizations/members/${userId}`);
    return data;
  }
}

export default OrganizationService;
