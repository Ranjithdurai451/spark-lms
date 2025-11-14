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
  cancelLeave,
  updateLeaveStatus,
  deleteLeave,
  getAllLeaveStats,
  getMyLeaveStats,
} from "../controllers/leaves.controller";

const router = express.Router();

/* ──────────────── Routes ──────────────── */

// For Employee to view their own leaves
router.get("/my", authenticate, authorizeOrganization, getMyLeaves);
router.get("/my/stats", authenticate, authorizeOrganization, getMyLeaveStats);
// For HR/Admin/Manager to view all leaves in organization
router.get("/", authenticate, authorizeOrganization, getAllLeaves);
router.get("/stats", authenticate, authorizeOrganization, getAllLeaveStats);

// Create new leave (Employee)
router.post("/", authenticate, authorizeOrganization, createLeave);

// Cancel leave (Employee - only for pending leaves)
router.patch("/:id/cancel", authenticate, authorizeOrganization, cancelLeave);

// Approve / Reject leave (HR / Admin / Manager)
router.patch(
  "/:id/status",
  authenticate,
  authorizeOrganization,
  authorizeRoles("HR", "ADMIN", "MANAGER"),
  updateLeaveStatus
);

// Delete leave (HR / Admin only)
router.delete(
  "/:id",
  authenticate,
  authorizeOrganization,
  authorizeRoles("HR", "ADMIN"),
  deleteLeave
);

export { router as leaveRouter };
