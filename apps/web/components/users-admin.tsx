"use client";

import type { AppUser, UserRole } from "@meeting-task/types";
import { FormEvent, useMemo, useState } from "react";

type UsersAdminProps = {
  currentUser: AppUser;
  initialUsers: AppUser[];
};

function generateTempPassword() {
  return `Temp${Math.random().toString(36).slice(2, 8)}9A!`;
}

export function UsersAdmin({ currentUser, initialUsers }: UsersAdminProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dialogUserId, setDialogUserId] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.username} ${user.displayName} ${user.email}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search, users]
  );

  async function refreshUsers() {
    const response = await fetch("/api/users");
    const payload = (await response.json()) as { users: AppUser[] };
    setUsers(payload.users);
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        role: formData.get("role"),
        password: formData.get("password")
      })
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "User creation failed.");
      return;
    }

    event.currentTarget.reset();
    await refreshUsers();
    setMessage("User created.");
  }

  async function handleUpdateUser(user: AppUser, formData: FormData) {
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        role: formData.get("role")
      })
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "User update failed.");
      return;
    }
    await refreshUsers();
    setMessage(`Updated ${user.username}.`);
  }

  async function handleDeleteUser(userId: string) {
    const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "User delete failed.");
      return;
    }
    await refreshUsers();
    setMessage("User deleted.");
  }

  async function handleUnlockUser(userId: string) {
    const response = await fetch(`/api/users/${userId}/unlock`, { method: "POST" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "User unlock failed.");
      return;
    }
    await refreshUsers();
    setMessage("User unlocked.");
  }

  async function handleResetPassword(userId: string) {
    const newPassword = generateTempPassword();
    const response = await fetch(`/api/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword })
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Password reset failed.");
      return;
    }
    setMessage(`Temporary password: ${newPassword}`);
    await refreshUsers();
  }

  async function handleAdminPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userId = String(formData.get("userId") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    const response = await fetch(`/api/users/${userId}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword })
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Password update failed.");
      return;
    }
    setMessage("Password updated.");
    setDialogUserId("");
    (document.getElementById("password-dialog") as HTMLDialogElement | null)?.close();
  }

  return (
    <div className="meetings-shell">
      <section className="feature-card meeting-form">
        <p className="eyebrow">Create User</p>
        <form className="form-grid" onSubmit={handleCreateUser}>
          <label className="field">
            <span>Username</span>
            <input name="username" />
          </label>
          <label className="field">
            <span>Display name</span>
            <input name="displayName" />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" defaultValue="general">
              <option value="general">general</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="field">
            <span>Initial password</span>
            <input name="password" type="password" />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              Create user
            </button>
          </div>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
      </section>

      <section className="feature-card meeting-form">
        <div className="section-head">
          <div>
            <p className="eyebrow">User Directory</p>
            <h2>管理者のみ操作可能</h2>
          </div>
          <input
            className="search-input"
            placeholder="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="user-list">
          {filteredUsers.map((user) => (
            <form
              key={user.id}
              className="user-card"
              onSubmit={(event) => {
                event.preventDefault();
                handleUpdateUser(user, new FormData(event.currentTarget));
              }}
            >
              <input type="hidden" name="userId" value={user.id} />
              <div className="form-grid compact-grid">
                <label className="field">
                  <span>Username</span>
                  <input name="username" defaultValue={user.username} />
                </label>
                <label className="field">
                  <span>Display name</span>
                  <input name="displayName" defaultValue={user.displayName} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input name="email" defaultValue={user.email} />
                </label>
                <label className="field">
                  <span>Role</span>
                  <select
                    name="role"
                    defaultValue={user.role}
                    disabled={user.id === currentUser.id}
                  >
                    <option value="general">general</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
              </div>
              <div className="meta-row">
                <span className={user.lockedAt ? "danger-chip" : "status-pill"}>
                  {user.lockedAt ? "locked" : user.role}
                </span>
                <span>failed login: {user.failedLoginCount}</span>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Save
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleUnlockUser(user.id)}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleResetPassword(user.id)}
                >
                  Reset password
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setDialogUserId(user.id);
                    (document.getElementById("password-dialog") as HTMLDialogElement | null)?.showModal();
                  }}
                >
                  Change password
                </button>
                <button
                  type="button"
                  className="danger-button"
                  disabled={user.id === currentUser.id}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <dialog id="password-dialog" className="password-dialog">
        <form className="feature-card meeting-form" method="dialog" onSubmit={handleAdminPasswordChange}>
          <p className="eyebrow">Admin Password Change</p>
          <label className="field">
            <span>User</span>
            <select
              name="userId"
              value={dialogUserId}
              onChange={(event) => setDialogUserId(event.target.value)}
            >
              <option value="">Select user</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.displayName})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>New password</span>
            <input name="newPassword" type="password" />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              Save password
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => (document.getElementById("password-dialog") as HTMLDialogElement | null)?.close()}
            >
              Close
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
