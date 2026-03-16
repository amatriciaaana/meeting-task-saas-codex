import Link from "next/link";
import { requireUser } from "../../lib/auth";
import { listMeetings } from "../../lib/meetings-store";

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

export default async function MeetingsPage() {
  await requireUser();
  const meetings = await listMeetings();

  return (
    <main className="page-shell meetings-shell">
      <section className="feature-card meetings-header">
        <div>
          <p className="eyebrow">Meetings</p>
          <h1>会議の下書きと流れをここから作る</h1>
          <p className="muted-copy">
            まずは会議を作成し、後から transcript、summary、tasks を接続する。
          </p>
        </div>
        <Link href="/meetings/new" className="primary-button">
          New Meeting
        </Link>
      </section>

      {meetings.length === 0 ? (
        <section className="feature-card empty-state">
          <h2>まだ会議はありません</h2>
          <p>最初の会議を作成して、MVP の導線を確認してください。</p>
        </section>
      ) : (
        <section className="meeting-grid">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="meeting-card"
            >
              <span className="status-pill">{meeting.status}</span>
              <h2>{meeting.title}</h2>
              <p>{meetingTypeLabels[meeting.meetingType]}</p>
              <p>{formatDate(meeting.scheduledAt)}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
