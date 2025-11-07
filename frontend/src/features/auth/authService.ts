/* ---------- Types ---------- */

import { api } from "@/config/axios";
import type { User } from "@/lib/types";

// Common user structure

// Response wrapper for successful operations
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
}

/* ---------- AuthService ---------- */

class AuthService {
  /* ---------------- Register Admin ---------------- */
  static async registerAdmin(payload: {
    email: string;
    username: string;
    password: string;
    organizationName: string;
    organizationCode: string;
    organizationDescription?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const { data } = await api.post("/auth/register-admin", payload);
    return data;
  }

  /* ---------------- Send Member Invite ---------------- */
  static async sendMemberInvite(payload: {
    invitedEmail: string;
    role: "ADMIN" | "MEMBER";
  }): Promise<ApiResponse> {
    const { data } = await api.post("/auth/send-invite", payload);
    return data;
  }

  /* ---------------- Accept Invite ---------------- */
  static async acceptInvite(payload: {
    token: string;
    username: string;
    password: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const { data } = await api.post("/auth/accept-invite", payload);
    return data;
  }

  /* ---------------- Login ---------------- */
  static async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const { data } = await api.post("/auth/login", payload);
    return data;
  }

  /* ---------------- Check Auth Status ---------------- */
  static async checkAuth(): Promise<ApiResponse<{ user: User }>> {
    const { data } = await api.get("/auth/check");
    return data;
  }

  /* ---------------- Logout ---------------- */
  static async logout(): Promise<ApiResponse> {
    const { data } = await api.post("/auth/logout");
    return data;
  }

  /* ---------------- Forgot Password ---------------- */
  static async forgotPassword(payload: {
    email: string;
  }): Promise<ApiResponse> {
    const { data } = await api.post("/auth/forgot-password", payload);
    return data;
  }

  /* ---------------- Reset Password ---------------- */
  static async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const { data } = await api.post("/auth/reset-password/", payload);
    return data;
  }

  /* ---------------- Send Email Verification OTP ---------------- */
  static async sendEmailVerificationOtp(payload: {
    email: string;
  }): Promise<ApiResponse<{ otpToken: string }>> {
    const { data } = await api.post("/auth/send-otp", payload);
    return data;
  }

  /* ---------------- Verify Email ---------------- */
  static async verifyEmail(payload: {
    otp: string;
    token: string;
  }): Promise<ApiResponse<{ email: string }>> {
    const { data } = await api.post("/auth/verify-email", payload);
    return data;
  }
}

export default AuthService;
