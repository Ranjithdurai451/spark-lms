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

const PRIMARY_COLOR = "#42a86c";
const PRIMARY_LIGHT = "#e8f5ed";
const PRIMARY_DARK = "#2d7650";
const SUCCESS_COLOR = "#10b981"; // Green
const ERROR_COLOR = "#ef4444"; // Red

/* ──────────────── PASSWORD RESET EMAIL ──────────────── */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Leave Management System</p>
        </div>

        <!-- Content -->
        <div style="padding:40px 32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:72px;height:72px;background:${PRIMARY_LIGHT};border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:36px;">🔐</span>
            </div>
          </div>

          <h2 style="color:#1e293b;margin:0 0 16px;text-align:center;font-size:24px;font-weight:700;">Reset Your Password</h2>
          
          <p style="font-size:15px;color:#475569;text-align:center;margin:0 0 32px;line-height:1.6;">
            We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" target="_blank" 
               style="display:inline-block;background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);color:#ffffff;text-decoration:none;padding:16px 40px;font-size:16px;font-weight:600;border-radius:10px;box-shadow:0 4px 14px rgba(66,168,108,0.4);transition:transform 0.2s;">
              Reset My Password
            </a>
          </div>

          <div style="background:#f8fafc;border-left:4px solid ${PRIMARY_COLOR};padding:16px;border-radius:8px;margin:32px 0;">
            <p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">
              <strong>Security tip:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
Reset Your Password - ${APP_NAME}

You requested to reset your password for ${APP_NAME}.
Reset it here: ${resetUrl}

This link will expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} ${APP_NAME}
  `;

  await sendEmail({
    to: email,
    subject: `Reset Your Password - ${APP_NAME}`,
    text,
    html,
  });
};

/* ──────────────── OTP EMAIL ──────────────── */
export const sendOtpEmail = async (otp: string, email: string) => {
  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Leave Management System</p>
        </div>

        <!-- Content -->
        <div style="padding:40px 32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:72px;height:72px;background:${PRIMARY_LIGHT};border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:36px;">✉️</span>
            </div>
          </div>

          <h2 style="color:#1e293b;margin:0 0 16px;text-align:center;font-size:24px;font-weight:700;">Verify Your Email</h2>
          
          <p style="font-size:15px;color:#475569;text-align:center;margin:0 0 32px;line-height:1.6;">
            Use the verification code below to verify your email address. This code will expire in <strong>10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="text-align:center;margin:32px 0;">
            <div style="
              display:inline-block;
              padding:20px 48px;
              font-size:40px;
              font-weight:700;
              color:#ffffff;
              background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);
              border-radius:12px;
              letter-spacing:8px;
              box-shadow:0 8px 20px rgba(66,168,108,0.3);
              user-select:all;
              cursor:pointer;
            ">
              ${otp}
            </div>
            <p style="font-size:13px;color:#64748b;margin:16px 0 0;">
              Click or tap the code to select and copy it
            </p>
          </div>

          <div style="background:#f8fafc;border-left:4px solid ${PRIMARY_COLOR};padding:16px;border-radius:8px;margin:32px 0;">
            <p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">
              <strong>Security tip:</strong> If you did not request this verification code, please ignore this email.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
Email Verification - ${APP_NAME}

Your OTP for ${APP_NAME} is: ${otp}

This code will expire in 10 minutes.

If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} ${APP_NAME}
  `;

  await sendEmail({
    to: email,
    subject: `Email Verification - ${APP_NAME}`,
    text,
    html,
  });
};

/* ──────────────── MEMBER INVITE EMAIL ──────────────── */
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

    const subject = `You're invited to join ${organizationName}`;

    const html = `
      <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${organizationName}</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Powered by ${APP_NAME}</p>
          </div>

          <!-- Content -->
          <div style="padding:40px 32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:72px;height:72px;background:${PRIMARY_LIGHT};border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:36px;">🎉</span>
              </div>
            </div>

            <h2 style="color:#1e293b;margin:0 0 16px;text-align:center;font-size:24px;font-weight:700;">You're Invited!</h2>
            
            <p style="font-size:15px;color:#475569;text-align:center;margin:0 0 32px;line-height:1.6;">
              You've been invited to join <strong style="color:${PRIMARY_COLOR};">${organizationName}</strong> as <strong>${role}</strong>.
            </p>

            <!-- Role Badge -->
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;background:${PRIMARY_LIGHT};color:${PRIMARY_DARK};padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
                Your Role: ${role}
              </span>
            </div>

            <div style="text-align:center;margin:32px 0;">
              <a href="${inviteLink}" target="_blank"
                 style="display:inline-block;background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);color:#ffffff;text-decoration:none;padding:16px 40px;font-size:16px;font-weight:600;border-radius:10px;box-shadow:0 4px 14px rgba(66,168,108,0.4);">
                Accept Invitation
              </a>
            </div>

            <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:32px 0;">
              <p style="font-size:14px;color:#64748b;margin:0;text-align:center;line-height:1.6;">
                This invitation will expire in <strong>7 days</strong>. If you have any questions, please contact your administrator.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
You're invited to join ${organizationName}!

You've been invited to join ${organizationName} as ${role}.

Accept your invitation here: ${inviteLink}

This invitation will expire in 7 days.

© ${new Date().getFullYear()} ${APP_NAME}
    `;

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

/* ──────────────── LEAVE REQUEST EMAIL ──────────────── */
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
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);padding:40px 32px;text-align:center;">
          <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;">📅</span>
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Leave Request</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Action Required</p>
        </div>

        <!-- Content -->
        <div style="padding:40px 32px;">
          <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">
            Hi,
          </p>
          
          <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.6;">
            <strong style="color:${PRIMARY_COLOR};">${employeeName}</strong> has submitted a leave request and requires your approval.
          </p>

          <!-- Leave Details Card -->
          <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:32px 0;border:1px solid #e2e8f0;">
            <h3 style="color:#1e293b;margin:0 0 20px;font-size:16px;font-weight:600;">Leave Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;">Employee:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${employeeName}</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">Leave Type:</td>
                <td style="padding:10px 0;text-align:right;">
                  <span style="background:${PRIMARY_LIGHT};color:${PRIMARY_DARK};padding:4px 12px;border-radius:6px;font-size:13px;font-weight:600;">${leaveType}</span>
                </td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">Duration:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${days} day${
    days > 1 ? "s" : ""
  }</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">From:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${startDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">To:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${endDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              ${
                reason
                  ? `
              <tr style="border-top:1px solid #e2e8f0;">
                <td colspan="2" style="padding:16px 0 8px;color:#64748b;font-size:14px;font-weight:600;">Reason:</td>
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
          <div style="text-align:center;margin:32px 0;">
            <a href="${FRONTEND_BASE_URL}/in/leave-requests" 
               style="display:inline-block;background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);color:#ffffff;text-decoration:none;padding:16px 40px;font-size:15px;font-weight:600;border-radius:10px;box-shadow:0 4px 14px rgba(66,168,108,0.4);">
              Review Request
            </a>
          </div>

          <p style="font-size:14px;color:#64748b;margin:32px 0 0;text-align:center;line-height:1.6;">
            Please review and respond to this request at your earliest convenience.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            This is an automated email from ${APP_NAME}
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
Leave Request from ${employeeName}

Leave Type: ${leaveType}
Duration: ${days} day(s)
From: ${startDate.toLocaleDateString()}
To: ${endDate.toLocaleDateString()}
${reason ? `Reason: ${reason}` : ""}

Please review this request in your leave management system:
${FRONTEND_BASE_URL}/in/leave-requests

© ${new Date().getFullYear()} ${APP_NAME}
  `;

  await sendEmail({ to, subject, text, html });
};

/* ──────────────── LEAVE STATUS EMAIL ──────────────── */
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
  const statusColor = isApproved ? SUCCESS_COLOR : ERROR_COLOR;
  const statusIcon = isApproved ? "✅" : "❌";

  const html = `
    <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${statusColor} 0%, ${
    isApproved ? "#059669" : "#dc2626"
  } 100%);padding:40px 32px;text-align:center;">
          <div style="width:72px;height:72px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:40px;">${statusIcon}</span>
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Leave Request ${status}</h1>
        </div>

        <!-- Content -->
        <div style="padding:40px 32px;">
          <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">
            Hi <strong style="color:${PRIMARY_COLOR};">${employeeName}</strong>,
          </p>
          
          <p style="font-size:15px;color:#475569;margin:0 0 32px;line-height:1.6;">
            Your leave request has been <strong style="color:${statusColor};">${status.toLowerCase()}</strong> by ${approverName}.
          </p>

          <!-- Leave Details Card -->
          <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:32px 0;border:1px solid #e2e8f0;">
            <h3 style="color:#1e293b;margin:0 0 20px;font-size:16px;font-weight:600;">Leave Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;">Leave Type:</td>
                <td style="padding:10px 0;text-align:right;">
                  <span style="background:${PRIMARY_LIGHT};color:${PRIMARY_DARK};padding:4px 12px;border-radius:6px;font-size:13px;font-weight:600;">${leaveType}</span>
                </td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">Duration:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${days} day${
    days > 1 ? "s" : ""
  }</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">From:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${startDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:10px 0;color:#64748b;font-size:14px;">To:</td>
                <td style="padding:10px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${endDate.toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short", year: "numeric" }
                )}</td>
              </tr>
            </table>
          </div>

          ${
            isApproved
              ? `
          <div style="background:#d1fae5;border-left:4px solid ${SUCCESS_COLOR};padding:20px;border-radius:8px;margin:32px 0;">
            <p style="font-size:14px;color:#065f46;margin:0;line-height:1.6;">
              <strong>✅ Approved:</strong> Your leave has been confirmed. Please ensure all tasks are delegated before your leave starts.
            </p>
          </div>
          `
              : `
          <div style="background:#fee2e2;border-left:4px solid ${ERROR_COLOR};padding:20px;border-radius:8px;margin:32px 0;">
            <p style="font-size:14px;color:#991b1b;margin:0;line-height:1.6;">
              <strong>❌ Rejected:</strong> Your leave request was not approved. Please contact your manager for more details.
            </p>
          </div>
          `
          }

          <div style="text-align:center;margin:32px 0;">
            <a href="${FRONTEND_BASE_URL}/in/my-leaves" 
               style="display:inline-block;background:linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_DARK} 100%);color:#ffffff;text-decoration:none;padding:16px 40px;font-size:15px;font-weight:600;border-radius:10px;box-shadow:0 4px 14px rgba(66,168,108,0.4);">
              View Leave Details
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            This is an automated email from ${APP_NAME}
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
Leave Request ${status}

Hi ${employeeName},

Your leave request has been ${status.toLowerCase()} by ${approverName}.

Leave Type: ${leaveType}
Duration: ${days} day(s)
From: ${startDate.toLocaleDateString()}
To: ${endDate.toLocaleDateString()}

View details: ${FRONTEND_BASE_URL}/in/my-leaves

© ${new Date().getFullYear()} ${APP_NAME}
  `;

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
};
