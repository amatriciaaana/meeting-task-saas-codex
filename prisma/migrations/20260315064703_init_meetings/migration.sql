-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('weekly', 'sales', 'one_on_one', 'custom');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('draft', 'processing', 'completed');

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "meetingType" "MeetingType" NOT NULL,
    "status" "MeetingStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "meetings"("scheduledAt" DESC);
