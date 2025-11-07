import express from "express";
import {
  acceptInvite,
  checkAuth,
  forgotPassword,
  login,
  logout,
  registerAdmin,
  resetPassword,
  sendEmailVerificationOtp,
  verifyEmail,
} from "../controllers/auth.controller";
import { validateBody } from "../lib/helpers/common.helper";
import {
  sendOtpSchema,
  verifyEmailSchema,
  registerAdminSchema,
  acceptInviteSchema,
  loginSchema,
} from "../lib/schemas/auth.schema";

const router = express.Router();

router.post("/send-otp", validateBody(sendOtpSchema), sendEmailVerificationOtp);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post(
  "/register-admin",
  validateBody(registerAdminSchema),
  registerAdmin
);
router.post("/accept-invite", validateBody(acceptInviteSchema), acceptInvite);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check", checkAuth);
export { router as authRouter };
