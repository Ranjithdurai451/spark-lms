import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route";
import { prisma } from "./db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route";
import { organizationRouter } from "./routes/organization.route";
import { main } from "./lib/test";
import { holidayRouter } from "./routes/holiday.route";
import { leavePolicyRouter } from "./routes/leave-policy.route";
import { leaveRouter } from "./routes/leave.route";
import { leaveBalanceRouter } from "./routes/leave-balance.route";
dotenv.config();
const PORT = process.env.PORT || 3000;
const FRONTEND_BASE_URL = [
  process.env.FRONTEND_BASE_URL || "http://localhost:5173",
];

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_BASE_URL,
    credentials: true,
  })
);

app.get("/clear", async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.organization.deleteMany(),
    ]);

    res.send("All data deleted successfully!");
  } catch (err) {
    console.log(err);
    res.status(400).send(" Error clearing database:");
  }
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/organizations", organizationRouter);
app.use("/holidays", holidayRouter);
app.use("/leave-policies", leavePolicyRouter);
app.use("/leaves", leaveRouter);
app.use("/leave-balances", leaveBalanceRouter);

(async () => {
  try {
    await prisma.$connect();
    console.log(" Database connected successfully.");
    // main();
    app.listen(PORT, () => {
      console.log(
        ` Server running on http://localhost:${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode.`
      );
    });
  } catch (error) {
    console.error("Failed to start server: Database connection error.", error);
    process.exit(1);
  }
})();
