"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppUser } from "@meeting-task/types";

type AuthShellProps = {
  user: AppUser | null;
};

export function AuthShell({ user }: AuthShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="app-nav">
      <Link href="/" className="brand-link">
        Meeting Task SaaS
      </Link>
      <nav className="nav-links">
        {user ? (
          <>
            <Link href="/meetings">Meetings</Link>
            <Link href="/profile">Profile</Link>
            {user.role === "admin" ? <Link href="/users">Users</Link> : null}
            <button type="button" className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="primary-button">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
