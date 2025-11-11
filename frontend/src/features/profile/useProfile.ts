import { useQuery, useMutation } from "@tanstack/react-query";
import ProfileService from "./profileService";

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
