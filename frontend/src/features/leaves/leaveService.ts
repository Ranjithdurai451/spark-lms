import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Leave {
  id: string;
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  employee?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  approver?: {
    id: string;
    username: string;
    email: string;
  };
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveInput {
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  days: number;
}

export interface UpdateLeaveInput {
  type?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  status?: LeaveStatus;
}

class LeaveService {
  static async getAll(orgId: string): Promise<ApiResponse<Leave[]>> {
    const { data } = await api.get(`/leaves?organizationId=${orgId}`);
    return data;
  }

  static async create(
    payload: CreateLeaveInput & { organizationId: string }
  ): Promise<ApiResponse<Leave>> {
    const { data } = await api.post(`/leaves`, payload);
    return data;
  }

  static async update(payload: {
    id: string;
    data: UpdateLeaveInput;
  }): Promise<ApiResponse<Leave>> {
    const { data } = await api.put(`/leaves/${payload.id}`, payload.data);
    return data;
  }

  static async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete(`/leaves/${id}`);
    return data;
  }
}

export default LeaveService;
