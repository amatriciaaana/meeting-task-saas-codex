-- CreateTable
CREATE TABLE "summaries" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "decisionsText" TEXT NOT NULL,
    "openQuestionsText" TEXT NOT NULL,
    "provider" VARCHAR(64) NOT NULL,
    "promptVersion" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "summaries_meetingId_key" ON "summaries"("meetingId");

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
