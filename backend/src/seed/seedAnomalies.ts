import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/anomalies.csv"
);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} anomalies`);

    let inserted = 0;

    for (const anomaly of results) {
      try {
        await prisma.anomaly.create({
          data: {
            id: anomaly.transaction_id,

            userId: anomaly.user_id,

            anomalyType: anomaly.anomaly_type,

            riskScore: parseFloat(anomaly.amount),

            detectedAt: new Date(anomaly.timestamp),
          },
        });

        inserted++;

        if (inserted % 1000 === 0) {
          console.log(`${inserted} anomalies inserted`);
        }
      } catch (err) {
        console.log(err);
      }
    }

    console.log("Anomalies Seeded Successfully");

    await prisma.$disconnect();
  });