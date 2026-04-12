/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Account` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
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
INSERT INTO "new_Account" ("activated", "createdAt", "email", "id", "password", "resetToken", "role", "username") SELECT "activated", "createdAt", "email", "id", "password", "resetToken", "role", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_jwtToken_key" ON "Account"("jwtToken");
CREATE UNIQUE INDEX "Account_resetToken_key" ON "Account"("resetToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
