// backend/routes/user.routes.ts
import express from "express";
import {
  authenticate,
  authorizeOrganization,
} from "../middlewares/auth.middleware";
import {
  getDashboardStats,
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller";

const router = express.Router();

// Get own profile or another user's profile
router.get("/profile", authenticate, authorizeOrganization, getUserProfile);

// Get another user's profile (with userId parameter)
router.get(
  "/profile/:userId",
  authenticate,
  authorizeOrganization,
  getUserProfile
);

router.get(
  "/dashboard-stats",
  authenticate,
  authorizeOrganization,
  getDashboardStats
);

// Update own profile
router.patch("/profile", authenticate, updateProfile);

export { router as userRouter };
