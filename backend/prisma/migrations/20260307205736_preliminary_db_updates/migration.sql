-- CreateTable
CREATE TABLE "regularUser" (
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

-- CreateTable
CREATE TABLE "Business" (
    "business_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "resetToken" TEXT,
    "expiresAt" DATETIME,
    "owner_name" TEXT NOT NULL,
    "biography" TEXT,
    "avatar" TEXT,
    "phone_number" TEXT NOT NULL,
    "postal_address" TEXT NOT NULL,
    "location_lon" TEXT NOT NULL,
    "location_lat" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "PositionType" (
    "position_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT true,
    "num_qualified" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Qualification" (
    "qualification_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "document" TEXT NOT NULL,
    "position_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Qualification_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Qualification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "regularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "job_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "salary_min" INTEGER NOT NULL,
    "salary_max" INTEGER NOT NULL,
    "start_time" DATETIME,
    "end_time" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "note" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "PositionType" ("position_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business" ("business_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interest" (
    "interest_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_interest" BOOLEAN NOT NULL,
    "job_id" INTEGER NOT NULL,
    "business_interest" BOOLEAN NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "regularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "negotiation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interest_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "candidate_decision" TEXT,
    "business_decision" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest" ("interest_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "regularUser_email_key" ON "regularUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "regularUser_resetToken_key" ON "regularUser"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Business_resetToken_key" ON "Business"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
