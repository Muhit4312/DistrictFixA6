/*
  Warnings:

  - You are about to drop the column `description` on the `workers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "worker_applications" ALTER COLUMN "experience" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "workers" DROP COLUMN "description",
ADD COLUMN     "bio" TEXT,
ALTER COLUMN "experience" SET DATA TYPE TEXT;
