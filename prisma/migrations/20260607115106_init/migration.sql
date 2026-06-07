-- CreateTable
CREATE TABLE "IncomeProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "basicPay" REAL NOT NULL DEFAULT 0,
    "allowances" REAL NOT NULL DEFAULT 0,
    "nightDiff" REAL NOT NULL DEFAULT 0,
    "sss" REAL NOT NULL DEFAULT 0,
    "pagibig" REAL NOT NULL DEFAULT 0,
    "philhealth" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
