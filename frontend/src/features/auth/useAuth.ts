import AuthService from "@/features/auth/authService";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/features/auth/authService";

export function useApiMutation<TFn extends (...args: any[]) => Promise<any>>(
  mutationFn: TFn,
  options?: UseMutationOptions<
    Awaited<ReturnType<TFn>>, // Response type
    AxiosError<ApiResponse>, // Error type
    Parameters<TFn>[0] // Variables type
  >
) {
  return useMutation<
    Awaited<ReturnType<TFn>>,
    AxiosError<ApiResponse>,
    Parameters<TFn>[0]
  >({
    mutationFn,
    ...options,
  });
}

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
export const useResetPassword = () =>
  useApiMutation(
    ({ token, payload }: { token: string; payload: { newPassword: string } }) =>
      AuthService.resetPassword(token, payload)
  );

//  Send Email Verification OTP
export const useSendEmailVerificationOtp = () =>
  useApiMutation(AuthService.sendEmailVerificationOtp);

//  Verify Email
export const useVerifyEmail = () => useApiMutation(AuthService.verifyEmail);

//  Logout
export const useLogout = () => useApiMutation(AuthService.logout);
