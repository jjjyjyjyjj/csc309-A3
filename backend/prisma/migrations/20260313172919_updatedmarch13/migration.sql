/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `PositionType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[position_id,user_id]` on the table `Qualification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `business_id` to the `Negotiation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_id` to the `Negotiation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Negotiation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "jwtToken" TEXT,
    "jwtExpiresAt" DATETIME,
    "resetToken" TEXT,
    "resetExpiresAt" DATETIME,
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Account" ("activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "role") SELECT "activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "role" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_jwtToken_key" ON "Account"("jwtToken");
CREATE UNIQUE INDEX "Account_resetToken_key" ON "Account"("resetToken");
CREATE TABLE "new_Interest" (
    "interest_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_interest" BOOLEAN,
    "job_id" INTEGER NOT NULL,
    "business_interest" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interest" ("business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest") SELECT "business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest" FROM "Interest";
DROP TABLE "Interest";
ALTER TABLE "new_Interest" RENAME TO "Interest";
CREATE UNIQUE INDEX "Interest_job_id_user_id_key" ON "Interest"("job_id", "user_id");
CREATE TABLE "new_Negotiation" (
    "negotiation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interest_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "job_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "candidate_decision" TEXT,
    "business_decision" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest" ("interest_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business" ("business_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("business_decision", "candidate_decision", "createdAt", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt") SELECT "business_decision", "candidate_decision", "createdAt", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PositionType_name_key" ON "PositionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_position_id_user_id_key" ON "Qualification"("position_id", "user_id");
