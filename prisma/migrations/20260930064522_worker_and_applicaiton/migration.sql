-- CreateEnum
CREATE TYPE "WorkerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkerType" AS ENUM ('PLUMBER', 'ELECTRICIAN');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "workerId" TEXT;

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "workerType" "WorkerType" NOT NULL,
    "businessName" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "experience" INTEGER,
    "description" TEXT,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_applications" (
    "id" TEXT NOT NULL,
    "workerType" "WorkerType" NOT NULL,
    "businessName" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "experience" INTEGER,
    "description" TEXT,
    "status" "WorkerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "reviewedById" TEXT,

    CONSTRAINT "worker_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workers_userId_key" ON "workers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workers_districtId_key" ON "workers"("districtId");

-- CreateIndex
CREATE INDEX "workers_districtId_idx" ON "workers"("districtId");

-- CreateIndex
CREATE INDEX "workers_workerType_idx" ON "workers"("workerType");

-- CreateIndex
CREATE INDEX "workers_status_idx" ON "workers"("status");

-- CreateIndex
CREATE INDEX "workers_deletedAt_idx" ON "workers"("deletedAt");

-- CreateIndex
CREATE INDEX "worker_applications_userId_idx" ON "worker_applications"("userId");

-- CreateIndex
CREATE INDEX "worker_applications_districtId_idx" ON "worker_applications"("districtId");

-- CreateIndex
CREATE INDEX "worker_applications_status_idx" ON "worker_applications"("status");

-- CreateIndex
CREATE INDEX "worker_applications_workerType_idx" ON "worker_applications"("workerType");

-- CreateIndex
CREATE INDEX "worker_applications_reviewedById_idx" ON "worker_applications"("reviewedById");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_applications" ADD CONSTRAINT "worker_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
