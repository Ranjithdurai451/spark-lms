import { Router } from "express";

import {
  authenticate,
  authorizeOrganization,
} from "../middlewares/auth.middleware";
import { getMyLeaveBalances } from "../controllers/leave-balance.controller";

const router = Router();

router.get("/me", authenticate, authorizeOrganization, getMyLeaveBalances);

export { router as leaveBalanceRouter };
