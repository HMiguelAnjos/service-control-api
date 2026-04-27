/*
  Warnings:

  - Added the required column `updated_at` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `procedure_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `service_product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "procedure_type" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "profit" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "service" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "service_product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
