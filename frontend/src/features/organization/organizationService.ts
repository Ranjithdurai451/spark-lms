import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";
import type {
  FullOrganization,
  OrganizationMember,
  Role,
  RoleStats,
} from "@/lib/types";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  getAll?: boolean;
}

export interface PaginatedResponse<T> {
  message: string;
  data: {
    users: T;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      getAll: boolean;
    };
  };
}

class OrganizationService {
  static async getMembers(
    organizationId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<OrganizationMember[]>> {
    console.log("params", params.getAll);
    const { data } = await api.get(`/organizations/${organizationId}/members`, {
      params,
    });
    console.log("data", data);
    return data;
  }

  static async getMemberStats(
    organizationId: string
  ): Promise<ApiResponse<RoleStats>> {
    const { data } = await api.get(
      `/organizations/${organizationId}/members/stats`
    );
    return data;
  }

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

  static async deleteUser(userId: string): Promise<ApiResponse> {
    const { data } = await api.delete(`/organizations/members/${userId}`);
    return data;
  }
}

export default OrganizationService;
