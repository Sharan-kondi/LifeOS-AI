import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const {
      category,
      limit = "100",
      offset = "0",
      search,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { merchant: { contains: String(search), mode: "insensitive" } },
        { category: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: Math.min(parseInt(String(limit)), 500),
        skip: parseInt(String(offset)),
        orderBy: { [String(sortBy)]: String(sortOrder) },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: transactions,
      total,
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset)),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Error fetching transactions",
    });
  }
};

export const getTransactionsByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const breakdown = await prisma.transaction.groupBy({
      by: ["category"],
      where: { userId },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    res.json(
      breakdown.map((c) => ({
        category: c.category,
        totalAmount: Math.round((c._sum.amount || 0) * 100) / 100,
        averageAmount: Math.round((c._avg.amount || 0) * 100) / 100,
        count: c._count,
      }))
    );
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    res.status(500).json({
      message: "Error fetching category breakdown",
    });
  }
};

export const getSpendingTrend = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { days = "30" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(String(days)));

    const transactions = await prisma.transaction.findMany({
      where: { userId, timestamp: { gte: startDate } },
      select: { timestamp: true, amount: true, category: true },
      orderBy: { timestamp: "asc" },
    });

    // Group by date
    const dailySpending: Record<string, number> = {};
    transactions.forEach((tx) => {
      const dateKey = tx.timestamp.toISOString().split("T")[0];
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + tx.amount;
    });

    const trend = Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100,
    }));

    res.json(trend);
  } catch (error) {
    console.error("Error fetching spending trend:", error);
    res.status(500).json({
      message: "Error fetching spending trend",
    });
  }
};

export const getTopMerchants = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = "10" } = req.query;

    const merchants = await prisma.transaction.groupBy({
      by: ["merchant"],
      where: { userId },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: parseInt(String(limit)),
    });

    res.json(
      merchants.map((m) => ({
        merchant: m.merchant,
        totalSpent: Math.round((m._sum.amount || 0) * 100) / 100,
        transactionCount: m._count,
      }))
    );
  } catch (error) {
    console.error("Error fetching top merchants:", error);
    res.status(500).json({
      message: "Error fetching top merchants",
    });
  }
};