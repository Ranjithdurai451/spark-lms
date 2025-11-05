import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@/db";
import { sendMemberInviteEmail, sendOtpEmail } from "@/lib/helpers/mail.helper"; // implement your own sendEmail
import { createToken, verifyToken } from "@/lib/helpers/auth.helper";
import { authTokenPayload, otpTokenPayload } from "@/lib/types";
import {
  RegisterAdminInput,
  SendOtpInput,
  VerifyEmailInput,
} from "@/lib/schemas/auth.schema";
import { Role } from "@prisma/client";

export const sendEmailVerificationOtp = async (
  req: Request<{}, {}, SendOtpInput>,
  res: Response
) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      res.status(400).json({
        message:
          "Your Email Id already Existing. Please Try With Another Email Id",
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "Server configuration error: JWT secret missing.",
      });
      return;
    }

    const hashedOtp = await bcrypt.hash(otp, 10);

    const otpToken = createToken<otpTokenPayload>(
      { email, otp: hashedOtp },
      "10m"
    );

    await sendOtpEmail(otp, email);

    res.status(200).json({
      message: "OTP sent to your email.",
      data: {
        otpToken,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

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
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({
      message: "Email verified successfully",
      data: { email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Register Admin (with member invites) ------------------
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
    console.log(req.body);

    // ---------- Check for duplicates ----------
    const [existingUser, existingOrg] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.organization.findUnique({ where: { organizationCode } }),
    ]);

    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    if (existingOrg)
      return res
        .status(400)
        .json({ message: "Organization code already taken" });

    // ---------- Create admin + organization ----------
    const passwordHash = await bcrypt.hash(password, 10);
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     username,
    //     passwordHash,
    //     role: "ADMIN",
    //     ownedOrganization: {
    //       create: {
    //         organizationName,
    //         organizationCode,
    //         organizationDescription,
    //       },
    //     },
    //   },
    //   include: { ownedOrganization: true },
    // });
    const user = {
      id: "mock-user-id-123",
      email,
      username,
      passwordHash,
      role: "ADMIN" as Role,
      ownedOrganization: {
        id: "mock-org-id-456",
        organizationName,
        organizationCode,
        organizationDescription,
      },
    };

    // ---------- Set auth cookie ----------
    // const token = createToken({ userId: user.id, role: user.role });
    const token = createToken<authTokenPayload>(
      {
        userId: user.id,
        role: user.role,
      },
      "30d"
    );
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // ---------- Send all invites concurrently ----------

    const org = user.ownedOrganization;
    if (!org) {
      return res
        .status(200)
        .json({ message: "Organization not created,please try again" });
    }
    await Promise.all(
      invitedEmails.map((invite: any) =>
        sendMemberInviteEmail({
          invitedEmail: invite.email,
          role: invite.role,
          organizationId: org.id,
          organizationName: org.organizationName,
        })
      )
    );

    // ---------- Response ----------
    res.status(201).json({
      message: "Admin registered, organization created, and invites sent",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          organization: org,
        },
      },
    });
  } catch (err) {
    console.error("❌ registerAdmin error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ------------------ Send Member Invite ------------------
export const sendMemberInvite = async (req: Request, res: Response) => {
  try {
    const { invitedEmail, role } = req.body;
    const { user } = req as any;

    if (user.role !== "ADMIN")
      return res
        .status(403)
        .json({ message: "Only admins can invite members" });

    const org = await prisma.organization.findUnique({
      where: { ownerId: user.userId },
    });
    if (!org)
      return res.status(400).json({ message: "Organization not found" });

    const result = await sendMemberInviteEmail({
      invitedEmail,
      role,
      organizationId: org.id,
      organizationName: org.organizationName,
    });

    if (result.status === "failed") {
      return res
        .status(500)
        .json({ message: `Failed to send invite: ${result.error}` });
    }

    res.json({ message: "Invite sent successfully", result });
  } catch (err) {
    console.error("❌ sendMemberInvite error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Accept Invite (Member Register) ------------------
// export const acceptInvite = async (req: Request, res: Response) => {
//   try {
//     const { token, username, password } = req.body;
//     const decoded = verifyToken(token) as any;
//     const { email, organizationId, role } = decoded;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser)
//       return res.status(400).json({ message: "User already exists" });

//     const passwordHash = await bcrypt.hash(password, 10);

//     const newUser = await prisma.user.create({
//       data: {
//         email,
//         username,
//         passwordHash,
//         role,
//         organizationId,
//       },
//     });

//     const authToken = createToken({ userId: newUser.id, role: newUser.role });
//     res.cookie(COOKIE_NAME, authToken, COOKIE_OPTIONS);

//     res.status(201).json({
//       message: "Account created successfully. Welcome aboard!",
//       user: {
//         id: newUser.id,
//         email: newUser.email,
//         username: newUser.username,
//         role: newUser.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Invalid or expired invite link" });
//   }
// };

// ------------------ Login ------------------
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: { organization: true },
//     });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const valid = await bcrypt.compare(password, user.passwordHash);
//     if (!valid) return res.status(401).json({ message: "Invalid credentials" });

//     const token = createToken({ userId: user.id, role: user.role });
//     res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

//     res.json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//         organization: user.organization,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// ------------------ Check Auth Status ------------------
// export const checkAuth = async (req: Request, res: Response) => {
//   try {
//     const token = req.cookies[COOKIE_NAME];
//     if (!token) return res.status(401).json({ message: "Not authenticated" });

//     const decoded = verifyToken(token) as any;
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       include: { organization: true, ownedOrganization: true },
//     });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({
//       authenticated: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//         organization: user.organization || user.ownedOrganization,
//       },
//     });
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// ------------------ Logout ------------------
// export const logout = (req: Request, res: Response) => {
//   res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
//   res.json({ message: "Logged out successfully" });
// };
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       res.status(400).json({ message: "Email is required" });
//       return;
//     }

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     // 1. Generate JWT token (expires in 15 mins)
//     if (!process.env.JWT_SECRET) {
//       res.status(500).json({
//         message: "Server configuration error: JWT secret missing.",
//       });
//       return;
//     }
//     const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
//       expiresIn: "15m",
//     });

//     // 2. Construct reset URL
//     const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`;
//     const { html, text } = getPasswordResetEmail(resetUrl);
//     await sendEmail({ to: email, subject: "Reset Your Password", text, html });

//     res.json({ message: "Reset link sent to your email." });
//     return;
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//     return;
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const token = req.params.token;
//     const { newPassword } = req.body;

//     if (!token || !newPassword) {
//       res.status(400).json({ message: "Token and new password required." });
//       return;
//     }

//     if (!process.env.JWT_SECRET) {
//       res.status(500).json({
//         message: "Server configuration error: JWT secret missing.",
//       });
//       return;
//     }
//     // 1. Verify JWT
//     const decoded = verifyToken(token);
//     if (typeof decoded === "object" && "error" in decoded) {
//       res.status(decoded.statusCode).json({ message: decoded.error });
//       return;
//     }

//     // 2. Find user by email
//     const user = await prisma.user.findUnique({
//       where: { email: decoded.email },
//     });
//     if (!user) {
//       res.status(404).json({ message: "User not found." });
//       return;
//     }

//     // 3. Update password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await prisma.user.update({
//       where: { email: decoded.email },
//       data: { password: hashedPassword },
//     });

//     res.json({ message: "Password reset successful." });
//     return;
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: "Invalid or expired token." });
//     return;
//   }
// };
