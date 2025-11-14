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
import { createBalancesForNewUser } from "../lib/helpers/leave-balance.helper";

/* -------------------------------------------------------------------------- */
/*                        Send Email Verification OTP                         */
/* -------------------------------------------------------------------------- */
export const sendEmailVerificationOtp = async (
  req: Request<{}, {}, SendOtpInput>,
  res: Response
) => {
  try {
    const { email } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        message:
          "This email is already associated with an existing account. Please use a different email.",
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
      message: "OTP sent successfully.",
      data: { otpToken },
    });
  } catch (err) {
    console.error(" sendEmailVerificationOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP." });
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
    if (!verification.valid)
      return res.status(400).json({ message: verification.message });

    const { email, otp: hashedOtp } = verification.payload;
    const validOtp = await bcrypt.compare(otp, hashedOtp);
    if (!validOtp)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    res.status(200).json({ message: "Email verified.", data: { email } });
  } catch (err) {
    console.error(" verifyEmail error:", err);
    res.status(500).json({ message: "Verification failed." });
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
        message: "A user with this email already exists.",
      });

    if (existingOrg)
      return res.status(400).json({
        message: "This organization code is already taken.",
      });

    const passwordHash = await bcrypt.hash(password, 10);

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

    const adminUser = org.users.find((u) => u.email === email)!;
    const managerId = adminUser.id;

    // Parallelize balance creation and sending invites
    await Promise.all([
      createBalancesForNewUser(adminUser.id, org.id),
      Promise.all(
        invitedEmails.map((invite: any) =>
          sendMemberInviteEmail({
            invitedEmail: invite.email,
            role: invite.role,
            organizationId: org.id,
            organizationName: org.organizationName,
            managerId,
          })
        )
      ),
    ]);

    const authToken = createToken<authTokenPayload>(
      { userId: adminUser.id, role: adminUser.role },
      "30d"
    );
    let sessions: StoredSession[] = [];
    const sessionsCookie = req.cookies["user-sessions"];
    if (sessionsCookie) {
      sessions = JSON.parse(sessionsCookie) as StoredSession[];
    }
    if (!sessions.find((s) => s.userId === adminUser.id)) {
      sessions.push({
        userId: adminUser.id,
        token: authToken,
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        organizationId: org.id,
        organizationName: org.organizationName,
        addedAt: Date.now(),
      });
    }
    res.cookie("user-sessions", JSON.stringify(sessions), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message:
        "Admin registered successfully. Organization and member invites created.",
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
    console.error(" registerAdmin error:", err);
    res.status(500).json({ message: "Failed to register admin." });
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

    if (!verification.valid)
      return res.status(400).json({ message: verification.message });

    const { email, role, organizationId, managerId } = verification.payload;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User with this email already exists." });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { email, username, passwordHash, role, organizationId, managerId },
      include: { organization: true, manager: true },
    });

    await createBalancesForNewUser(newUser.id, organizationId);

    const authToken = createToken<authTokenPayload>(
      { userId: newUser.id, role: newUser.role },
      "30d"
    );
    // ... after successful login/authToken generation ...
    let sessions: StoredSession[] = [];
    const sessionsCookie = req.cookies["user-sessions"];
    if (sessionsCookie) {
      sessions = JSON.parse(sessionsCookie) as StoredSession[];
    }
    if (!sessions.find((s) => s.userId === newUser.id)) {
      sessions.push({
        userId: newUser.id,
        token: authToken,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        organizationId: newUser?.organization?.id,
        organizationName: newUser?.organization?.organizationName,
        addedAt: Date.now(),
      });
    }
    res.cookie("user-sessions", JSON.stringify(sessions), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Invite accepted successfully. Account created.",
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
  } catch (err) {
    console.error(" acceptInvite error:", err);
    res.status(400).json({
      message: "Invalid or expired invitation token.",
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

    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this email." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Invalid email or password." });

    const authToken = createToken<authTokenPayload>(
      { userId: user.id, role: user.role },
      "30d"
    );
    // ... after successful login/authToken generation ...
    let sessions: StoredSession[] = [];
    const sessionsCookie = req.cookies["user-sessions"];
    if (sessionsCookie) {
      sessions = JSON.parse(sessionsCookie) as StoredSession[];
    }
    if (!sessions.find((s) => s.userId === user.id)) {
      sessions.push({
        userId: user.id,
        token: authToken,
        email: user.email,
        username: user.username,
        role: user.role,
        organizationId: user.organization?.id,
        organizationName: user.organization?.organizationName,
        addedAt: Date.now(),
      });
    }
    res.cookie("user-sessions", JSON.stringify(sessions), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `Welcome back, ${user.username}!`,
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
  } catch (err) {
    console.error(" login error:", err);
    res.status(500).json({ message: "Login failed. Try again later." });
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
    if (!verification.valid)
      return res.status(400).json({ message: verification.message });

    const { userId } = verification.payload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true, manager: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Authenticated",
      data: { user },
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
  res.json({ message: "Logged out successfully." });
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
    console.error(" forgotPassword error:", error);
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
    console.error("resetPassword error:", err);
    return res.status(400).json({
      message:
        "Invalid or expired password reset link. Please request a new one.",
    });
  }
};

interface StoredSession {
  userId: string;
  token: string;
  email: string;
  username: string;
  role: string;
  organizationId?: string | null;
  organizationName?: string | null;
  addedAt: number;
}

/* -------------------------------------------------------------------------- */
/*                           Get Active Sessions                              */
/* -------------------------------------------------------------------------- */
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessionsData = req.cookies["user-sessions"];
    const currentToken = req.cookies["auth-token"];

    if (!sessionsData || !currentToken) {
      return res.status(200).json({
        message: "No active sessions",
        data: { sessions: [] },
      });
    }

    const sessions: StoredSession[] = JSON.parse(sessionsData);

    // Verify all sessions and fetch fresh user data
    const validSessions = await Promise.all(
      sessions.map(async (session) => {
        try {
          const verification = verifyToken<authTokenPayload>(session.token);
          if (!verification.valid) return null;

          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
              organization: {
                select: {
                  id: true,
                  organizationName: true,
                  organizationCode: true,
                },
              },
              manager: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          });

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            organization: user.organization,
            manager: user.manager,
            isActive: session.token === currentToken,
            addedAt: session.addedAt,
          };
        } catch {
          return null;
        }
      })
    );

    const activeSessions = validSessions.filter((s) => s !== null);

    res.status(200).json({
      message: "Active sessions retrieved",
      data: { sessions: activeSessions },
    });
  } catch (err) {
    console.error("getActiveSessions error:", err);
    res.status(500).json({ message: "Failed to get sessions" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            Switch Session                                  */
/* -------------------------------------------------------------------------- */
export const switchSession = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const sessionsData = req.cookies["user-sessions"];

    if (!sessionsData) {
      return res.status(400).json({ message: "No sessions found" });
    }

    const sessions: StoredSession[] = JSON.parse(sessionsData);
    const targetSession = sessions.find((s) => s.userId === userId);

    if (!targetSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify the token is still valid
    const verification = verifyToken<authTokenPayload>(targetSession.token);
    if (!verification.valid) {
      // Remove invalid session
      const updatedSessions = sessions.filter((s) => s.userId !== userId);
      res.cookie("user-sessions", JSON.stringify(updatedSessions), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(400).json({ message: "Session expired" });
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        manager: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set the auth token to the target session's token
    res.cookie("auth-token", targetSession.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `Switched to ${
        user.organization?.organizationName || user.username
      }`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          organization: user.organization,
          manager: user.manager,
        },
      },
    });
  } catch (err) {
    console.error("switchSession error:", err);
    res.status(500).json({ message: "Failed to switch session" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            Remove Session                                  */
/* -------------------------------------------------------------------------- */
export const removeSession = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const sessionsData = req.cookies["user-sessions"];
    const currentToken = req.cookies["auth-token"];

    if (!sessionsData) {
      return res.status(400).json({ message: "No sessions found" });
    }

    const sessions: StoredSession[] = JSON.parse(sessionsData);
    const sessionToRemove = sessions.find((s) => s.userId === userId);

    if (!sessionToRemove) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Remove the session
    const updatedSessions = sessions.filter((s) => s.userId !== userId);

    // If removing current session, switch to another one or logout
    if (sessionToRemove.token === currentToken) {
      if (updatedSessions.length > 0) {
        // Switch to the first available session
        const nextSession = updatedSessions[0];
        res.cookie("auth-token", nextSession.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        const user = await prisma.user.findUnique({
          where: { id: nextSession.userId },
          include: { organization: true, manager: true },
        });

        res.cookie("user-sessions", JSON.stringify(updatedSessions), {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          message: "Session removed and switched to another account",
          data: { user, switchedToAnother: true },
        });
      } else {
        // No more sessions, logout completely
        res.clearCookie("auth-token", {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        });
        res.clearCookie("user-sessions", {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
        });
        return res.status(200).json({
          message: "Last session removed, logged out",
          data: { switchedToAnother: false },
        });
      }
    }

    // Update sessions cookie
    res.cookie("user-sessions", JSON.stringify(updatedSessions), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Session removed successfully",
      data: { switchedToAnother: false },
    });
  } catch (err) {
    console.error("removeSession error:", err);
    res.status(500).json({ message: "Failed to remove session" });
  }
};
