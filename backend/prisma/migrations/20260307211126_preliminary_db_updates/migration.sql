/*
  Warnings:

  - You are about to drop the `regularUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "regularUser_resetToken_key";

-- DropIndex
DROP INDEX "regularUser_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "regularUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RegularUser" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "resetToken" TEXT,
    "expiresAt" DATETIME,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "postal_address" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "biography" TEXT DEFAULT '',
    "avatar" TEXT DEFAULT '',
    "resume" TEXT,
    "last_active" DATETIME NOT NULL,
    "available" BOOLEAN NOT NULL,
    "suspended" BOOLEAN NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interest" (
    "interest_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_interest" BOOLEAN NOT NULL,
    "job_id" INTEGER NOT NULL,
    "business_interest" BOOLEAN NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Interest" ("business_interest", "interest_id", "job_id", "updatedAt", "user_id", "user_interest") SELECT "business_interest", "interest_id", "job_id", "updatedAt", "user_id", "user_interest" FROM "Interest";
DROP TABLE "Interest";
ALTER TABLE "new_Interest" RENAME TO "Interest";
CREATE TABLE "new_Negotiation" (
    "negotiation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interest_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "candidate_decision" TEXT,
    "business_decision" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest" ("interest_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("business_decision", "candidate_decision", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt") SELECT "business_decision", "candidate_decision", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
CREATE TABLE "new_Qualification" (
    "qualification_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "document" TEXT NOT NULL,
    "position_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Qualification_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Qualification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Qualification" ("document", "note", "position_id", "qualification_id", "status", "updatedAt", "user_id") SELECT "document", "note", "position_id", "qualification_id", "status", "updatedAt", "user_id" FROM "Qualification";
DROP TABLE "Qualification";
ALTER TABLE "new_Qualification" RENAME TO "Qualification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RegularUser_email_key" ON "RegularUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RegularUser_resetToken_key" ON "RegularUser"("resetToken");
