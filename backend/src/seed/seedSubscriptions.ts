import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/subscriptions.csv"
);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} subscriptions`);

    let inserted = 0;

    for (const subscription of results) {
      try {
        await prisma.subscription.create({
          data: {
            id: subscription.subscription_id,
            userId: subscription.user_id,

            serviceName: subscription.service_name,
            category: subscription.category,

            monthlyCost: parseFloat(subscription.monthly_cost),

            renewalDate: new Date(subscription.renewal_date),

            active: subscription.active === "True",

            autoPayEnabled:
              subscription.auto_pay_enabled === "True",

            subscriptionStartDate: new Date(
              subscription.subscription_start_date
            ),

            usageFrequency:
              subscription.usage_frequency,
          },
        });

        inserted++;

        if (inserted % 1000 === 0) {
          console.log(`${inserted} subscriptions inserted`);
        }
      } catch (err) {
        console.log(err);
      }
    }

    console.log("Subscriptions Seeded Successfully");

    await prisma.$disconnect();
  });