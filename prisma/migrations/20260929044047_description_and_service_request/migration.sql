/*
  Warnings:

  - Added the required column `description` to the `service_holder_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_holder_users" ADD COLUMN     "description" TEXT NOT NULL;
