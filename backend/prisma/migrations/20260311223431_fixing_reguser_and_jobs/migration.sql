/*
  Warnings:

  - You are about to alter the column `location_lat` on the `Business` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `location_lon` on the `Business` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `salary_avg` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `salary_max` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `salary_min` on the `Job` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - A unique constraint covering the columns `[username]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Made the column `start_time` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "business_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "owner_name" TEXT NOT NULL,
    "biography" TEXT,
    "avatar" TEXT,
    "phone_number" TEXT NOT NULL,
    "postal_address" TEXT NOT NULL,
    "location_lon" REAL NOT NULL,
    "location_lat" REAL NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Business_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("account_id", "avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified") SELECT "account_id", "avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_account_id_key" ON "Business"("account_id");
CREATE TABLE "new_Interest" (
    "interest_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_interest" BOOLEAN,
    "job_id" INTEGER NOT NULL,
    "business_interest" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Interest" ("business_interest", "interest_id", "job_id", "updatedAt", "user_id", "user_interest") SELECT "business_interest", "interest_id", "job_id", "updatedAt", "user_id", "user_interest" FROM "Interest";
DROP TABLE "Interest";
ALTER TABLE "new_Interest" RENAME TO "Interest";
CREATE UNIQUE INDEX "Interest_job_id_user_id_key" ON "Interest"("job_id", "user_id");
CREATE TABLE "new_Job" (
    "job_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "regularuser_id" INTEGER,
    "salary_min" REAL NOT NULL,
    "salary_max" REAL NOT NULL,
    "salary_avg" REAL NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "note" TEXT DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    CONSTRAINT "Job_regularuser_id_fkey" FOREIGN KEY ("regularuser_id") REFERENCES "RegularUser" ("user_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("business_id", "end_time", "job_id", "note", "position_id", "salary_avg", "salary_max", "salary_min", "start_time", "status", "updatedAt") SELECT "business_id", "end_time", "job_id", "note", "position_id", "salary_avg", "salary_max", "salary_min", "start_time", "status", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE TABLE "new_Negotiation" (
    "negotiation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interest_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "candidate_decision" TEXT,
    "business_decision" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest" ("interest_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("business_decision", "candidate_decision", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt") SELECT "business_decision", "candidate_decision", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
CREATE TABLE "new_RegularUser" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "postal_address" TEXT,
    "birthday" DATETIME NOT NULL,
    "biography" TEXT DEFAULT '',
    "avatar" TEXT DEFAULT '',
    "resume" TEXT,
    "last_active" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RegularUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegularUser" ("account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id") SELECT "account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id" FROM "RegularUser";
DROP TABLE "RegularUser";
ALTER TABLE "new_RegularUser" RENAME TO "RegularUser";
CREATE UNIQUE INDEX "RegularUser_account_id_key" ON "RegularUser"("account_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
