import express from "express";

import {
  authenticate,
  authorizeRoles,
  authorizeOrganization,
} from "../middlewares/auth.middleware";
import {
  getLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  getLeavePolicyStats,
} from "../controllers/leave-policy.controller";

const router = express.Router();

// GET all policies for an organization
router.get("/", authenticate, authorizeOrganization, getLeavePolicies);
router.get("/stats", authenticate, authorizeOrganization, getLeavePolicyStats);
// CREATE new policy
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  createLeavePolicy
);

// UPDATE policy
router.put(
  "/:policyId",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  updateLeavePolicy
);

// DELETE policy
router.delete(
  "/:policyId",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  deleteLeavePolicy
);

export { router as leavePolicyRouter };
