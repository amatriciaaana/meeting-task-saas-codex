import { requireUser } from "../../lib/auth";
import { ProfileManager } from "../../components/profile-manager";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <main className="page-shell meetings-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user.displayName}</h1>
          <p className="muted-copy">一般ユーザーは自分の情報修正とパスワード変更のみ可能。</p>
        </div>
      </section>
      <ProfileManager user={user} />
    </main>
  );
}
