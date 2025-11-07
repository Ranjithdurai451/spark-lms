import AuthService from "@/features/auth/authService";
import { useApiMutation } from "@/lib/hooks";
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
