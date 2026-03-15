import { requireAdmin, listUsers } from "../../lib/auth";
import { UsersAdmin } from "../../components/users-admin";

export default async function UsersPage() {
  const currentUser = await requireAdmin();
  const users = await listUsers();

  return (
    <main className="page-shell meetings-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">User Management</p>
          <h1>管理者ユーザー管理</h1>
          <p className="muted-copy">
            管理者のみ、作成・修正・削除・他者パスワード変更・初期化・ロック解除が可能。
          </p>
        </div>
      </section>
      <UsersAdmin currentUser={currentUser} initialUsers={users} />
    </main>
  );
}
