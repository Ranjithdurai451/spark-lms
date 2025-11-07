// middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/helpers/auth.helper";
import { prisma } from "../db";
import type { authTokenPayload, User } from "../lib/types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const verification = verifyToken<authTokenPayload>(token);
    if (!verification.valid) {
      return res.status(401).json({ message: verification.message });
    }

    const { userId } = verification.payload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true, manager: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      manager: user.manager && {
        id: user.manager.id,
        username: user.manager.username,
      },
      role: user.role,
      organization: user.organization,
    };

    // Attach to request
    (req as any).user = user as User;
    next();
  } catch (error) {
    console.error("❌ authenticate error:", error);
    res.status(401).json({ message: "Invalid or expired authentication." });
  }
};
