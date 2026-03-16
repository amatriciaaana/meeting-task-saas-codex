import { randomUUID } from "crypto";
import {
  CreateMeetingInput,
  Meeting,
  MeetingStatus,
  MeetingType
} from "@meeting-task/types";
import { db } from "./db";

const allowedMeetingTypes = new Set<MeetingType>([
  "weekly",
  "sales",
  "one_on_one",
  "custom"
]);

const meetingIdPattern = /^mtg_[a-f0-9]{8}$/;

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function mapMeeting(record: {
  id: string;
  title: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  scheduledAt: Date;
  notes: string | null;
  createdAt: Date;
}): Meeting {
  return {
    id: record.id,
    title: record.title,
    meetingType: record.meetingType,
    status: record.status,
    scheduledAt: record.scheduledAt.toISOString(),
    notes: record.notes ?? undefined,
    createdAt: record.createdAt.toISOString()
  };
}

export function validateMeetingInput(input: Partial<CreateMeetingInput>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";

  if (!title || title.length > 100) {
    return {
      ok: false as const,
      error: "Title must be between 1 and 100 characters."
    };
  }

  if (!input.meetingType || !allowedMeetingTypes.has(input.meetingType)) {
    return {
      ok: false as const,
      error: "Meeting type is invalid."
    };
  }

  if (!input.scheduledAt || !isIsoDate(input.scheduledAt)) {
    return {
      ok: false as const,
      error: "Scheduled date must be a valid ISO date."
    };
  }

  if (notes.length > 2000) {
    return {
      ok: false as const,
      error: "Notes must be 2000 characters or fewer."
    };
  }

  return {
    ok: true as const,
    value: {
      title,
      meetingType: input.meetingType,
      scheduledAt: input.scheduledAt,
      notes: notes || undefined
    }
  };
}

export function isValidMeetingId(id: string) {
  return meetingIdPattern.test(id);
}

export async function listMeetings() {
  const meetings = await db.meeting.findMany({
    orderBy: {
      scheduledAt: "desc"
    }
  });

  return meetings.map(mapMeeting);
}

export async function createMeeting(input: CreateMeetingInput) {
  const meeting = await db.meeting.create({
    data: {
      id: `mtg_${randomUUID().slice(0, 8)}`,
      title: input.title,
      meetingType: input.meetingType,
      status: "draft",
      scheduledAt: new Date(input.scheduledAt),
      notes: input.notes
    }
  });

  return mapMeeting(meeting);
}

export async function getMeetingById(id: string) {
  const meeting = await db.meeting.findUnique({
    where: {
      id
    }
  });

  return meeting ? mapMeeting(meeting) : null;
}
