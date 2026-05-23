import axios from "axios";

const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// --- Categorization ---

export const predictCategory = async (description: string) => {
  try {
    const response = await aiClient.post("/categorize/predict", { description });
    return response.data;
  } catch (error) {
    console.error("AI Category Prediction Error:", error);
    return { category: "Others", confidence: 0 };
  }
};

export const predictCategoryBatch = async (descriptions: string[]) => {
  try {
    const response = await aiClient.post("/categorize/predict/batch", { descriptions });
    return response.data;
  } catch (error) {
    console.error("AI Batch Categorization Error:", error);
    return { results: descriptions.map(() => ({ category: "Others", confidence: 0 })) };
  }
};

// --- Anomaly Detection ---

export const detectAnomaly = async (transaction: {
  amount: number;
  category: string;
  merchant: string;
  payment_method: string;
  hour?: number;
  day_of_week?: number;
  is_weekend?: boolean;
  is_night?: boolean;
  user_mean_amount?: number;
  user_std_amount?: number;
  user_median_amount?: number;
}) => {
  try {
    const response = await aiClient.post("/anomaly/detect", transaction);
    return response.data;
  } catch (error) {
    console.error("AI Anomaly Detection Error:", error);
    return { is_anomaly: false, anomaly_score: 0, explanation: "AI service unavailable" };
  }
};

// --- Forecasting ---

export const forecastSpending = async (forecast_days: number = 30, user_id?: string) => {
  try {
    const response = await aiClient.post("/forecast/spending", { forecast_days, user_id });
    return response.data;
  } catch (error) {
    console.error("AI Forecast Error:", error);
    return null;
  }
};

export const calculateSavingsGoal = async (
  target_amount: number,
  monthly_income: number,
  current_savings: number = 0,
  user_id?: string
) => {
  try {
    const response = await aiClient.post("/forecast/savings-goal", {
      target_amount,
      monthly_income,
      current_savings,
      user_id,
    });
    return response.data;
  } catch (error) {
    console.error("AI Savings Goal Error:", error);
    return null;
  }
};

// --- Health & Metrics ---

export const getAIHealth = async () => {
  try {
    const response = await aiClient.get("/health");
    return response.data;
  } catch (error) {
    console.error("AI Health Check Error:", error);
    return { status: "unreachable" };
  }
};

export const getModelMetrics = async (model: "categorize" | "anomaly" | "forecast") => {
  try {
    const response = await aiClient.get(`/${model}/metrics`);
    return response.data;
  } catch (error) {
    console.error(`AI ${model} Metrics Error:`, error);
    return null;
  }
};