import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  token: z.string().min(1, "Token is required"),
});

export const registerAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationName: z.string().min(2, "Organization name is required"),
  organizationCode: z
    .string()
    .min(1, "Organization code is required")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Only letters, numbers, underscores, and dashes are allowed"
    ),
  organizationDescription: z.string().optional(),
  invitedEmails: z
    .array(
      z.object({
        email: z.string().email("Invalid invited email format"),
      })
    )
    .optional(),
});
export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

// ------------------ Login ------------------
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

// You can export types from these schemas for strong typing in controllers
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
