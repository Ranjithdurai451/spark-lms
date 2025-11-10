import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/helpers/auth.helper";
import { prisma } from "../db";
import type { authTokenPayload, User, Organization } from "../lib/types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const verification = verifyToken<authTokenPayload>(token);
    if (!verification.valid)
      return res.status(401).json({ message: verification.message });

    const { userId } = verification.payload;

    // Get user with light organization info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: {
            id: true,
            organizationName: true,
            organizationCode: true,
            organizationDescription: true,
          },
        },
        manager: { select: { id: true, username: true } },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.organization)
      return res
        .status(403)
        .json({ message: "User is not associated with any organization." });

    const organization: Organization = user.organization;
    const userData: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organization,
      manager: user.manager ?? undefined,
    };

    req.user = userData;

    next();
  } catch (error) {
    console.error("❌ authenticate error:", error);
    res.status(401).json({ message: "Invalid or expired authentication." });
  }
};

/**
  Authorize by role
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized. Please login." });

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions.",
      });
    }

    next();
  };
};

/**
 * Ensures user belongs to the same org as requested
 */
export const authorizeOrganization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const orgIdFromRequest =
    req?.params?.organizationId ||
    req?.body?.organizationId ||
    user?.organization?.id;

  if (!orgIdFromRequest) {
    return res.status(400).json({
      message: "Organization ID is required for this request.",
    });
  }

  if (user?.organization?.id !== orgIdFromRequest) {
    return res.status(403).json({
      message: "Access denied. You do not belong to this organization.",
    });
  }

  next();
};
