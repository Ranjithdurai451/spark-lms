import express from "express";
import {
  deleteUser,
  getOrganizationById,
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
  "/:organizationId",
  authenticate,
  authorizeOrganization,
  getOrganizationById
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
