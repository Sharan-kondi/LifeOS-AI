import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/productivity.csv"
);

console.log("CSV PATH:", csvPath);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} productivity rows`);

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
          .filter((item) => validUserIds.has(item.user_id))
          .map((item) => ({
            id: item.record_id,
            userId: item.user_id,
            date: new Date(item.date),
            sleepHours: parseFloat(item.sleep_hours),
            workHours: parseFloat(item.work_hours),
            focusSessions: parseInt(item.focus_sessions),
            meetingsCount: parseInt(item.meetings_count),
            screenTimeHours: parseFloat(item.screen_time_hours),
            stressLevel: parseInt(item.stress_level),
            productivityScore: parseFloat(item.productivity_score),
            burnoutRisk:
              item.burnout_risk === "True" ||
              item.burnout_risk === "true",
          }));

        skipped += batch.length - validBatch.length;

        const insertedBatch = await prisma.productivity.createMany({
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
Productivity Seeded Successfully
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