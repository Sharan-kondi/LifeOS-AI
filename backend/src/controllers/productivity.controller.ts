import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getProductivity = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = "100" } = req.query;

    const productivity = await prisma.productivity.findMany({
      where: { userId: String(userId) },
      take: Math.min(parseInt(String(limit)), 500),
      orderBy: { date: "desc" },
    });

    const averageScore =
      productivity.length > 0
        ? productivity.reduce((acc, item) => acc + item.productivityScore, 0) /
          productivity.length
        : 0;

    const averageSleep =
      productivity.length > 0
        ? productivity.reduce((acc, item) => acc + item.sleepHours, 0) /
          productivity.length
        : 0;

    const averageStress =
      productivity.length > 0
        ? productivity.reduce((acc, item) => acc + item.stressLevel, 0) /
          productivity.length
        : 0;

    const burnoutCount = productivity.filter((p) => p.burnoutRisk).length;

    res.json({
      averageScore: Math.round(averageScore * 100) / 100,
      averageSleep: Math.round(averageSleep * 100) / 100,
      averageStress: Math.round(averageStress * 100) / 100,
      burnoutRiskCount: burnoutCount,
      total: productivity.length,
      data: productivity,
    });
  } catch (error) {
    console.error("Error fetching productivity:", error);
    res.status(500).json({
      message: "Error fetching productivity",
    });
  }
};