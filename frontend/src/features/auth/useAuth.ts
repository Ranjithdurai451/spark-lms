import AuthService from "@/features/auth/authService";
import { useApiMutation, useAppDispatch } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";

//  Register Admin
export const useRegisterAdmin = () => useApiMutation(AuthService.registerAdmin);

//  Accept Invite
export const useAcceptInvite = () => useApiMutation(AuthService.acceptInvite);

//  Login
export const useLoginUser = () => useApiMutation(AuthService.login);

//  Forgot Password
export const useForgotPassword = () =>
  useApiMutation(AuthService.forgotPassword);

//  Reset Password (special case with multiple args)
export const useResetPassword = () => useApiMutation(AuthService.resetPassword);

//  Send Email Verification OTP
export const useSendEmailVerificationOtp = () =>
  useApiMutation(AuthService.sendEmailVerificationOtp);

//  Verify Email
export const useVerifyEmail = () => useApiMutation(AuthService.verifyEmail);

//  Logout
export const useLogout = () => useApiMutation(AuthService.logout);
export const useCheckAuth = () =>
  useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const res = await AuthService.checkAuth();
      return res.data;
    },
    retry: false,
  });
import { useAppSelector } from "@/lib/hooks";
import { useEffect } from "react";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError } = useCheckAuth();
  useEffect(() => {
    if (data) dispatch.auth.setUser(data.user);
    else dispatch.auth.clearUser();
  }, [data]);

  const hasAccess = (allowedRoles: string[] = []) => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role);
  };
  const isCurrentUser = (resourceUserId?: string) => {
    return user?.id === resourceUserId;
  };

  return { user, isLoading, isError, hasAccess, isCurrentUser };
}
