/*
  Warnings:

  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Expense";

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);
