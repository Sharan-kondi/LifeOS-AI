import { Request, Response } from "express";
import prisma from "../database/prisma";

export const getSubscriptions = async (
  req: Request,
  res: Response
) => {
  try {
    const subscriptions =
      await prisma.subscription.findMany({
        take: 100,
      });

    res.json(subscriptions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching subscriptions",
    });
  }
};