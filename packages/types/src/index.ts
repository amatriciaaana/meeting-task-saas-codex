export * from "./meeting";
export * from "./summary";
export * from "./transcript";
export * from "./user";

export type MeetingJobPayload = {
  meetingId: string;
  workspaceId: string;
  assetKey?: string;
  transcriptText?: string;
};

export type ExtractedTask = {
  title: string;
  assigneeName?: string;
  dueDate?: string;
  confidence: number;
};
