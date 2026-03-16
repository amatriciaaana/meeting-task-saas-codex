import { describe, expect, it } from "vitest";
import {
  isValidMeetingId,
  validateMeetingInput
} from "../apps/web/lib/meetings-store";

describe("validateMeetingInput", () => {
  it("accepts a valid meeting payload", () => {
    const result = validateMeetingInput({
      title: "Weekly Product Sync",
      meetingType: "weekly",
      scheduledAt: "2026-03-15T10:00:00.000Z",
      notes: "Agenda"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Weekly Product Sync");
      expect(result.value.notes).toBe("Agenda");
    }
  });

  it("rejects invalid titles", () => {
    const result = validateMeetingInput({
      title: "",
      meetingType: "weekly",
      scheduledAt: "2026-03-15T10:00:00.000Z"
    });

    expect(result).toEqual({
      ok: false,
      error: "Title must be between 1 and 100 characters."
    });
  });

  it("rejects invalid meeting types", () => {
    const result = validateMeetingInput({
      title: "Weekly Product Sync",
      meetingType: "bad-type" as never,
      scheduledAt: "2026-03-15T10:00:00.000Z"
    });

    expect(result).toEqual({
      ok: false,
      error: "Meeting type is invalid."
    });
  });

  it("rejects invalid dates", () => {
    const result = validateMeetingInput({
      title: "Weekly Product Sync",
      meetingType: "weekly",
      scheduledAt: "not-a-date"
    });

    expect(result).toEqual({
      ok: false,
      error: "Scheduled date must be a valid ISO date."
    });
  });
});

describe("isValidMeetingId", () => {
  it("accepts the generated meeting id format", () => {
    expect(isValidMeetingId("mtg_deadbeef")).toBe(true);
  });

  it("rejects unexpected meeting ids", () => {
    expect(isValidMeetingId("meeting-1")).toBe(false);
    expect(isValidMeetingId("mtg_DEADBEEF")).toBe(false);
  });
});
