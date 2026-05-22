import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/transactions.csv"
);

console.log("CSV PATH:", csvPath);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} transactions`);

    try {
      // FETCH ALL VALID USERS
      const users = await prisma.user.findMany({
        select: {
          id: true,
        },
      });

      const validUserIds = new Set(users.map((u) => u.id));

      console.log(`Valid Users: ${validUserIds.size}`);

      const limitedResults = results.slice(0,630767);

      const batchSize = 1000;

      let inserted = 0;
      let skipped = 0;

      for (let i = 0; i < limitedResults.length; i += batchSize) {
        const batch = limitedResults.slice(i, i + batchSize);

        const validBatch = batch
          .filter((transaction) =>
            validUserIds.has(transaction.user_id)
          )
          .map((transaction) => ({
            id: transaction.transaction_id,

            userId: transaction.user_id,

            timestamp: new Date(transaction.timestamp),

            category: transaction.category,

            merchant: transaction.merchant,

            amount: parseFloat(transaction.amount),

            paymentMethod: transaction.payment_method,

            location: transaction.location,

            isWeekend:
              transaction.is_weekend === "True" ||
              transaction.is_weekend === "true",

            isNightTransaction:
              transaction.is_night_transaction === "True" ||
              transaction.is_night_transaction === "true",
          }));

        skipped += batch.length - validBatch.length;

        const insertedBatch =
          await prisma.transaction.createMany({
            data: validBatch,
            skipDuplicates: true,
          });

        inserted += insertedBatch.count;

        console.log(`
====================================
Inserted: ${inserted}
Skipped: ${skipped}
Processed: ${Math.min(
          i + batchSize,
          limitedResults.length
        )}
====================================
`);
      }

      console.log(`
====================================
Transactions Seeded Successfully
Inserted: ${inserted}
Skipped: ${skipped}
====================================
`);

      await prisma.$disconnect();
    } catch (error) {
      console.error(error);

      await prisma.$disconnect();
    }
  });