"use client";

import type { AppUser } from "@meeting-task/types";
import { FormEvent, useState } from "react";

type ProfileManagerProps = {
  user: AppUser;
};

export function ProfileManager({ user }: ProfileManagerProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email })
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Profile update failed.");
      return;
    }

    setMessage("Profile updated.");
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");

    const response = await fetch("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setPasswordError(payload.error ?? "Password change failed.");
      return;
    }

    event.currentTarget.reset();
    setPasswordMessage("Password updated.");
  }

  return (
    <div className="two-column-grid">
      <form className="feature-card meeting-form" onSubmit={handleProfileSubmit}>
        <p className="eyebrow">Profile</p>
        <div className="form-grid">
          <label className="field">
            <span>Username</span>
            <input value={user.username} disabled />
          </label>
          <label className="field">
            <span>Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Role</span>
            <input value={user.role} disabled />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
        <div className="form-actions">
          <button type="submit" className="primary-button">
            Save profile
          </button>
        </div>
      </form>

      <form className="feature-card meeting-form" onSubmit={handlePasswordSubmit}>
        <p className="eyebrow">Password</p>
        <div className="form-grid">
          <label className="field">
            <span>Current password</span>
            <input name="currentPassword" type="password" />
          </label>
          <label className="field">
            <span>New password</span>
            <input name="newPassword" type="password" />
          </label>
        </div>
        {passwordError ? <p className="form-error">{passwordError}</p> : null}
        {passwordMessage ? <p className="form-success">{passwordMessage}</p> : null}
        <div className="form-actions">
          <button type="submit" className="primary-button">
            Change password
          </button>
        </div>
      </form>
    </div>
  );
}
