// features/profile/profileService.ts
import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";
import type { Holiday } from "../holidays/holidayService";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  managerId?: string;
  manager?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  organization: {
    id: string;
    organizationName: string;
    organizationCode: string;
  };
  stats: {
    leaveDaysTaken: number;
    pendingLeaves: number;
    directReportsCount: number;
  };
  directReports: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
  }>;
}
// src/features/dashboard/types.ts
export interface Upcoming {
  days: number;
  dates: string;
}
export interface DashboardStatsInner {
  totalBalance: number;
  totalAllocated: number;
  pending: number;
  approved: number;
  utilizationPercent: number;
  upcoming: Upcoming | null;
}
export interface TeamStats {
  totalEmployees: number;
  onLeaveToday: number;
  pendingCount: number;
}
export interface PendingApproval {
  id: string;
  employee: string;
  dates: string;
  type: string;
  reason: string;
  days: number;
  leave: any;
}
export interface RecentApproval {
  employee: string;
  type: string;
  dates: string;
  days: number;
}
export interface DashboardStatsAPI {
  isAdmin: boolean;
  stats: DashboardStatsInner;
  teamStats: TeamStats | null;
  pendingApprovals: PendingApproval[];
  recentApprovals: RecentApproval[];
  upcomingHolidays: Holiday[];
}

class ProfileService {
  static async getProfile(userId?: string): Promise<ApiResponse<UserProfile>> {
    const endpoint = userId ? `/users/profile/${userId}` : `/users/profile`;
    const { data } = await api.get(endpoint);
    return data;
  }

  static async updateProfile(username: string): Promise<ApiResponse<any>> {
    const { data } = await api.patch(`/users/profile`, { username });
    return data;
  }
  static async getDashboardStats(): Promise<ApiResponse<DashboardStatsAPI>> {
    const { data } = await api.get("/users/dashboard-stats");
    return data;
  }
}

export default ProfileService;
