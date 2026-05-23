"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getTransactionsByCategory,
  getSpendingTrend,
  getTopMerchants,
  getProductivity,
} from "@/services/data";
import type { CategoryBreakdown, SpendingTrend, TopMerchant, ProductivityResponse } from "@/types";

const CHART_COLORS = [
  "oklch(0.6 0.22 265)",
  "oklch(0.696 0.17 162)",
  "oklch(0.769 0.188 70)",
  "oklch(0.627 0.265 304)",
  "oklch(0.645 0.246 16)",
  "oklch(0.55 0.2 230)",
  "oklch(0.65 0.19 140)",
  "oklch(0.7 0.15 50)",
];

export default function AnalyticsPage() {
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trend, setTrend] = useState<SpendingTrend[]>([]);
  const [merchants, setMerchants] = useState<TopMerchant[]>([]);
  const [productivity, setProductivity] = useState<ProductivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catData, trendData, merchantData, prodData] = await Promise.all([
          getTransactionsByCategory(),
          getSpendingTrend(90),
          getTopMerchants(10),
          getProductivity({ limit: 30 }),
        ]);
        setCategories(catData);
        setTrend(trendData);
        setMerchants(merchantData);
        setProductivity(prodData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Deep dive into your financial patterns and productivity metrics
        </p>
      </div>

      {/* Row 1: Category Bar Chart + Monthly Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
            <CardDescription>Total amount spent per category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.9 0 0)",
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                  />
                  <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]}>
                    {categories.slice(0, 10).map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending Trend (90 Days)</CardTitle>
            <CardDescription>Daily spending over the last 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    }
                    interval={6}
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
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="oklch(0.6 0.22 265)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Merchants + Productivity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Merchants</CardTitle>
            <CardDescription>Where your money goes most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {merchants.map((m, i) => {
                const maxAmount = merchants[0]?.totalSpent || 1;
                const percentage = (m.totalSpent / maxAmount) * 100;

                return (
                  <motion.div
                    key={m.merchant}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {m.merchant}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold tabular-nums">
                          ₹{m.totalSpent.toLocaleString("en-IN")}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({m.transactionCount} txns)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Productivity Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productivity Metrics</CardTitle>
            <CardDescription>Your work & wellness stats (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 text-center">
                <p className="text-2xl font-bold text-violet-400">
                  {productivity?.averageScore?.toFixed(1) || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 text-center">
                <p className="text-2xl font-bold text-cyan-400">
                  {productivity?.averageSleep?.toFixed(1) || 0}h
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Sleep</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">
                  {productivity?.averageStress?.toFixed(1) || 0}/10
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg Stress</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 text-center">
                <p className="text-2xl font-bold text-rose-400">
                  {productivity?.burnoutRiskCount || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Burnout Risk Days</p>
              </div>
            </div>

            {/* Productivity trend mini-chart */}
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(productivity?.data || []).slice().reverse()}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-IN", { day: "numeric" })
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.2 0 0)",
                      border: "1px solid oklch(0.3 0 0)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(0.9 0 0)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="productivityScore"
                    stroke="oklch(0.6 0.22 265)"
                    strokeWidth={1.5}
                    dot={false}
                    name="Productivity"
                  />
                  <Line
                    type="monotone"
                    dataKey="stressLevel"
                    stroke="oklch(0.645 0.246 16)"
                    strokeWidth={1.5}
                    dot={false}
                    name="Stress"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
