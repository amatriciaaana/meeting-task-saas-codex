import { NextResponse } from "next/server";
import { getMeetingById, isValidMeetingId } from "../../../../lib/meetings-store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidMeetingId(id)) {
    return NextResponse.json(
      {
        error: "Meeting id is invalid."
      },
      {
        status: 400
      }
    );
  }

  const meeting = await getMeetingById(id);

  if (!meeting) {
    return NextResponse.json(
      {
        error: "Meeting not found."
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json({
    meeting
  });
}
