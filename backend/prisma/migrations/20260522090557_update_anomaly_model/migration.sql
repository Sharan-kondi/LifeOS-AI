/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `riskScore` on the `Anomaly` table. All the data in the column will be lost.
  - Added the required column `anomalyType` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAnomaly` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isNightTransaction` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isWeekend` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Anomaly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Anomaly` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anomaly" DROP COLUMN "createdAt",
DROP COLUMN "reason",
DROP COLUMN "riskScore",
ADD COLUMN     "anomalyType" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isAnomaly" BOOLEAN NOT NULL,
ADD COLUMN     "isNightTransaction" BOOLEAN NOT NULL,
ADD COLUMN     "isWeekend" BOOLEAN NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;
