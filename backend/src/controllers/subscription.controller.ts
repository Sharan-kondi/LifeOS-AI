import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getSubscriptions = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { active, limit = "100" } = req.query;

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (active !== undefined) where.active = active === "true";

    const subscriptions = await prisma.subscription.findMany({
      where,
      take: Math.min(parseInt(String(limit)), 500),
      orderBy: { monthlyCost: "desc" },
    });

    const totalMonthlyCost = subscriptions.reduce(
      (acc, sub) => acc + sub.monthlyCost,
      0
    );

    const activeCount = subscriptions.filter((s) => s.active).length;
    const unusedCount = subscriptions.filter(
      (s) => s.active && s.usageFrequency === "Unused"
    ).length;

    res.json({
      data: subscriptions,
      total: subscriptions.length,
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      activeCount,
      unusedCount,
      potentialSavings: subscriptions
        .filter((s) => s.active && s.usageFrequency === "Unused")
        .reduce((acc, s) => acc + s.monthlyCost, 0),
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      message: "Error fetching subscriptions",
    });
  }
};