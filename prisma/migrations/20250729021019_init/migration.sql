/*
  Warnings:

  - The primary key for the `expense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `expense` table. All the data in the column will be lost.
  - The `id` column on the `expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `amount` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `service_id` to the `expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expense" DROP CONSTRAINT "expense_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "title",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "service_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "expense_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "procedure_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "procedure_id" INTEGER NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit_cost" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_product" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "service_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "total_profit" DECIMAL(65,30) NOT NULL,
    "margin_pct" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_product_id_key" ON "inventory"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "profit_service_id_key" ON "profit"("service_id");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedure_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_product" ADD CONSTRAINT "service_product_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_product" ADD CONSTRAINT "service_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit" ADD CONSTRAINT "profit_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
