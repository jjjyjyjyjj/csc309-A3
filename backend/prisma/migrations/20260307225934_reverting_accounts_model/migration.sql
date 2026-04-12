/*
  Warnings:

  - You are about to drop the column `activated` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `activated` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `RegularUser` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `RegularUser` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `Business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `RegularUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "resetToken" TEXT,
    "expiresAt" DATETIME
);

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
    "location_lon" TEXT NOT NULL,
    "location_lat" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    CONSTRAINT "Business_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified") SELECT "avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_account_id_key" ON "Business"("account_id");
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
    "last_active" DATETIME NOT NULL,
    "available" BOOLEAN NOT NULL,
    "suspended" BOOLEAN NOT NULL,
    CONSTRAINT "RegularUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegularUser" ("available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id") SELECT "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id" FROM "RegularUser";
DROP TABLE "RegularUser";
ALTER TABLE "new_RegularUser" RENAME TO "RegularUser";
CREATE UNIQUE INDEX "RegularUser_account_id_key" ON "RegularUser"("account_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_resetToken_key" ON "Account"("resetToken");
