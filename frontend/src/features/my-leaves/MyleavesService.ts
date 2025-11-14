// features/leaves/leaveService.ts
import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

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
export interface MyLeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface CreateLeaveInput {
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  days: number;
  notifyUsers: string[];
}

export interface LeaveBalance {
  id: string;
  totalDays: number;
  remainingDays: number;
  usedDays: number;
  carryForward: number;
  leavePolicy: {
    id: string;
    name: string;
    description?: string;
    maxDays: number;
    carryForward: number;
    requiresApproval: boolean;
    minNotice: number;
    active: boolean;
  };
}

class LeaveService {
  static async getMyLeaves(): Promise<ApiResponse<Leave[]>> {
    const { data } = await api.get(`/leaves/my`);
    return data;
  }
  static async getMyLeaveStats(): Promise<ApiResponse<MyLeaveStats>> {
    const { data } = await api.get(`/leaves/my/stats`);
    return data;
  }
  static async create(
    payload: CreateLeaveInput & { organizationId: string }
  ): Promise<ApiResponse<Leave>> {
    const { data } = await api.post(`/leaves`, payload);
    return data;
  }

  static async cancelLeave(id: string): Promise<ApiResponse<Leave>> {
    const { data } = await api.patch(`/leaves/${id}/cancel`);
    return data;
  }

  static async getMyBalances(): Promise<ApiResponse<LeaveBalance[]>> {
    const { data } = await api.get(`/leave-balances/me`);
    return data;
  }
}

export default LeaveService;
