/*
  Warnings:

  - You are about to alter the column `pending_amount` on the `Worker` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `locked_amount` on the `Worker` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Changed the type of `amount` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Submission" DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Worker" ALTER COLUMN "pending_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "locked_amount" SET DATA TYPE INTEGER;
