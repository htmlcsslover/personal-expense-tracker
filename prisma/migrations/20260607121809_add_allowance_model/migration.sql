/*
  Warnings:

  - You are about to drop the column `allowances` on the `IncomeProfile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Allowance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "incomeProfileId" TEXT NOT NULL,
    CONSTRAINT "Allowance_incomeProfileId_fkey" FOREIGN KEY ("incomeProfileId") REFERENCES "IncomeProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IncomeProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "basicPay" REAL NOT NULL DEFAULT 0,
    "nightDiff" REAL NOT NULL DEFAULT 0,
    "sss" REAL NOT NULL DEFAULT 0,
    "pagibig" REAL NOT NULL DEFAULT 0,
    "philhealth" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_IncomeProfile" ("basicPay", "id", "nightDiff", "pagibig", "philhealth", "sss", "tax", "updatedAt") SELECT "basicPay", "id", "nightDiff", "pagibig", "philhealth", "sss", "tax", "updatedAt" FROM "IncomeProfile";
DROP TABLE "IncomeProfile";
ALTER TABLE "new_IncomeProfile" RENAME TO "IncomeProfile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
