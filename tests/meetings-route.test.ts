import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockListMeetings, mockCreateMeeting } = vi.hoisted(() => ({
  mockListMeetings: vi.fn(),
  mockCreateMeeting: vi.fn()
}));

vi.mock("../apps/web/lib/meetings-store", async () => {
  const actual = await vi.importActual("../apps/web/lib/meetings-store");
  return {
    ...actual,
    listMeetings: mockListMeetings,
    createMeeting: mockCreateMeeting
  };
});

import { GET, POST } from "../apps/web/app/api/meetings/route";

describe("/api/meetings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists meetings", async () => {
    mockListMeetings.mockResolvedValueOnce([{ id: "mtg_12345678", title: "Sync" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      meetings: [{ id: "mtg_12345678", title: "Sync" }]
    });
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/meetings", {
      method: "POST",
      body: "{bad-json",
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON."
    });
  });

  it("returns 400 for invalid meeting payloads", async () => {
    const request = new Request("http://localhost/api/meetings", {
      method: "POST",
      body: JSON.stringify({
        title: "",
        meetingType: "weekly",
        scheduledAt: "2026-03-15T10:00:00.000Z"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title must be between 1 and 100 characters."
    });
  });

  it("creates a meeting for valid input", async () => {
    mockCreateMeeting.mockResolvedValueOnce({
      id: "mtg_12345678",
      title: "Weekly Sync"
    });

    const request = new Request("http://localhost/api/meetings", {
      method: "POST",
      body: JSON.stringify({
        title: "Weekly Sync",
        meetingType: "weekly",
        scheduledAt: "2026-03-15T10:00:00.000Z",
        notes: "Agenda"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      meeting: {
        id: "mtg_12345678",
        title: "Weekly Sync"
      }
    });
  });
});
