import express from "express";
import {
  deleteUser,
  getOrganizationMembers,
  getOrganizationMemberStats,
  inviteMember,
  updateUser,
} from "../controllers/organization.controller";
import {
  authenticate,
  authorizeOrganization,
  authorizeRoles,
} from "../middlewares/auth.middleware";
const router = express.Router();
router.get(
  "/:organizationId/members",
  authenticate,
  authorizeOrganization,
  getOrganizationMembers
);
router.get(
  "/:organizationId/members/stats",
  authenticate,
  authorizeOrganization,
  getOrganizationMemberStats
);
router.post(
  "/invite-member",
  authenticate,
  authorizeRoles("ADMIN"),
  authorizeOrganization,
  inviteMember
);
router.put(
  "/members/:id",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  updateUser
);
router.delete(
  "/members/:id",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  deleteUser
);
export { router as organizationRouter };
