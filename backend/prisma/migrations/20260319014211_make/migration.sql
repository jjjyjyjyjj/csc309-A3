-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Qualification" (
    "qualification_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "note" TEXT NOT NULL DEFAULT '',
    "document" TEXT,
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
