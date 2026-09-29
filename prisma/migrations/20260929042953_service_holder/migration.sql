-- CreateEnum
CREATE TYPE "ServiceHolderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "serviceHolderId" TEXT;

-- CreateTable
CREATE TABLE "service_holder_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "ServiceHolderStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "service_holder_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_holder_users_userId_key" ON "service_holder_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "service_holder_users_districtId_key" ON "service_holder_users"("districtId");

-- CreateIndex
CREATE INDEX "service_holder_users_status_idx" ON "service_holder_users"("status");

-- CreateIndex
CREATE INDEX "service_holder_users_deletedAt_idx" ON "service_holder_users"("deletedAt");

-- AddForeignKey
ALTER TABLE "service_holder_users" ADD CONSTRAINT "service_holder_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_holder_users" ADD CONSTRAINT "service_holder_users_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_serviceHolderId_fkey" FOREIGN KEY ("serviceHolderId") REFERENCES "service_holder_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
