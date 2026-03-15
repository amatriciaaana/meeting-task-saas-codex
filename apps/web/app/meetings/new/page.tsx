import Link from "next/link";
import { MeetingForm } from "../../../components/meeting-form";
import { requireUser } from "../../../lib/auth";

export default async function NewMeetingPage() {
  await requireUser();
  return (
    <main className="page-shell meetings-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">New Meeting</p>
          <h1>会議の基本情報を作成する</h1>
          <p className="muted-copy">
            後続の transcript と summary は、この meeting レコードに紐づける。
          </p>
        </div>
        <Link href="/meetings" className="ghost-button">
          Back to meetings
        </Link>
      </section>
      <MeetingForm />
    </main>
  );
}
