import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/productivity.csv"
);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} productivity rows`);

    let inserted = 0;

    for (const item of results) {
      try {
        await prisma.productivity.create({
          data: {
            id: item.record_id,

            userId: item.user_id,

            date: new Date(item.date),

            sleepHours: parseFloat(item.sleep_hours),

            workHours: parseFloat(item.work_hours),

            focusSessions: parseInt(item.focus_sessions),

            meetingsCount: parseInt(item.meetings_count),

            screenTimeHours: parseFloat(
              item.screen_time_hours
            ),

            stressLevel: parseInt(item.stress_level),

            productivityScore: parseFloat(
              item.productivity_score
            ),

            burnoutRisk:
              item.burnout_risk === "True",

            exerciseDone:
              item.exercise_done === "True",
          },
        });

        inserted++;

        if (inserted % 1000 === 0) {
          console.log(`${inserted} productivity rows inserted`);
        }
      } catch (err) {
        console.log(err);
      }
    }

    console.log("Productivity Seeded Successfully");

    await prisma.$disconnect();
  });