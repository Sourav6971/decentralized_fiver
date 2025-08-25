/*
  Warnings:

  - Changed the type of `pending_amount` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `locked_amount` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Worker" DROP COLUMN "pending_amount",
ADD COLUMN     "pending_amount" DECIMAL(65,30) NOT NULL,
DROP COLUMN "locked_amount",
ADD COLUMN     "locked_amount" DECIMAL(65,30) NOT NULL;
