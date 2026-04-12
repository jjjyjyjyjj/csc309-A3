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
    CONSTRAINT "Business_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("account_id", "avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified") SELECT "account_id", "avatar", "biography", "business_id", "location_lat", "location_lon", "owner_name", "phone_number", "postal_address", "verified" FROM "Business";
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
    "last_active" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RegularUser_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RegularUser" ("account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id") SELECT "account_id", "available", "avatar", "biography", "birthday", "first_name", "last_active", "last_name", "phone_number", "postal_address", "resume", "suspended", "user_id" FROM "RegularUser";
DROP TABLE "RegularUser";
ALTER TABLE "new_RegularUser" RENAME TO "RegularUser";
CREATE UNIQUE INDEX "RegularUser_account_id_key" ON "RegularUser"("account_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
