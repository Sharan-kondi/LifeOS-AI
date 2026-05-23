import express from "express";
import {
  predictCategory,
  predictCategoryBatch,
  detectAnomaly,
  forecastSpending,
  calculateSavingsGoal,
  getAIHealth,
  getModelMetrics,
} from "../services/ai-services";

const router = express.Router();

// --- Categorization ---
router.post("/categorize", async (req, res) => {
  try {
    const { description } = req.body;
    const result = await predictCategory(description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Categorization failed" });
  }
});

router.post("/categorize/batch", async (req, res) => {
  try {
    const { descriptions } = req.body;
    const result = await predictCategoryBatch(descriptions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Batch categorization failed" });
  }
});

// --- Anomaly Detection ---
router.post("/detect-anomaly", async (req, res) => {
  try {
    const result = await detectAnomaly(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Anomaly detection failed" });
  }
});

// --- Forecasting ---
router.post("/forecast", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { forecast_days = 30 } = req.body;
    const result = await forecastSpending(forecast_days, userId);
    if (!result) {
      return res.status(503).json({ error: "Forecasting service unavailable" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Forecasting failed" });
  }
});

router.post("/savings-goal", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { target_amount, monthly_income, current_savings = 0 } = req.body;
    const result = await calculateSavingsGoal(target_amount, monthly_income, current_savings, userId);
    if (!result) {
      return res.status(503).json({ error: "Savings calculation unavailable" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate savings goal" });
  }
});

// --- AI Assistant (Multi-Agent RAG) ---
router.post("/chat", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { query, history = [] } = req.body;

    const axios = require("axios");
    const response = await axios.post(`${process.env.AI_SERVICE_URL || "http://127.0.0.1:8000"}/agent/chat`, {
      query,
      history,
      user_id: userId
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("AI Agent Error:", error.message);
    res.status(503).json({ error: "AI Assistant is currently unavailable" });
  }
});

// --- Health & Metrics ---
router.get("/health", async (req, res) => {
  try {
    const result = await getAIHealth();
    res.json(result);
  } catch (error) {
    res.status(503).json({ status: "unreachable" });
  }
});

router.get("/metrics/:model", async (req, res) => {
  try {
    const { model } = req.params;
    if (!["categorize", "anomaly", "forecast"].includes(model)) {
      return res.status(400).json({ error: "Invalid model. Use: categorize, anomaly, forecast" });
    }
    const result = await getModelMetrics(model as any);
    if (!result) {
      return res.status(404).json({ error: `${model} metrics not available` });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
