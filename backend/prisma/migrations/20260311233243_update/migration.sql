-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interest" (
    "interest_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "user_interest" BOOLEAN,
    "job_id" INTEGER NOT NULL,
    "business_interest" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "RegularUser" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interest_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job" ("job_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interest" ("business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest") SELECT "business_interest", "createdAt", "interest_id", "job_id", "updatedAt", "user_id", "user_interest" FROM "Interest";
DROP TABLE "Interest";
ALTER TABLE "new_Interest" RENAME TO "Interest";
CREATE UNIQUE INDEX "Interest_job_id_user_id_key" ON "Interest"("job_id", "user_id");
CREATE TABLE "new_Negotiation" (
    "negotiation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interest_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "candidate_decision" TEXT,
    "business_decision" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "Interest" ("interest_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Negotiation" ("business_decision", "candidate_decision", "createdAt", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt") SELECT "business_decision", "candidate_decision", "createdAt", "expiresAt", "interest_id", "negotiation_id", "status", "updatedAt" FROM "Negotiation";
DROP TABLE "Negotiation";
ALTER TABLE "new_Negotiation" RENAME TO "Negotiation";
CREATE UNIQUE INDEX "Negotiation_interest_id_key" ON "Negotiation"("interest_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
