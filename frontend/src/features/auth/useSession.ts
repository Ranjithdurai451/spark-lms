import { api } from "@/config/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Session {
  id: string;
  email: string;
  username: string;
  role: string;
  organization: {
    id: string;
    organizationName: string;
    organizationCode: string;
  } | null;
  manager: {
    id: string;
    username: string;
  } | null;
  isActive: boolean;
  addedAt: number;
}
export const useGetSessions = () => {
  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api.get("/auth/sessions");
      return res.data.data.sessions;
    },
    staleTime: 1000 * 60 * 5,
  });
};
export const useSwitchSession = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post("/auth/switch-session", { userId });
      return res.data?.data?.user;
    },
  });
};
export const useRemoveSession = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post("/auth/remove-session", { userId });
      return res.data;
    },
  });
};
