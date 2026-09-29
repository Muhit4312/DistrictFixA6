/*
  Warnings:

  - You are about to drop the column `description` on the `service_holder_users` table. All the data in the column will be lost.
  - Added the required column `description` to the `service_holder_applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_holder_applications" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "service_holder_users" DROP COLUMN "description";
