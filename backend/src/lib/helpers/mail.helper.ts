import type { SendMailOptions } from "nodemailer";
import { transporter } from "../config/nodemailer.js";
import { createToken } from "./auth.helper.js";
import { type memberInviteTokenPayload } from "../types.js";
import { Role } from "@prisma/client";
import { APP_NAME, EMAIL_USER, FRONTEND_BASE_URL } from "../constants.js";

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

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:1.8rem;font-weight:700;color:#ec4899;">${APP_NAME}</span>
        </div>
        <h2 style="color:#ec4899;margin-bottom:12px;text-align:center;">Password Reset Request</h2>
        <p style="font-size:1rem;color:#334155;text-align:center;">You requested to reset your password. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;background:#ec4899;color:#fff;text-decoration:none;padding:12px 28px;font-size:1rem;font-weight:600;border-radius:8px;">
            Reset My Password
          </a>
        </div>
        <p style="font-size:0.9rem;color:#64748b;text-align:center;">If you didn’t request a password reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="font-size:0.75rem;color:#94a3b8;text-align:center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
You requested to reset your password for ${APP_NAME}.
Reset it here: ${resetUrl}
If you didn’t request this, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: `Reset Your Password - ${APP_NAME}`,
    text,
    html,
  });
};

export const sendOtpEmail = async (otp: string, email: string) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px;">
        
        <!-- Header -->
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:1.8rem;font-weight:700;color:#ec4899;letter-spacing:0.5px;">${APP_NAME}</span>
        </div>

        <!-- Title -->
        <h2 style="color:#ec4899;margin-bottom:12px;text-align:center;">Email Verification OTP</h2>
        <p style="font-size:1rem;color:#334155;text-align:center;">
          Use the OTP below to verify your email address. This code will expire in <strong>10 minutes</strong>.
        </p>

        <!-- OTP Button -->
        <div style="text-align:center;margin:24px 0;">
          <div style="
            display:inline-block;
            padding:14px 36px;
            font-size:1.6rem;
            font-weight:700;
            color:#ffffff;
            background:#ec4899;
            border-radius:12px;
            letter-spacing:2px;
            cursor:pointer;
            user-select:all;
          ">
            ${otp}
          </div>
          <p style="font-size:0.85rem;color:#64748b;text-align:center;margin-top:8px;">
            Tap or click the code above to select and copy it.
          </p>
        </div>

        <!-- Footer Note -->
        <p style="font-size:0.9rem;color:#64748b;text-align:center;">
          If you did not request this, please ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="font-size:0.75rem;color:#94a3b8;text-align:center;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `
Your OTP for ${APP_NAME} is ${otp}.
It will expire in 10 minutes.

If you didn’t request this, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: `Email Verification - ${APP_NAME}`,
    text,
    html,
  });
};

export const sendMemberInviteEmail = async ({
  invitedEmail,
  role,
  organizationId,
  organizationName,
  managerId,
}: {
  invitedEmail: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  managerId: string;
}) => {
  try {
    const inviteToken = createToken<memberInviteTokenPayload>(
      {
        email: invitedEmail,
        organizationId,
        role,
        managerId,
      },
      "7d"
    );

    const inviteLink = `${FRONTEND_BASE_URL}/invite?token=${inviteToken}`;

    const subject = `Invitation to join ${organizationName}`;
    const html = `
      <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;font-size:1.8rem;font-weight:700;color:#ec4899;">${organizationName}</span>
          </div>
          <h2 style="color:#ec4899;margin-bottom:16px;text-align:center;">You're Invited!</h2>
          <p style="font-size:1rem;color:#334155;text-align:center;margin-bottom:24px;">
            You've been invited to join <strong>${organizationName}</strong> as <strong>${role}</strong>.
          </p>
          <div style="text-align:center;">
            <a href="${inviteLink}" target="_blank"
              style="display:inline-block;background:#ec4899;color:#fff;text-decoration:none;padding:12px 28px;
              font-size:1rem;font-weight:600;border-radius:8px;">
              Accept Invitation
            </a>
          </div>
        </div>
      </div>
    `;

    const text = `You've been invited to join ${organizationName} as ${role}.
Accept your invitation here: ${inviteLink}`;

    await sendEmail({
      to: invitedEmail,
      subject,
      text,
      html,
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
