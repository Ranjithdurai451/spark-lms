// features/leave-requests/leaveRequestsService.ts
import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  type: string;
  reason?: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  employee: {
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

export interface LeaveRequestStats {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

class LeaveRequestsService {
  static async getAllLeaves(
    orgId: string
  ): Promise<ApiResponse<LeaveRequest[]>> {
    const { data } = await api.get(`/leaves`, {
      params: { organizationId: orgId },
    });
    return data;
  }
  static async getAllLeaveStats(
    orgId: string
  ): Promise<ApiResponse<LeaveRequestStats>> {
    const { data } = await api.get(`/leaves/stats`, {
      params: { organizationId: orgId },
    });
    return data;
  }
  static async updateLeaveStatus(
    id: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<ApiResponse<LeaveRequest>> {
    const { data } = await api.patch(`/leaves/${id}/status`, { status });
    return data;
  }

  static async deleteLeave(id: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete(`/leaves/${id}`);
    return data;
  }
}

export default LeaveRequestsService;
