import { randomUUID } from "crypto";
import type { MeetingSummary } from "@meeting-task/types";
import { db } from "./db";
import { isValidMeetingId } from "./meetings-store";
import { getTranscriptByMeetingId } from "./transcripts";
import { generateSummaryFromTranscript } from "./summary-provider";

function mapSummary(record: {
  id: string;
  meetingId: string;
  summaryText: string;
  decisionsText: string;
  openQuestionsText: string;
  provider: string;
  promptVersion: string;
  createdAt: Date;
  updatedAt: Date;
}): MeetingSummary {
  return {
    id: record.id,
    meetingId: record.meetingId,
    summaryText: record.summaryText,
    decisionsText: record.decisionsText,
    openQuestionsText: record.openQuestionsText,
    provider: record.provider,
    promptVersion: record.promptVersion,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function getSummaryByMeetingId(meetingId: string) {
  if (!isValidMeetingId(meetingId)) {
    return null;
  }

  const summary = await db.summary.findUnique({
    where: {
      meetingId
    }
  });

  return summary ? mapSummary(summary) : null;
}

export async function generateAndSaveSummary(meetingId: string) {
  if (!isValidMeetingId(meetingId)) {
    throw new Error("Invalid meeting id.");
  }

  const transcript = await getTranscriptByMeetingId(meetingId);

  if (!transcript?.rawText.trim()) {
    throw new Error("Transcript is required before generating a summary.");
  }

  const generated = await generateSummaryFromTranscript(transcript.rawText);

  const summary = await db.summary.upsert({
    where: {
      meetingId
    },
    update: {
      summaryText: generated.summaryText,
      decisionsText: generated.decisionsText,
      openQuestionsText: generated.openQuestionsText,
      provider: generated.provider,
      promptVersion: generated.promptVersion
    },
    create: {
      id: `sum_${randomUUID().slice(0, 8)}`,
      meetingId,
      summaryText: generated.summaryText,
      decisionsText: generated.decisionsText,
      openQuestionsText: generated.openQuestionsText,
      provider: generated.provider,
      promptVersion: generated.promptVersion
    }
  });

  return mapSummary(summary);
}
