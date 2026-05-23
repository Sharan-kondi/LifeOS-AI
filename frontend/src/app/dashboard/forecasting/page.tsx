"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calculator,
  Brain,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getForecast, getSavingsGoal } from "@/services/data";
import { useAuth } from "@/contexts/auth-context";
import type { ForecastResponse, SavingsGoalResponse } from "@/types";

const FEASIBILITY_COLORS = {
  easy: "text-emerald-400",
  moderate: "text-amber-400",
  aggressive: "text-orange-400",
  not_feasible: "text-red-400",
};

const FEASIBILITY_LABELS = {
  easy: "Easily achievable",
  moderate: "Moderate effort needed",
  aggressive: "Aggressive saving required",
  not_feasible: "Not feasible with current spending",
};

export default function ForecastingPage() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [savingsResult, setSavingsResult] = useState<SavingsGoalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState(30);

  // Auth context
  const { user } = useAuth();

  // Savings goal form
  const [targetAmount, setTargetAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [calculatingGoal, setCalculatingGoal] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, [forecastDays]);

  async function fetchForecast() {
    try {
      setLoading(true);
      const data = await getForecast(forecastDays);
      setForecast(data);
    } catch (error) {
      console.error("Failed to fetch forecast:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavingsGoal() {
    if (!targetAmount || !user?.monthlyIncome) return;
    try {
      setCalculatingGoal(true);
      const result = await getSavingsGoal(
        parseFloat(targetAmount),
        user.monthlyIncome,
        parseFloat(currentSavings) || 0
      );
      setSavingsResult(result);
    } catch (error) {
      console.error("Failed to calculate savings goal:", error);
    } finally {
      setCalculatingGoal(false);
    }
  }

  const TrendIcon =
    forecast?.trend === "increasing"
      ? TrendingUp
      : forecast?.trend === "decreasing"
      ? TrendingDown
      : Minus;

  const trendColor =
    forecast?.trend === "increasing"
      ? "text-red-400"
      : forecast?.trend === "decreasing"
      ? "text-emerald-400"
      : "text-amber-400";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Cashflow Forecasting
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered spending predictions and savings planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Brain className="mr-1 h-3 w-3" />
            {forecast?.model_used || "Loading..."}
          </Badge>
        </div>
      </div>

      {/* Forecast Period Toggle */}
      <div className="flex gap-2">
        {[7, 14, 30, 60, 90].map((days) => (
          <button
            key={days}
            onClick={() => setForecastDays(days)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              forecastDays === days
                ? "bg-violet-600 text-white"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {!loading && forecast && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Predicted Total ({forecastDays} days)
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      ₹{forecast.total_predicted.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Daily Spend</p>
                    <p className="text-2xl font-bold mt-1">
                      ₹{forecast.avg_daily.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Spending Trend</p>
                    <p className={`text-2xl font-bold mt-1 capitalize ${trendColor}`}>
                      {forecast.trend}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      forecast.trend === "increasing"
                        ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/20"
                        : forecast.trend === "decreasing"
                        ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/20"
                        : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20"
                    } shadow-lg`}
                  >
                    <TrendIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending Forecast</CardTitle>
          <CardDescription>
            Predicted daily spending with confidence intervals (shaded area)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Running forecast model...
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast?.predictions || []}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                    interval={Math.max(Math.floor((forecast?.predictions?.length || 1) / 8), 1)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.9 0 0)",
                    }}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    }
                  />
                  {/* Confidence band */}
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="oklch(0.145 0 0)"
                    name="Lower Bound"
                  />
                  {/* Main prediction line */}
                  <Area
                    type="monotone"
                    dataKey="predicted_amount"
                    stroke="oklch(0.6 0.22 265)"
                    strokeWidth={2}
                    fill="url(#forecastGradient)"
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Savings Goal Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-400" />
            <div>
              <CardTitle className="text-lg">Savings Goal Calculator</CardTitle>
              <CardDescription>
                How long until you can afford your goal?
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 120000"
                  className="h-10 w-full rounded-lg border border-input bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Monthly Income (₹) - Auto-filled
                </label>
                <input
                  type="number"
                  value={user?.monthlyIncome || ""}
                  disabled
                  className="h-10 w-full rounded-lg border border-input bg-secondary/30 px-4 text-sm text-muted-foreground opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Current Savings (₹, optional)
                </label>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="e.g. 10000"
                  className="h-10 w-full rounded-lg border border-input bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
                />
              </div>
              <Button
                onClick={handleSavingsGoal}
                disabled={!targetAmount || !user?.monthlyIncome || calculatingGoal}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {calculatingGoal ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Timeline
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {savingsResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6"
              >
                <h3 className="text-sm font-semibold mb-4 text-violet-300">
                  AI Savings Projection
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Time to goal
                    </span>
                    <span className="text-xl font-bold">
                      {savingsResult.months_needed} months
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Monthly saving needed
                    </span>
                    <span className="text-lg font-semibold">
                      ₹{savingsResult.monthly_saving_required.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Projected date
                    </span>
                    <span className="text-sm font-medium">
                      {savingsResult.projected_date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg monthly spending
                    </span>
                    <span className="text-sm font-medium">
                      ₹{savingsResult.avg_monthly_spending.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Feasibility:
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          FEASIBILITY_COLORS[savingsResult.feasibility]
                        }`}
                      >
                        {FEASIBILITY_LABELS[savingsResult.feasibility]}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
