import type { SendMailOptions } from "nodemailer";
import { transporter } from "../config/nodemailer.js";
import jwt from "jsonwebtoken";

const APP_NAME = process.env.APP_NAME || "SparkLMS";
const EMAIL_USER = process.env.EMAIL_USER || "no_official@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL!;

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: SendMailOptions["attachments"];
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: SendEmailOptions) => {
  await transporter.sendMail({
    from: `${APP_NAME} <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

export const getPasswordResetEmail = (resetUrl: string) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#ec4899;letter-spacing:1px;">${APP_NAME}</span>
        </div>
        <h2 style="color:#ec4899;margin-bottom:8px;">Password Reset Request</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Click the button below to reset your password. This link will expire soon.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#ec4899;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:1.1rem;display:inline-block;">Reset Password</a>
        </div>
        <p style="color:#6b7280;font-size:0.97rem;margin-bottom:0;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
  const text = `Reset your password using this link: ${resetUrl}\nIf you did not request this, please ignore this email.`;
  return { html, text };
};

export const sendOtpEmail = async (otp: string, email: string) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#ec4899;letter-spacing:1px;">${APP_NAME}</span>
        </div>
        <h2 style="color:#ec4899;margin-bottom:8px;">Your OTP Code</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Your OTP is <strong style="color:#ec4899;">${otp}</strong>. It will expire in 10 minutes.</p>
      </div>
    </div>
  `;
  const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;
  await sendEmail({
    to: email,
    subject: "Email Verification - SparkLMS",
    text,
    html,
  });
};
export const sendMemberInviteEmail = async ({
  invitedEmail,
  role,
  organizationId,
  organizationName,
}: {
  invitedEmail: string;
  role: "HR" | "Employee";
  organizationId: string;
  organizationName: string;
}) => {
  try {
    // Create signed token
    const inviteToken = jwt.sign(
      { email: invitedEmail, organizationId, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate invite link
    const inviteLink = `${FRONTEND_BASE_URL}/invite?token=${inviteToken}`;

    // Compose email
    const subject = `Invitation to join ${organizationName}`;
    const text = `You’ve been invited to join ${organizationName} as ${role}.
Click the link below to accept your invite:
${inviteLink}`;

    // Send the email
    await sendEmail({
      to: invitedEmail,
      subject,
      text,
    });

    return { email: invitedEmail, status: "sent" as const };
  } catch (err: any) {
    console.error(`❌ Failed to send invite to ${invitedEmail}:`, err.message);
    return {
      email: invitedEmail,
      status: "failed" as const,
      error: err.message || "Email send failed",
    };
  }
};
