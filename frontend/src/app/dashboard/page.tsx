"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSummary, getSpendingTrend, getAnomalyStats } from "@/services/data";
import type { Summary, SpendingTrend, AnomalyStats } from "@/types";

const CHART_COLORS = [
  "oklch(0.6 0.22 265)",    // violet
  "oklch(0.696 0.17 162)",  // teal
  "oklch(0.769 0.188 70)",  // amber
  "oklch(0.627 0.265 304)", // purple
  "oklch(0.645 0.246 16)",  // rose
  "oklch(0.55 0.2 230)",    // blue
  "oklch(0.65 0.19 140)",   // green
  "oklch(0.7 0.15 50)",     // orange
];

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + (value - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<SpendingTrend[]>([]);
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, trendData, anomalyData] = await Promise.all([
          getSummary(),
          getSpendingTrend(30),
          getAnomalyStats(),
        ]);
        setSummary(summaryData);
        setTrend(trendData);
        setAnomalyStats(anomalyData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your financial intelligence...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Spent",
      value: summary?.totalSpent || 0,
      prefix: "₹",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "from-violet-600 to-indigo-600",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Subscriptions",
      value: summary?.totalSubscriptionCost || 0,
      prefix: "₹",
      suffix: "/mo",
      icon: CreditCard,
      trend: `${summary?.totalSubscriptions || 0} active`,
      trendUp: false,
      color: "from-cyan-500 to-teal-500",
      shadowColor: "shadow-cyan-500/20",
    },
    {
      title: "Anomalies",
      value: summary?.totalAnomalies || 0,
      icon: AlertTriangle,
      trend: "Needs review",
      trendUp: true,
      color: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
    {
      title: "Productivity",
      value: summary?.averageProductivity || 0,
      suffix: " pts",
      icon: Activity,
      trend: "Average score",
      trendUp: false,
      color: "from-emerald-500 to-green-500",
      shadowColor: "shadow-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your financial & productivity overview at a glance
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-violet-300">
            AI Insights Coming Soon
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.03]`}
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} ${card.shadowColor} shadow-lg`}
                  >
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight">
                    <AnimatedCounter
                      value={card.value}
                      prefix={card.prefix}
                      suffix={card.suffix}
                    />
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {card.trendUp ? (
                      <ArrowUpRight className="h-3 w-3 text-amber-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                    )}
                    <span className="text-muted-foreground">{card.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Spending Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Spending Trend</CardTitle>
                <CardDescription>Daily spending over the last 30 days</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.6 0.22 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                    tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="oklch(0.6 0.22 265)"
                    strokeWidth={2}
                    fill="url(#spendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
            <CardDescription>Spending distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary?.categoryBreakdown || []}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="oklch(0.145 0 0)"
                  >
                    {(summary?.categoryBreakdown || []).map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(summary?.categoryBreakdown || []).slice(0, 6).map((item, i) => (
                <div key={item.category} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="truncate text-muted-foreground">{item.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(summary?.recentTransactions || []).slice(0, 8).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-4 py-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{tx.merchant}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary">{tx.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Anomaly Alerts</CardTitle>
                <CardDescription>
                  {anomalyStats?.totalAnomalies || 0} suspicious transactions detected
                </CardDescription>
              </div>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {/* By type breakdown */}
            <div className="space-y-3 mb-4">
              {(anomalyStats?.byType || []).slice(0, 5).map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{item.type}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.count} cases</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{item.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent anomalies */}
            <div className="border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Most Recent
              </p>
              {(anomalyStats?.recentAnomalies || []).slice(0, 3).map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{anomaly.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="font-semibold text-amber-400">
                    ₹{anomaly.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
