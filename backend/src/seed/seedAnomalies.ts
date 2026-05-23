import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/anomalies.csv"
);

console.log("CSV PATH:", csvPath);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} anomalies`);

    try {
      // Fetch all valid user IDs
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      const validUserIds = new Set(users.map((u) => u.id));
      console.log(`Valid Users: ${validUserIds.size}`);

      const batchSize = 1000;
      let inserted = 0;
      let skipped = 0;

      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);

        const validBatch = batch
          .filter((anomaly) => validUserIds.has(anomaly.user_id))
          .map((anomaly) => ({
            id: anomaly.transaction_id,
            userId: anomaly.user_id,
            timestamp: new Date(anomaly.timestamp),
            category: anomaly.category,
            merchant: anomaly.merchant,
            amount: parseFloat(anomaly.amount),
            paymentMethod: anomaly.payment_method,
            location: anomaly.location,
            isWeekend:
              anomaly.is_weekend === "True" ||
              anomaly.is_weekend === "true",
            isNightTransaction:
              anomaly.is_night_transaction === "True" ||
              anomaly.is_night_transaction === "true",
            isAnomaly:
              anomaly.is_anomaly === "True" ||
              anomaly.is_anomaly === "true",
            anomalyType: anomaly.anomaly_type,
          }));

        skipped += batch.length - validBatch.length;

        const insertedBatch = await prisma.anomaly.createMany({
          data: validBatch,
          skipDuplicates: true,
        });

        inserted += insertedBatch.count;

        console.log(
          `Inserted: ${inserted} | Skipped: ${skipped} | Processed: ${Math.min(
            i + batchSize,
            results.length
          )}`
        );
      }

      console.log(`
====================================
Anomalies Seeded Successfully
Inserted: ${inserted}
Skipped: ${skipped}
====================================
      `);
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
  });