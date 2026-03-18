import { NextResponse } from "next/server";
import { getMeetingById, isValidMeetingId } from "../../../../../lib/meetings-store";
import {
  getTranscriptByMeetingId,
  saveTranscript,
  validateTranscriptInput
} from "../../../../../lib/transcripts";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;

  if (!isValidMeetingId(id)) {
    return NextResponse.json({ error: "Meeting id is invalid." }, { status: 400 });
  }

  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  const transcript = await getTranscriptByMeetingId(id);
  return NextResponse.json({ transcript });
}

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;

  if (!isValidMeetingId(id)) {
    return NextResponse.json({ error: "Meeting id is invalid." }, { status: 400 });
  }

  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateTranscriptInput({
    rawText: typeof body.rawText === "string" ? body.rawText : ""
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const transcript = await saveTranscript(id, validation.value);
  return NextResponse.json({ transcript });
}
