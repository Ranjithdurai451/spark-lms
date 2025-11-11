import type { SendMailOptions } from "nodemailer";
import { transporter } from "../config/nodemailer.js";
import { createToken } from "./auth.helper.js";
import { Role, type memberInviteTokenPayload } from "../types.js";
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

export const sendLeaveRequestEmail = async ({
  to,
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason,
}: {
  to: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
}) => {
  const subject = `Leave Request from ${employeeName}`;

  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);padding:32px 24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Leave Request</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Action Required</p>
        </div>

        <!-- Content -->
        <div style="padding:32px 24px;">
          <p style="font-size:16px;color:#1e293b;margin:0 0 24px;">
            Hi,
          </p>
          
          <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">
            <strong>${employeeName}</strong> has requested time off and requires your approval.
          </p>

          <!-- Leave Details Card -->
          <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Employee:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${employeeName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Leave Type:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${leaveType}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Duration:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${days} day${
    days > 1 ? "s" : ""
  }</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">From:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${startDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">To:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${endDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              ${
                reason
                  ? `
              <tr>
                <td colspan="2" style="padding:16px 0 8px;color:#64748b;font-size:14px;">Reason:</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:0;color:#475569;font-size:14px;line-height:1.6;">${reason}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align:center;margin:32px 0 24px;">
            <a href="${process.env.FRONTEND_BASE_URL}/leaves" 
               style="display:inline-block;background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);color:#ffffff;text-decoration:none;padding:14px 32px;font-size:15px;font-weight:600;border-radius:8px;box-shadow:0 4px 12px rgba(99,102,241,0.3);">
              Review Request
            </a>
          </div>

          <p style="font-size:14px;color:#64748b;margin:24px 0 0;line-height:1.6;">
            Please review and approve or reject this request at your earliest convenience.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            This is an automated email from your Leave Management System.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `Leave Request from ${employeeName}

Leave Type: ${leaveType}
Duration: ${days} day(s)
From: ${startDate.toLocaleDateString()}
To: ${endDate.toLocaleDateString()}
${reason ? `Reason: ${reason}` : ""}

Please review this request in your leave management system.`;

  await sendEmail({ to, subject, text, html });
};

export const sendLeaveStatusEmail = async ({
  to,
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  status,
  approverName,
}: {
  to: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
  status: "APPROVED" | "REJECTED";
  approverName: string;
}) => {
  const isApproved = status === "APPROVED";
  const subject = `Leave Request ${isApproved ? "Approved" : "Rejected"}`;

  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:${
          isApproved
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        };padding:32px 24px;text-align:center;">
          <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;">${isApproved ? "✓" : "✗"}</span>
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Leave Request ${status}</h1>
        </div>

        <!-- Content -->
        <div style="padding:32px 24px;">
          <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">
            Hi <strong>${employeeName}</strong>,
          </p>
          
          <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">
            Your leave request has been <strong style="color:${
              isApproved ? "#10b981" : "#ef4444"
            };">${status.toLowerCase()}</strong> by ${approverName}.
          </p>

          <!-- Leave Details Card -->
          <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Leave Type:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${leaveType}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Duration:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${days} day${
    days > 1 ? "s" : ""
  }</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">From:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${startDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">To:</td>
                <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${endDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
            </table>
          </div>

          ${
            isApproved
              ? `
          <div style="background:#d1fae5;border-left:4px solid #10b981;padding:16px;border-radius:8px;margin:24px 0;">
            <p style="font-size:14px;color:#065f46;margin:0;line-height:1.6;">
              <strong>✓ Approved:</strong> Your leave has been confirmed. Please ensure all tasks are delegated before your leave starts.
            </p>
          </div>
          `
              : `
          <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:24px 0;">
            <p style="font-size:14px;color:#991b1b;margin:0;line-height:1.6;">
              <strong>✗ Rejected:</strong> Your leave request was not approved. Please contact your manager for more details.
            </p>
          </div>
          `
          }

          <div style="text-align:center;margin:32px 0 24px;">
            <a href="${process.env.FRONTEND_BASE_URL}/leaves" 
               style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;padding:14px 32px;font-size:15px;font-weight:600;border-radius:8px;">
              View Leave Details
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            This is an automated email from your Leave Management System.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to,
    subject,
    text: `Your leave request has been ${status.toLowerCase()}.`,
    html,
  });
};
