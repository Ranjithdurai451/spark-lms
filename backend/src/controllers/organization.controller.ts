import type { Request, Response } from "express";
import { prisma } from "../db";
import { verifyToken } from "../lib/helpers/auth.helper";
import type { authTokenPayload } from "../lib/types";
import { sendMemberInviteEmail } from "../lib/helpers/mail.helper";

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const verification = verifyToken<authTokenPayload>(token);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    const { organizationId } = req.params;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            manager: { select: { id: true, username: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.status(200).json({
      message: "Organization fetched successfully.",
      data: organization,
    });
  } catch (error) {
    console.error("❌ getOrganizationById error:", error);
    return res.status(500).json({ message: "Failed to fetch organization." });
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { invitedEmail, role, managerId } = req.body;
    const { user } = req;

    // Ensure only ADMIN or HR can invite
    if (user?.role !== "ADMIN" && user?.role !== "HR") {
      return res.status(403).json({
        message: "Only Admin or HR can invite members.",
      });
    }

    // Validate inputs
    if (!invitedEmail || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitedEmail },
    });
    // if (existingUser) {
    //   return res
    //     .status(400)
    //     .json({ message: "User with this email already exists." });
    // }

    // Verify organization
    const organization = await prisma.organization.findUnique({
      where: { id: user?.organization?.id },
    });
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    let manager = null;
    if (managerId) {
      manager = await prisma.user.findUnique({ where: { id: managerId } });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found." });
      }
    }

    // Store the invite temporarily in DB
    await sendMemberInviteEmail({
      invitedEmail: invitedEmail,
      role,
      organizationId: organization.id,
      organizationName: organization.organizationName,
      managerId,
    });

    return res.status(200).json({
      message: "Invite sent successfully.",
      data: {
        email: invitedEmail,
        role,
        organization: organization.organizationName,
      },
    });
  } catch (error) {
    console.error("❌ inviteMember error:", error);
    return res.status(500).json({ message: "Failed to invite member." });
  }
};
