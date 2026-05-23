import fs from "fs";
import path from "path";
import csv from "csv-parser";

import prisma from "../database/prisma";

const results: any[] = [];

const csvPath = path.join(
  __dirname,
  "../../../datasets/exports/users.csv"
);

console.log("CSV PATH:", csvPath);

fs.createReadStream(csvPath)
  .pipe(csv())

  .on("data", (data) => {
    results.push(data);
  })

  .on("end", async () => {
    try {
      console.log(`Found ${results.length} users`);

      // Default password: LifeOS@2026
      const bcrypt = require("bcryptjs");
      const defaultPasswordHash = await bcrypt.hash("LifeOS@2026", 10);

      let inserted = 0;

      for (const user of results) {
        await prisma.user.create({
          data: {
            id: user.user_id,
            fullName: user.full_name,
            email: user.email,
            password: defaultPasswordHash,
            age: Number(user.age),
            city: user.city,
            profession: user.profession,
            monthlyIncome: Number(user.monthly_income),
            lifestyleType: user.lifestyle_type,
            monthlySavingsEstimate: Number(user.monthly_savings_estimate),
          },
        });

        inserted++;

        if (inserted % 1000 === 0) {
          console.log(
            `${inserted} users inserted`
          );
        }
      }

      console.log(
        "Users Seeded Successfully"
      );
    } catch (error) {
      console.log(error);
    } finally {
      await prisma.$disconnect();
    }
  });