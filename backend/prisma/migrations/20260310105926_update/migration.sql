/*
  Warnings:

  - Added the required column `salary_avg` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "job_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "salary_min" INTEGER NOT NULL,
    "salary_max" INTEGER NOT NULL,
    "salary_avg" INTEGER NOT NULL,
    "start_time" DATETIME,
    "end_time" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "note" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("business_id", "end_time", "job_id", "note", "position_id", "salary_max", "salary_min", "start_time", "status", "updatedAt") SELECT "business_id", "end_time", "job_id", "note", "position_id", "salary_max", "salary_min", "start_time", "status", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
