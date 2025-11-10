import express from "express";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holiday.controller";
import {
  authenticate,
  authorizeOrganization,
  authorizeRoles,
} from "../middlewares/auth.middleware";

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, authorizeOrganization, getHolidays);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  createHoliday
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  updateHoliday
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "HR"),
  authorizeOrganization,
  deleteHoliday
);

export { router as holidayRouter };
