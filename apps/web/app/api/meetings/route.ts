import { NextResponse } from "next/server";
import { createMeeting, listMeetings, validateMeetingInput } from "../../../lib/meetings-store";

export async function GET() {
  return NextResponse.json({
    meetings: await listMeetings()
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        error: "Request body must be valid JSON."
      },
      {
        status: 400
      }
    );
  }

  const validation = validateMeetingInput({
    title: typeof body.title === "string" ? body.title : "",
    meetingType: body.meetingType as
      | "weekly"
      | "sales"
      | "one_on_one"
      | "custom"
      | undefined,
    scheduledAt: typeof body.scheduledAt === "string" ? body.scheduledAt : "",
    notes: typeof body.notes === "string" ? body.notes : undefined
  });

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.error
      },
      {
        status: 400
      }
    );
  }

  const meeting = await createMeeting(validation.value);

  return NextResponse.json(
    {
      meeting
    },
    {
      status: 201
    }
  );
}
