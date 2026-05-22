import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getAnomalies = async (
  req: Request,
  res: Response
) => {
  try {
    const anomalies =
      await prisma.anomaly.findMany({
        where: {
          isAnomaly: true,
        },
        take: 100,
      });

    res.json(anomalies);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching anomalies",
    });
  }
};