export type Transcript = {
  id: string;
  meetingId: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveTranscriptInput = {
  rawText: string;
};
