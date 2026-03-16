export type MeetingType = "weekly" | "sales" | "one_on_one" | "custom";

export type MeetingStatus = "draft" | "processing" | "completed";

export type Meeting = {
  id: string;
  title: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  scheduledAt: string;
  notes?: string;
  createdAt: string;
};

export type CreateMeetingInput = {
  title: string;
  meetingType: MeetingType;
  scheduledAt: string;
  notes?: string;
};
