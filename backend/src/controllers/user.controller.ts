import type { Request, Response } from "express";
import { prisma } from "../db";
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, role, managerId } = req.body;
    const { user } = req as any;

    // Only admins can update
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can update organization members.",
      });
    }

    // Verify that user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent editing other admins unless it's the same user
    if (existing.role === "ADMIN" && existing.id !== user.userId) {
      return res.status(403).json({
        message: "You cannot modify another admin's role or details.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: username ?? existing.username,
        role: role ?? existing.role,
        organizationId: existing.organizationId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    res.json({
      message: "Member updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ updateMember error:", error);
    res.status(500).json({ message: "Failed to update member." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    // Only admins can delete
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can delete members.",
      });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent deleting self or other admins
    if (existing.role === "ADMIN") {
      return res.status(403).json({
        message: "You cannot delete an admin account.",
      });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: "Member deleted successfully." });
  } catch (error) {
    console.error("❌ deleteMember error:", error);
    res.status(500).json({ message: "Failed to delete member." });
  }
};
