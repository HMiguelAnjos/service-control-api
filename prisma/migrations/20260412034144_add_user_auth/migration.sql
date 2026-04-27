/*
  Warnings:

  - Added the required column `user_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `procedure_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "procedure_type" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "service" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_type" ADD CONSTRAINT "procedure_type_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
