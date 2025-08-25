/*
  Warnings:

  - A unique constraint covering the columns `[worker_id,task_id]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "totalSubmissions" INTEGER NOT NULL DEFAULT 100;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_worker_id_task_id_key" ON "public"."Submission"("worker_id", "task_id");
