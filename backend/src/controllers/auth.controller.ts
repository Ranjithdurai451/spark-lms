import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import {
  sendMemberInviteEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
} from "../lib/helpers/mail.helper";
import { createToken, verifyToken } from "../lib/helpers/auth.helper";
import type {
  authTokenPayload,
  memberInviteTokenPayload,
  otpTokenPayload,
  resetPasswordTokenPayload,
} from "../lib/types";
import type {
  AcceptInviteInput,
  RegisterAdminInput,
  SendOtpInput,
  VerifyEmailInput,
} from "../lib/schemas/auth.schema";
import { FRONTEND_BASE_URL } from "../lib/constants";

/* -------------------------------------------------------------------------- */
/*                        Send Email Verification OTP                         */
/* -------------------------------------------------------------------------- */
export const sendEmailVerificationOtp = async (
  req: Request<{}, {}, SendOtpInput>,
  res: Response
) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({
        message:
          "This email address is already associated with an existing account. Please use a different email address.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const otpToken = createToken<otpTokenPayload>(
      { email, otp: hashedOtp },
      "10m"
    );

    await sendOtpEmail(otp, email);

    return res.status(200).json({
      message: "OTP has been sent to your email successfully.",
      data: { otpToken },
    });
  } catch (error) {
    console.error("❌ sendEmailVerificationOtp error:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while sending the OTP.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Verify Email OTP                              */
/* -------------------------------------------------------------------------- */
export const verifyEmail = async (
  req: Request<{}, {}, VerifyEmailInput>,
  res: Response
) => {
  try {
    const { otp, token } = req.body;

    const verification = verifyToken<otpTokenPayload>(token);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const { email, otp: hashedOtp } = verification.payload;
    const isValidOtp = await bcrypt.compare(otp, hashedOtp);

    if (!isValidOtp) {
      return res.status(400).json({
        message:
          "The OTP you entered is invalid or has expired. Please try again.",
      });
    }

    return res.status(200).json({
      message: "Email verified successfully!",
      data: { email },
    });
  } catch (error) {
    console.error("❌ verifyEmail error:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while verifying your email.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                             Register Admin                                 */
/* -------------------------------------------------------------------------- */
export const registerAdmin = async (
  req: Request<{}, {}, RegisterAdminInput>,
  res: Response
) => {
  try {
    const {
      email,
      username,
      password,
      organizationName,
      organizationCode,
      organizationDescription,
      invitedEmails = [],
    } = req.body;

    const [existingUser, existingOrg] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.organization.findUnique({ where: { organizationCode } }),
    ]);

    if (existingUser)
      return res.status(400).json({
        message:
          "A user with this email already exists. Please use a different email address.",
      });

    if (existingOrg)
      return res.status(400).json({
        message:
          "The organization code you entered is already taken. Please choose another one.",
      });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization and admin user
    const org = await prisma.organization.create({
      data: {
        organizationName,
        organizationCode,
        organizationDescription,
        users: {
          create: {
            email,
            username,
            passwordHash,
            role: "ADMIN",
          },
        },
      },
      include: { users: true },
    });

    const adminUser = org.users.find((u: any) => u.email === email)!;

    // Default manager = admin
    const managerId = adminUser.id;

    // Send member invites
    await Promise.all(
      invitedEmails.map((invite: any) =>
        sendMemberInviteEmail({
          invitedEmail: invite.email,
          role: invite.role,
          organizationId: org.id,
          organizationName: org.organizationName,
          managerId,
        })
      )
    );

    const authToken = createToken<authTokenPayload>(
      { userId: adminUser.id, role: adminUser.role },
      "30d"
    );

    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message:
        "Admin registered successfully. Your organization has been created and invitations have been sent to new members.",
      data: {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          role: adminUser.role,
          organization: org,
        },
      },
    });
  } catch (err) {
    console.error("❌ registerAdmin error:", err);
    res.status(500).json({
      message: "An unexpected error occurred while registering admin.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Accept Invite                                 */
/* -------------------------------------------------------------------------- */
export const acceptInvite = async (
  req: Request<{}, {}, AcceptInviteInput>,
  res: Response
) => {
  try {
    const { token, username, password } = req.body;
    const verification = verifyToken<memberInviteTokenPayload>(token);

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const { email, role, organizationId, managerId } = verification.payload;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({
        message:
          "An account with this email address already exists. Please log in instead of accepting a new invite.",
      });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        role,
        organizationId,
        managerId,
      },
      include: { organization: true, manager: true },
    });

    const authToken = createToken<authTokenPayload>(
      { userId: newUser.id, role: newUser.role },
      "30d"
    );

    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message:
        "Your account has been created successfully and linked to your organization. Welcome aboard!",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          manager: newUser.manager && {
            id: newUser.manager.id,
            username: newUser.manager.username,
          },
          organization: newUser.organization,
        },
      },
    });
  } catch (err: any) {
    console.error("❌ acceptInvite error:", err);
    return res.status(400).json({
      message:
        "The invitation link is invalid or has expired. Please contact your organization admin for a new invitation.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Login                                      */
/* -------------------------------------------------------------------------- */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true, manager: true },
    });

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email address. Please check your credentials or sign up first.",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        message:
          "The email or password you entered is incorrect. Please try again.",
      });
    }

    const authToken = createToken<authTokenPayload>(
      { userId: user.id, role: user.role },
      "30d"
    );

    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: `Welcome back, ${user.username}! You have successfully logged in.`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          organization: user.organization,
          manager: user.manager && {
            id: user.manager.id,
            username: user.manager.username,
          },
        },
      },
    });
  } catch (err: any) {
    console.error("❌ login error:", err);
    return res.status(500).json({
      message:
        "An unexpected error occurred while processing your login request. Please try again later.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Check Auth                                 */
/* -------------------------------------------------------------------------- */
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const verification = verifyToken<authTokenPayload>(token);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const { userId } = verification.payload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true, manager: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User is authenticated",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          organization: user.organization,
          manager: user.manager && {
            id: user.manager.id,
            username: user.manager.username,
          },
        },
      },
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Logout                                     */
/* -------------------------------------------------------------------------- */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};

/* -------------------------------------------------------------------------- */
/*                              Forgot Password                               */
/* -------------------------------------------------------------------------- */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required to request a password reset.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message:
          "We couldn’t find an account associated with this email address. Please check and try again.",
      });
    }

    const resetToken = createToken<resetPasswordTokenPayload>({ email }, "15m");
    const resetUrl = `${FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    return res.status(200).json({
      message:
        "A password reset link has been sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    console.error("❌ forgotPassword error:", error);
    return res.status(500).json({
      message:
        "An unexpected error occurred while processing your password reset request. Please try again later.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Reset Password                                */
/* -------------------------------------------------------------------------- */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, token } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message:
          "Both reset token and a new password are required to complete this request.",
      });
    }

    const verification = verifyToken<resetPasswordTokenPayload>(token);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const { email } = verification.payload;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(404).json({
        message:
          "No user found for the provided reset link. Please verify your email and try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: email },
      data: { passwordHash: hashedPassword },
    });

    return res.status(200).json({
      message:
        "Your password has been successfully reset. You can now log in using your new password.",
    });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    return res.status(400).json({
      message:
        "Invalid or expired password reset link. Please request a new one.",
    });
  }
};
