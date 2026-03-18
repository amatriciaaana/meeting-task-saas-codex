"use client";

import { useState } from "react";
import type { Transcript } from "@meeting-task/types";

type TranscriptEditorProps = {
  meetingId: string;
  initialTranscript: Transcript | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function TranscriptEditor({
  meetingId,
  initialTranscript
}: TranscriptEditorProps) {
  const [rawText, setRawText] = useState(initialTranscript?.rawText ?? "");
  const [savedTranscript, setSavedTranscript] = useState<Transcript | null>(initialTranscript);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError("");
    setMessage("");
    setIsSaving(true);

    const response = await fetch(`/api/meetings/${meetingId}/transcript`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rawText })
    });

    const payload = (await response.json()) as {
      error?: string;
      transcript?: Transcript;
    };

    if (!response.ok || !payload.transcript) {
      setError(payload.error ?? "Transcript could not be saved.");
      setIsSaving(false);
      return;
    }

    setSavedTranscript(payload.transcript);
    setMessage("Transcript saved.");
    setIsSaving(false);
  }

  return (
    <section className="feature-card meeting-form">
      <div className="section-head">
        <div>
          <p className="eyebrow">Transcript</p>
          <h2>議事録テキスト</h2>
        </div>
        <span className="muted-copy">
          {savedTranscript
            ? `Updated ${formatDate(savedTranscript.updatedAt)}`
            : "No transcript yet."}
        </span>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Transcript text</span>
          <textarea
            rows={16}
            maxLength={20000}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="Paste or write the meeting transcript here"
          />
        </label>
      </div>
      <div className="transcript-meta">
        <span>{rawText.length} / 20000</span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}
      <div className="form-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save transcript"}
        </button>
      </div>
    </section>
  );
}
