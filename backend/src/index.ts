import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import transactionRoutes from "./routes/transaction.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import productivityRoutes from "./routes/productivity.routes";
import anomalyRoutes from "./routes/anomaly.routes";
import summaryRoutes from "./routes/summary.routes";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import { authenticateToken } from "./middleware/auth.middleware";

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth Routes (Public)
app.use("/api/auth", authRoutes);

// Protected API Routes
app.use("/api/transactions", authenticateToken, transactionRoutes);
app.use("/api/subscriptions", authenticateToken, subscriptionRoutes);
app.use("/api/productivity", authenticateToken, productivityRoutes);
app.use("/api/anomalies", authenticateToken, anomalyRoutes);
app.use("/api/summary", authenticateToken, summaryRoutes);
app.use("/api/ai", authenticateToken, aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 LifeOS AI Backend running on port ${PORT}`);
});