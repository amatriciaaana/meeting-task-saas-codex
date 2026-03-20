import { NextResponse } from "next/server";
import { getMeetingById, isValidMeetingId } from "../../../../../lib/meetings-store";
import { generateAndSaveSummary, getSummaryByMeetingId } from "../../../../../lib/summaries";

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

  const summary = await getSummaryByMeetingId(id);
  return NextResponse.json({ summary });
}

export async function POST(_: Request, context: Context) {
  const { id } = await context.params;

  if (!isValidMeetingId(id)) {
    return NextResponse.json({ error: "Meeting id is invalid." }, { status: 400 });
  }

  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  try {
    const summary = await generateAndSaveSummary(id);
    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Summary could not be generated.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
