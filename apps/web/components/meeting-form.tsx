"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { MeetingType } from "@meeting-task/types";

const meetingTypes: Array<{ label: string; value: MeetingType }> = [
  { label: "Weekly", value: "weekly" },
  { label: "Sales", value: "sales" },
  { label: "1 on 1", value: "one_on_one" },
  { label: "Custom", value: "custom" }
];

function toIsoDateTime(localDateTime: string) {
  const date = new Date(localDateTime);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function MeetingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("weekly");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        meetingType,
        scheduledAt: toIsoDateTime(scheduledAt),
        notes
      })
    });

    const payload = (await response.json()) as {
      error?: string;
      meeting?: { id: string };
    };

    if (!response.ok || !payload.meeting) {
      setError(payload.error ?? "Meeting could not be created.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/meetings/${payload.meeting.id}`);
    router.refresh();
  }

  return (
    <form className="feature-card meeting-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Weekly Product Sync"
          />
        </label>
        <label className="field">
          <span>Meeting type</span>
          <select
            value={meetingType}
            onChange={(event) => setMeetingType(event.target.value as MeetingType)}
          >
            {meetingTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Scheduled at</span>
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea
            rows={6}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Agenda, attendees, or pre-read context"
          />
        </label>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button type="button" className="ghost-button" onClick={() => router.push("/meetings")}>
          Cancel
        </button>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create meeting"}
        </button>
      </div>
    </form>
  );
}
