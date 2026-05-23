import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getAnomalies = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = "100", type } = req.query;

    const where: any = { isAnomaly: true };
    if (type) where.anomalyType = String(type);
    if (userId) where.userId = String(userId);

    const anomalies = await prisma.anomaly.findMany({
      where,
      take: Math.min(parseInt(String(limit)), 500),
      orderBy: { timestamp: "desc" },
    });

    res.json({
      data: anomalies,
      total: anomalies.length,
    });
  } catch (error) {
    console.error("Error fetching anomalies:", error);
    res.status(500).json({
      message: "Error fetching anomalies",
    });
  }
};

export const getAnomalyStats = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const [totalCount, byType, recentAnomalies] = await Promise.all([
      prisma.anomaly.count({ where: { userId, isAnomaly: true } }),

      prisma.anomaly.groupBy({
        by: ["anomalyType"],
        where: { userId, isAnomaly: true },
        _count: true,
        _sum: { amount: true },
        orderBy: { _count: { anomalyType: "desc" } },
      }),

      prisma.anomaly.findMany({
        where: { userId, isAnomaly: true },
        take: 5,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    res.json({
      totalAnomalies: totalCount,
      byType: byType.map((t) => ({
        type: t.anomalyType,
        count: t._count,
        totalAmount: Math.round((t._sum.amount || 0) * 100) / 100,
      })),
      recentAnomalies,
    });
  } catch (error) {
    console.error("Error fetching anomaly stats:", error);
    res.status(500).json({
      message: "Error fetching anomaly stats",
    });
  }
};