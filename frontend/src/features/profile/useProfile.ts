import { useQuery, useMutation } from "@tanstack/react-query";
import ProfileService, { type DashboardStatsAPI } from "./profileService";
import type { ApiResponse } from "../auth/authService";
import type { AxiosError } from "axios";

export function useGetProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getProfile(userId),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (username: string) => ProfileService.updateProfile(username),
  });
}

export function useDashboardStats() {
  return useQuery<ApiResponse<DashboardStatsAPI>, AxiosError>({
    queryKey: ["dashboard-stats"],
    queryFn: ProfileService.getDashboardStats,
  });
}
