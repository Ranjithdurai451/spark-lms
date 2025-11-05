import express from "express";
import {
  registerAdmin,
  sendEmailVerificationOtp,
  verifyEmail,
} from "@/controllers/auth.controller";
import { validateBody } from "@/lib/helpers/common.helper";
import {
  sendOtpSchema,
  verifyEmailSchema,
  registerAdminSchema,
} from "@/lib/schemas/auth.schema";

const router = express.Router();

router.post("/send-otp", validateBody(sendOtpSchema), sendEmailVerificationOtp);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post(
  "/register-admin",
  validateBody(registerAdminSchema),
  registerAdmin
);

export { router as authRouter };
