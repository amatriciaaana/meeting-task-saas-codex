import { DEFAULT_SUMMARY_PROMPT } from "@meeting-task/prompts";
import { MeetingJobPayload } from "@meeting-task/types";

export async function handleMeetingJob(payload: MeetingJobPayload) {
  return {
    meetingId: payload.meetingId,
    promptVersion: DEFAULT_SUMMARY_PROMPT.version,
    status: "queued" as const
  };
}
