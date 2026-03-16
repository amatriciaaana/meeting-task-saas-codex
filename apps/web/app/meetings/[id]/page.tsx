import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../../lib/auth";
import { getMeetingById } from "../../../lib/meetings-store";

const meetingTypeLabels = {
  weekly: "Weekly",
  sales: "Sales",
  one_on_one: "1 on 1",
  custom: "Custom"
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

type MeetingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MeetingDetailPage({
  params
}: MeetingDetailPageProps) {
  await requireUser();
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) {
    notFound();
  }

  return (
    <main className="page-shell meetings-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Meeting Detail</p>
          <h1>{meeting.title}</h1>
          <p className="muted-copy">
            会議作成後の詳細表示。次の実装で transcript と task をぶら下げる。
          </p>
        </div>
        <Link href="/meetings" className="ghost-button">
          Back to meetings
        </Link>
      </section>

      <section className="feature-card detail-grid">
        <article className="detail-card">
          <span className="detail-label">Meeting type</span>
          <strong>{meetingTypeLabels[meeting.meetingType]}</strong>
        </article>
        <article className="detail-card">
          <span className="detail-label">Status</span>
          <strong>{meeting.status}</strong>
        </article>
        <article className="detail-card">
          <span className="detail-label">Scheduled at</span>
          <strong>{formatDate(meeting.scheduledAt)}</strong>
        </article>
        <article className="detail-card">
          <span className="detail-label">Created at</span>
          <strong>{formatDate(meeting.createdAt)}</strong>
        </article>
      </section>

      <section className="feature-card detail-notes">
        <p className="eyebrow">Notes</p>
        <p>{meeting.notes || "No notes yet."}</p>
      </section>
    </main>
  );
}
