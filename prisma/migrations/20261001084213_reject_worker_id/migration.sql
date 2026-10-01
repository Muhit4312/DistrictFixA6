-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "rejectWorkerId" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_rejectWorkerId_fkey" FOREIGN KEY ("rejectWorkerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
