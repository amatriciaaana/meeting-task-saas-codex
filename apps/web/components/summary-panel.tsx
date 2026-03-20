"use client";

import { useState } from "react";
import type { MeetingSummary } from "@meeting-task/types";

type SummaryPanelProps = {
  meetingId: string;
  initialSummary: MeetingSummary | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function SummaryPanel({ meetingId, initialSummary }: SummaryPanelProps) {
  const [summary, setSummary] = useState<MeetingSummary | null>(initialSummary);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setError("");
    setMessage("");
    setIsGenerating(true);

    const response = await fetch(`/api/meetings/${meetingId}/summary`, {
      method: "POST"
    });

    const payload = (await response.json()) as {
      error?: string;
      summary?: MeetingSummary;
    };

    if (!response.ok || !payload.summary) {
      setError(payload.error ?? "Summary could not be generated.");
      setIsGenerating(false);
      return;
    }

    setSummary(payload.summary);
    setMessage(summary ? "Summary regenerated." : "Summary generated.");
    setIsGenerating(false);
  }

  return (
    <section className="feature-card meeting-form">
      <div className="section-head">
        <div>
          <p className="eyebrow">Summary</p>
          <h2>会議要約</h2>
        </div>
        <span className="muted-copy">
          {summary ? `Updated ${formatDate(summary.updatedAt)}` : "No summary generated yet."}
        </span>
      </div>

      <div className="summary-grid">
        <article className="detail-card">
          <span className="detail-label">Summary</span>
          <p>{summary?.summaryText || "No summary generated yet."}</p>
        </article>
        <article className="detail-card">
          <span className="detail-label">Decisions</span>
          <p>{summary?.decisionsText || "No decisions generated yet."}</p>
        </article>
        <article className="detail-card">
          <span className="detail-label">Open questions</span>
          <p>{summary?.openQuestionsText || "No open questions generated yet."}</p>
        </article>
      </div>

      <div className="summary-meta">
        <span>
          {summary
            ? `${summary.provider} / prompt ${summary.promptVersion}`
            : "Provider not used yet."}
        </span>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-success">{message}</p> : null}
      <div className="form-actions">
        <button type="button" className="primary-button" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating
            ? "Generating..."
            : summary
              ? "Regenerate summary"
              : "Generate summary"}
        </button>
      </div>
    </section>
  );
}
