import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetMeetingById } = vi.hoisted(() => ({
  mockGetMeetingById: vi.fn()
}));

vi.mock("../apps/web/lib/meetings-store", async () => {
  const actual = await vi.importActual("../apps/web/lib/meetings-store");
  return {
    ...actual,
    getMeetingById: mockGetMeetingById
  };
});

import { GET } from "../apps/web/app/api/meetings/[id]/route";

describe("/api/meetings/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid meeting ids", async () => {
    const response = await GET(new Request("http://localhost/api/meetings/bad-id"), {
      params: Promise.resolve({ id: "bad-id" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Meeting id is invalid."
    });
  });

  it("returns 404 when a meeting does not exist", async () => {
    mockGetMeetingById.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/api/meetings/mtg_deadbeef"), {
      params: Promise.resolve({ id: "mtg_deadbeef" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Meeting not found."
    });
  });

  it("returns the meeting when it exists", async () => {
    mockGetMeetingById.mockResolvedValueOnce({
      id: "mtg_deadbeef",
      title: "Weekly Sync"
    });

    const response = await GET(new Request("http://localhost/api/meetings/mtg_deadbeef"), {
      params: Promise.resolve({ id: "mtg_deadbeef" })
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      meeting: {
        id: "mtg_deadbeef",
        title: "Weekly Sync"
      }
    });
  });
});
