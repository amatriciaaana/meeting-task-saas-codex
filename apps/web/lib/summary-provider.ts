import { DEFAULT_SUMMARY_PROMPT } from "@meeting-task/prompts";

export type SummaryProviderResult = {
  summaryText: string;
  decisionsText: string;
  openQuestionsText: string;
  provider: string;
  promptVersion: string;
};

function splitSentences(text: string) {
  return text
    .split(/(?<=[。.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function pickLinesByPattern(lines: string[], pattern: RegExp, fallback: string) {
  const matches = lines.filter((line) => pattern.test(line));
  return matches.length > 0 ? matches.slice(0, 5).join("\n") : fallback;
}

export async function generateSummaryFromTranscript(
  transcriptText: string
): Promise<SummaryProviderResult> {
  const lines = splitSentences(transcriptText);
  const summaryText =
    lines.slice(0, 4).join(" ") ||
    "Transcript was provided, but a concise summary could not be generated.";

  const decisionsText = pickLinesByPattern(
    lines,
    /(decid|決定|決まり|approved|agree)/i,
    "No explicit decisions detected."
  );

  const openQuestionsText = pickLinesByPattern(
    lines,
    /(question|確認|未決|follow up|TBD|todo)/i,
    "No open questions detected."
  );

  return {
    summaryText,
    decisionsText,
    openQuestionsText,
    provider: "local-heuristic",
    promptVersion: DEFAULT_SUMMARY_PROMPT.version
  };
}
