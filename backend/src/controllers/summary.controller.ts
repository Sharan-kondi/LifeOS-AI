import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Use aggregation queries instead of loading all records into memory
    const [
      transactionStats,
      subscriptionStats,
      productivityStats,
      anomalyCount,
      recentTransactions,
      categoryBreakdown,
    ] = await Promise.all([
      // Total transactions and spending
      prisma.transaction.aggregate({
        where: { userId },
        _count: true,
        _sum: { amount: true },
        _avg: { amount: true },
      }),

      // Total subscription cost
      prisma.subscription.aggregate({
        where: { userId },
        _count: true,
        _sum: { monthlyCost: true },
      }),

      // Average productivity score
      prisma.productivity.aggregate({
        where: { userId },
        _count: true,
        _avg: { productivityScore: true, sleepHours: true, stressLevel: true },
      }),

      // Anomaly count
      prisma.anomaly.count({
        where: { userId, isAnomaly: true },
      }),

      // Recent transactions for dashboard
      prisma.transaction.findMany({
        where: { userId },
        take: 10,
        orderBy: { timestamp: "desc" },
      }),

      // Spending by category (top 10)
      prisma.transaction.groupBy({
        by: ["category"],
        where: { userId },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
        take: 10,
      }),
    ]);

    res.json({
      totalTransactions: transactionStats._count,
      totalSpent: Math.round((transactionStats._sum.amount || 0) * 100) / 100,
      averageTransactionAmount:
        Math.round((transactionStats._avg.amount || 0) * 100) / 100,

      totalSubscriptions: subscriptionStats._count,
      totalSubscriptionCost:
        Math.round((subscriptionStats._sum.monthlyCost || 0) * 100) / 100,

      averageProductivity:
        Math.round((productivityStats._avg.productivityScore || 0) * 100) / 100,
      averageSleep:
        Math.round((productivityStats._avg.sleepHours || 0) * 100) / 100,
      averageStress:
        Math.round((productivityStats._avg.stressLevel || 0) * 100) / 100,

      totalAnomalies: anomalyCount,

      recentTransactions,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        totalAmount: Math.round((c._sum.amount || 0) * 100) / 100,
        count: c._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({
      message: "Error fetching summary",
    });
  }
};