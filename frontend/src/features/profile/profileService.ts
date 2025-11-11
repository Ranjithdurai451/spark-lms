// features/profile/profileService.ts
import { api } from "@/config/axios";
import type { ApiResponse } from "@/features/auth/authService";

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
}

export default ProfileService;
