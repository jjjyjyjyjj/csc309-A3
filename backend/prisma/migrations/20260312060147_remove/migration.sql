/*
  Warnings:

  - You are about to drop the column `username` on the `Account` table. All the data in the column will be lost.

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
    "resetExpiresAt" DATETIME
);
INSERT INTO "new_Account" ("activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "role") SELECT "activated", "createdAt", "email", "id", "jwtExpiresAt", "jwtToken", "password", "resetExpiresAt", "resetToken", "role" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_jwtToken_key" ON "Account"("jwtToken");
CREATE UNIQUE INDEX "Account_resetToken_key" ON "Account"("resetToken");
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
    "available" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RegularUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegularUser" ("account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id") SELECT "account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id" FROM "RegularUser";
DROP TABLE "RegularUser";
ALTER TABLE "new_RegularUser" RENAME TO "RegularUser";
CREATE UNIQUE INDEX "RegularUser_account_id_key" ON "RegularUser"("account_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
