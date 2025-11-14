// src/features/leave-policy/leavePolicyService.ts
import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

// src/features/leave-policy/types.ts
export interface LeavePolicy {
  id: string;
  name: string;
  description?: string;
  maxDays: number;
  carryForward: number;
  requiresApproval: boolean;
  minNotice: number;
  active: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePolicyStats {
  total: number;
  active: number;
  avgDays: number;
  totalDays: number;
}

class LeavePolicyService {
  /* Get all leave policies by organization */
  static async getAll(orgId: string): Promise<ApiResponse<LeavePolicy[]>> {
    const { data } = await api.get(`/leave-policies`, {
      params: { organizationId: orgId },
    });
    return data;
  }
  static async getStats(orgId: string): Promise<ApiResponse<LeavePolicyStats>> {
    const { data } = await api.get(`/leave-policies/stats`, {
      params: { organizationId: orgId },
    });
    return data;
  }

  /* Create leave policy */
  static async create(
    payload: Omit<LeavePolicy, "id" | "createdAt" | "updatedAt">
  ) {
    const { data } = await api.post(`/leave-policies`, payload);
    return data;
  }

  /* Update leave policy */
  static async update(id: string, payload: Partial<LeavePolicy>) {
    const { data } = await api.put(`/leave-policies/${id}`, payload);
    return data;
  }

  /* Delete leave policy */
  static async delete(id: string) {
    const { data } = await api.delete(`/leave-policies/${id}`);
    return data;
  }
}

export default LeavePolicyService;
