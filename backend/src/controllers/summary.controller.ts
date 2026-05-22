import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions =
      await prisma.transaction.findMany();

    const subscriptions =
      await prisma.subscription.findMany();

    const productivity =
      await prisma.productivity.findMany();

    const anomalies =
      await prisma.anomaly.findMany({
        where: {
          isAnomaly: true,
        },
      });

    const totalSpent =
      transactions.reduce(
        (acc, tx) => acc + tx.amount,
        0
      );

    const totalSubscriptionCost =
      subscriptions.reduce(
        (acc, sub) =>
          acc + sub.monthlyCost,
        0
      );

    const avgProductivity =
      productivity.reduce(
        (acc, item) =>
          acc + item.productivityScore,
        0
      ) / productivity.length;

    res.json({
      totalTransactions:
        transactions.length,

      totalSpent,

      totalSubscriptionCost,

      totalAnomalies:
        anomalies.length,

      averageProductivity:
        avgProductivity,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching summary",
    });
  }
};