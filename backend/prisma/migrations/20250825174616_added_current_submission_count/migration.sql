/*
  Warnings:

  - You are about to drop the column `totalSubmissions` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "totalSubmissions",
ADD COLUMN     "maxSubmissions" INTEGER NOT NULL DEFAULT 100;
