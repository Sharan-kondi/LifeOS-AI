import api from "./api";
import type { Summary, SpendingTrend, CategoryBreakdown, TopMerchant, AnomalyStats, TransactionsResponse, SubscriptionsResponse, ProductivityResponse, ForecastResponse, SavingsGoalResponse, AIHealthResponse } from "@/types";

export async function getSummary(): Promise<Summary> {
  const { data } = await api.get("/summary");
  return data;
}

export async function login(email: string, password?: string): Promise<any> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getMe(): Promise<any> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getTransactions(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<TransactionsResponse> {
  const { data } = await api.get("/transactions", { params });
  return data;
}

export async function getTransactionsByCategory(): Promise<CategoryBreakdown[]> {
  const { data } = await api.get("/transactions/by-category");
  return data;
}

export async function getSpendingTrend(days?: number): Promise<SpendingTrend[]> {
  const { data } = await api.get("/transactions/trend", { params: { days } });
  return data;
}

export async function getTopMerchants(limit?: number): Promise<TopMerchant[]> {
  const { data } = await api.get("/transactions/top-merchants", { params: { limit } });
  return data;
}

export async function getSubscriptions(params?: {
  active?: boolean;
  limit?: number;
}): Promise<SubscriptionsResponse> {
  const { data } = await api.get("/subscriptions", { params });
  return data;
}

export async function getProductivity(params?: {
  limit?: number;
}): Promise<ProductivityResponse> {
  const { data } = await api.get("/productivity", { params });
  return data;
}

export async function getAnomalyStats(): Promise<AnomalyStats> {
  const { data } = await api.get("/anomalies/stats");
  return data;
}

// AI/ML API functions (Phase 2)
export async function getForecast(forecast_days: number = 30): Promise<ForecastResponse> {
  const { data } = await api.post("/ai/forecast", { forecast_days });
  return data;
}

export async function getSavingsGoal(
  target_amount: number,
  monthly_income: number,
  current_savings: number = 0
): Promise<SavingsGoalResponse> {
  const { data } = await api.post("/ai/savings-goal", {
    target_amount,
    monthly_income,
    current_savings,
  });
  return data;
}

export async function getAIHealth(): Promise<AIHealthResponse> {
  const { data } = await api.get("/ai/health");
  return data;
}

export async function getModelMetrics(model: string): Promise<any> {
  const { data } = await api.get(`/ai/metrics/${model}`);
  return data;
}

export async function sendChatMessage(query: string, history: any[] = []): Promise<{ answer: string }> {
  const { data } = await api.post("/ai/chat", { query, history });
  return data;
}

export async function getAIInsights(): Promise<{ answer: string }> {
  const { data } = await api.post("/ai/insights");
  return data;
}
