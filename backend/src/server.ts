import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "@/routes/auth.route";
import { prisma } from "./db.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const FRONTEND_BASE_URL = [
  process.env.FRONTEND_BASE_URL || "http://localhost:5173",
];

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_BASE_URL,
    credentials: true,
  })
);
app.get("/api", async (req, res) => {
  res.send("working");
});
app.use("/auth", authRouter);

(async () => {
  try {
    await prisma.$connect();
    console.log("✔ Database connected successfully.");
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode.`
      );
    });
  } catch (error) {
    console.error(
      "✖ Failed to start server: Database connection error.",
      error
    );
    process.exit(1);
  }
})();
