import express from "express";

import {
  authenticate,
  authorizeOrganization,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import {
  getAllLeaves,
  getMyLeaves,
  createLeave,
  updateLeave,
  updateLeaveStatus,
  deleteLeave,
} from "../controllers/leaves.controller";

const router = express.Router();

/* ──────────────── Routes ──────────────── */

// For HR/Admin/Manager to view all leaves in organization
router.get("/", authenticate, authorizeOrganization, getAllLeaves);

// For Employee to view their own leaves
router.get("/my", authenticate, authorizeOrganization, getMyLeaves);

// Create new leave (Employee)
router.post("/", authenticate, authorizeOrganization, createLeave);

// Update leave (Employee edits pending request)
router.put("/:id", authenticate, authorizeOrganization, updateLeave);

// Approve / Reject leave (HR / Admin / Manager)
router.patch(
  "/:id/status",
  authenticate,
  authorizeOrganization,
  authorizeRoles("HR", "ADMIN", "MANAGER"),
  updateLeaveStatus
);

// Delete leave (Employee / HR / Admin)
router.delete("/:id", authenticate, authorizeOrganization, deleteLeave);

export { router as leaveRouter };
