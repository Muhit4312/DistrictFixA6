-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "service_holder_applications" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "service_holder_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_holder_applications_userId_idx" ON "service_holder_applications"("userId");

-- CreateIndex
CREATE INDEX "service_holder_applications_districtId_idx" ON "service_holder_applications"("districtId");

-- CreateIndex
CREATE INDEX "service_holder_applications_status_idx" ON "service_holder_applications"("status");

-- CreateIndex
CREATE INDEX "service_holder_applications_reviewedById_idx" ON "service_holder_applications"("reviewedById");

-- AddForeignKey
ALTER TABLE "service_holder_applications" ADD CONSTRAINT "service_holder_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_holder_applications" ADD CONSTRAINT "service_holder_applications_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_holder_applications" ADD CONSTRAINT "service_holder_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
