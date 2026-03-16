import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { LoginForm } from "../../components/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/meetings");
  }

  return (
    <main className="page-shell meetings-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Login</p>
          <h1>アプリにサインインする</h1>
          <p className="muted-copy">
            5 回連続で失敗するとアカウントはロックされ、管理者の解除が必要になる。
          </p>
        </div>
      </section>
      <LoginForm />
    </main>
  );
}
