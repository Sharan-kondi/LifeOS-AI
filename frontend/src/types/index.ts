// LifeOS AI — Shared TypeScript Types
// These match the Prisma schema exactly

export interface User {
  id: string;
  fullName: string;
  email: string;
  age: number;
  city: string;
  profession: string;
  monthlyIncome: number;
  lifestyleType: string;
  monthlySavingsEstimate: number;
}

export interface Transaction {
  id: string;
  userId: string;
  timestamp: string;
  category: string;
  merchant: string;
  amount: number;
  paymentMethod: string;
  location: string;
  isWeekend: boolean;
  isNightTransaction: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  category: string;
  monthlyCost: number;
  renewalDate: string;
  active: boolean;
  autoPayEnabled: boolean;
  subscriptionStartDate: string;
  usageFrequency: string;
}

export interface Productivity {
  id: string;
  userId: string;
  date: string;
  sleepHours: number;
  workHours: number;
  focusSessions: number;
  meetingsCount: number;
  screenTimeHours: number;
  stressLevel: number;
  productivityScore: number;
  burnoutRisk: boolean;
}

export interface Anomaly {
  id: string;
  userId: string;
  timestamp: string;
  category: string;
  merchant: string;
  amount: number;
  paymentMethod: string;
  location: string;
  isWeekend: boolean;
  isNightTransaction: boolean;
  isAnomaly: boolean;
  anomalyType: string;
}

// API Response types
export interface Summary {
  totalTransactions: number;
  totalSpent: number;
  averageTransactionAmount: number;
  totalSubscriptions: number;
  totalSubscriptionCost: number;
  averageProductivity: number;
  averageSleep: number;
  averageStress: number;
  totalAnomalies: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  count: number;
}

export interface SpendingTrend {
  date: string;
  amount: number;
}

export interface TopMerchant {
  merchant: string;
  totalSpent: number;
  transactionCount: number;
}

export interface AnomalyStats {
  totalAnomalies: number;
  byType: {
    type: string;
    count: number;
    totalAmount: number;
  }[];
  recentAnomalies: Anomaly[];
}

export interface SubscriptionsResponse {
  data: Subscription[];
  total: number;
  totalMonthlyCost: number;
  activeCount: number;
  unusedCount: number;
  potentialSavings: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductivityResponse {
  averageScore: number;
  averageSleep: number;
  averageStress: number;
  burnoutRiskCount: number;
  total: number;
  data: Productivity[];
}

// AI/ML Types (Phase 2)
export interface DailyForecast {
  date: string;
  predicted_amount: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResponse {
  predictions: DailyForecast[];
  total_predicted: number;
  avg_daily: number;
  trend: "increasing" | "decreasing" | "stable";
  model_used: string;
}

export interface SavingsGoalRequest {
  target_amount: number;
  monthly_income: number;
  current_savings?: number;
}

export interface SavingsGoalResponse {
  months_needed: number;
  monthly_saving_required: number;
  feasibility: "easy" | "moderate" | "aggressive" | "not_feasible";
  projected_date: string;
  avg_monthly_spending: number;
}

export interface AIHealthResponse {
  models: Record<string, string>;
  metrics: Record<string, any>;
  total_loaded: number;
  total_registered: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
