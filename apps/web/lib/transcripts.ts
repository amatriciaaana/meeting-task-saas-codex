import { randomUUID } from "crypto";
import type { SaveTranscriptInput, Transcript } from "@meeting-task/types";
import { db } from "./db";
import { isValidMeetingId } from "./meetings-store";

function mapTranscript(record: {
  id: string;
  meetingId: string;
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
}): Transcript {
  return {
    id: record.id,
    meetingId: record.meetingId,
    rawText: record.rawText,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function validateTranscriptInput(input: Partial<SaveTranscriptInput>) {
  const rawText = typeof input.rawText === "string" ? input.rawText.trim() : "";

  if (!rawText) {
    return {
      ok: false as const,
      error: "Transcript text is required."
    };
  }

  if (rawText.length > 20000) {
    return {
      ok: false as const,
      error: "Transcript must be 20000 characters or fewer."
    };
  }

  return {
    ok: true as const,
    value: {
      rawText
    }
  };
}

export async function getTranscriptByMeetingId(meetingId: string) {
  if (!isValidMeetingId(meetingId)) {
    return null;
  }

  const transcript = await db.transcript.findUnique({
    where: {
      meetingId
    }
  });

  return transcript ? mapTranscript(transcript) : null;
}

export async function saveTranscript(meetingId: string, input: SaveTranscriptInput) {
  if (!isValidMeetingId(meetingId)) {
    throw new Error("Invalid meeting id.");
  }

  const transcript = await db.transcript.upsert({
    where: {
      meetingId
    },
    update: {
      rawText: input.rawText
    },
    create: {
      id: `trn_${randomUUID().slice(0, 8)}`,
      meetingId,
      rawText: input.rawText
    }
  });

  return mapTranscript(transcript);
}
