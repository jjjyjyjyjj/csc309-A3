/*
  Warnings:

  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegularUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Business_account_id_key";

-- DropIndex
DROP INDEX "RegularUser_account_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Business";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RegularUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "jwtToken" TEXT,
    "jwtExpiresAt" DATETIME,
    "resetToken" TEXT,
    "resetExpiresAt" DATETIME,
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT,
    "last_name" TEXT,
    "birthday" DATETIME,
    "resume" TEXT,
    "last_active" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "biography" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT DEFAULT '',
    "phone_number" TEXT,
    "postal_address" TEXT,
    "business_name" TEXT,
    "owner_name" TEXT,
    "location_lon" REAL,
    "location_lat" REAL,
    "verified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Account" ("activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "resetTokenUsed", "role", "username") SELECT "activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "resetTokenUsed", "role", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
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
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interest" ("business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest") SELECT "business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest" FROM "Interest";
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
    CONSTRAINT "Job_regularuser_id_fkey" FOREIGN KEY ("regularuser_id") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("business_id", "createdAt", "end_time", "job_id", "note", "position_id", "regularuser_id", "salary_avg", "salary_max", "salary_min", "start_time", "status", "updatedAt") SELECT "business_id", "createdAt", "end_time", "job_id", "note", "position_id", "regularuser_id", "salary_avg", "salary_max", "salary_min", "start_time", "status", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
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
    CONSTRAINT "Negotiation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Negotiation_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("business_decision", "business_id", "candidate_decision", "createdAt", "expiresAt", "interest_id", "job_id", "negotiation_id", "status", "updatedAt", "user_id") SELECT "business_decision", "business_id", "candidate_decision", "createdAt", "expiresAt", "interest_id", "job_id", "negotiation_id", "status", "updatedAt", "user_id" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
CREATE TABLE "new_Qualification" (
    "qualification_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "note" TEXT NOT NULL DEFAULT '',
    "document" TEXT NOT NULL,
    "position_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Qualification_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Qualification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Qualification" ("document", "note", "position_id", "qualification_id", "status", "updatedAt", "user_id") SELECT "document", "note", "position_id", "qualification_id", "status", "updatedAt", "user_id" FROM "Qualification";
DROP TABLE "Qualification";
ALTER TABLE "new_Qualification" RENAME TO "Qualification";
CREATE UNIQUE INDEX "Qualification_position_id_user_id_key" ON "Qualification"("position_id", "user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
