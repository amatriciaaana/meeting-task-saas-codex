import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockRequireUser, mockUnlockUser, mockResetPassword, mockChangePassword } =
  vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockRequireUser: vi.fn(),
    mockUnlockUser: vi.fn(),
    mockResetPassword: vi.fn(),
    mockChangePassword: vi.fn()
  }));

const { mockFindUnique, mockVerifyPassword } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockVerifyPassword: vi.fn()
}));

vi.mock("../apps/web/lib/auth", () => ({
  requireAdmin: mockRequireAdmin,
  requireUser: mockRequireUser
}));

vi.mock("../apps/web/lib/users", () => ({
  unlockUser: mockUnlockUser,
  resetPassword: mockResetPassword,
  changePassword: mockChangePassword
}));

vi.mock("../apps/web/lib/db", () => ({
  db: {
    user: {
      findUnique: mockFindUnique
    }
  }
}));

vi.mock("../apps/web/lib/password", () => ({
  verifyPassword: mockVerifyPassword
}));

import { POST as unlockPost } from "../apps/web/app/api/users/[id]/unlock/route";
import { POST as resetPost } from "../apps/web/app/api/users/[id]/reset-password/route";
import { POST as adminPasswordPost } from "../apps/web/app/api/users/[id]/password/route";

describe("admin user actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({
      id: "usr_admin",
      username: "admin.master",
      role: "admin"
    });
    mockRequireUser.mockResolvedValue({
      id: "usr_admin",
      username: "admin.master",
      role: "admin"
    });
  });

  it("unlocks a user", async () => {
    const response = await unlockPost(new Request("http://localhost/api/users/usr_1/unlock", { method: "POST" }), {
      params: Promise.resolve({ id: "usr_1" })
    });

    expect(mockUnlockUser).toHaveBeenCalledWith("usr_1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 400 for malformed JSON during password reset", async () => {
    const request = new Request("http://localhost/api/users/usr_1/reset-password", {
      method: "POST",
      body: "{bad-json",
      headers: { "Content-Type": "application/json" }
    });

    const response = await resetPost(request, {
      params: Promise.resolve({ id: "usr_1" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON."
    });
  });

  it("returns 400 when resetPassword rejects the password", async () => {
    mockResetPassword.mockResolvedValueOnce({
      ok: false,
      error: "Password must be at least 12 characters."
    });

    const request = new Request("http://localhost/api/users/usr_1/reset-password", {
      method: "POST",
      body: JSON.stringify({ newPassword: "short" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await resetPost(request, {
      params: Promise.resolve({ id: "usr_1" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Password must be at least 12 characters."
    });
  });

  it("resets a password successfully", async () => {
    mockResetPassword.mockResolvedValueOnce({ ok: true });

    const request = new Request("http://localhost/api/users/usr_1/reset-password", {
      method: "POST",
      body: JSON.stringify({ newPassword: "ValidPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await resetPost(request, {
      params: Promise.resolve({ id: "usr_1" })
    });

    expect(mockResetPassword).toHaveBeenCalledWith("usr_1", "ValidPassword9");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("allows an admin to change another user's password", async () => {
    mockChangePassword.mockResolvedValueOnce({ ok: true });

    const request = new Request("http://localhost/api/users/usr_2/password", {
      method: "POST",
      body: JSON.stringify({ newPassword: "ValidPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await adminPasswordPost(request, {
      params: Promise.resolve({ id: "usr_2" })
    });

    expect(mockChangePassword).toHaveBeenCalledWith("usr_2", "ValidPassword9", false);
    expect(response.status).toBe(200);
  });

  it("requires the current password when a user changes their own password through the admin route", async () => {
    mockRequireUser.mockResolvedValueOnce({
      id: "usr_admin",
      username: "admin.master",
      role: "admin"
    });
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_admin",
      passwordHash: "hash"
    });
    mockVerifyPassword.mockResolvedValueOnce(false);

    const request = new Request("http://localhost/api/users/usr_admin/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "bad", newPassword: "ValidPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await adminPasswordPost(request, {
      params: Promise.resolve({ id: "usr_admin" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Current password is incorrect."
    });
  });
});
