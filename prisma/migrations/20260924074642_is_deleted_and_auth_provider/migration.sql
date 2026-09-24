-- CreateEnum
CREATE TYPE "authProvider" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "authProvider" NOT NULL DEFAULT 'CREDENTIALS',
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
