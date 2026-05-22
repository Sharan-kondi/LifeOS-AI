import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getProductivity = async (
  req: Request,
  res: Response
) => {
  try {
    const productivity =
      await prisma.productivity.findMany({
        take: 100,
        orderBy: {
          date: "desc",
        },
      });

    const averageScore =
      productivity.reduce(
        (acc, item) =>
          acc + item.productivityScore,
        0
      ) / productivity.length;

    res.json({
      averageScore,
      data: productivity,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching productivity",
    });
  }
};