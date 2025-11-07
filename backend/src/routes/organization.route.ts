import express from "express";
import {
  getOrganizationById,
  inviteMember,
} from "../controllers/organization.controller";
import { authenticate } from "../middlewares/auth.middleware";
const router = express.Router();

router.get("/:organizationId", authenticate, getOrganizationById);
router.post("/invite-member", authenticate, inviteMember);

export { router as organizationRouter };
