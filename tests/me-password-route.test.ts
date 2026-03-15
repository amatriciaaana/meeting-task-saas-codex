import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireUser,
  mockFindUnique,
  mockVerifyPassword,
  mockChangePassword
} = vi.hoisted(() => ({
  mockRequireUser: vi.fn(),
  mockFindUnique: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockChangePassword: vi.fn()
}));

vi.mock("../apps/web/lib/auth", () => ({
  requireUser: mockRequireUser
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

vi.mock("../apps/web/lib/users", () => ({
  changePassword: mockChangePassword
}));

import { POST } from "../apps/web/app/api/me/password/route";

describe("POST /api/me/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUser.mockResolvedValue({
      id: "usr_general",
      username: "general.alex",
      role: "general"
    });
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/me/password", {
      method: "POST",
      body: "{bad-json",
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON."
    });
  });

  it("returns 400 when passwords are missing", async () => {
    const request = new Request("http://localhost/api/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "", newPassword: "" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Current and new password are required."
    });
  });

  it("returns 400 when current password is incorrect", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_general",
      passwordHash: "hash"
    });
    mockVerifyPassword.mockResolvedValueOnce(false);

    const request = new Request("http://localhost/api/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "bad", newPassword: "ValidPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Current password is incorrect."
    });
  });

  it("returns 400 when the new password is rejected", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_general",
      passwordHash: "hash"
    });
    mockVerifyPassword.mockResolvedValueOnce(true);
    mockChangePassword.mockResolvedValueOnce({
      ok: false,
      error: "Password must be at least 12 characters."
    });

    const request = new Request("http://localhost/api/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "short" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Password must be at least 12 characters."
    });
  });

  it("returns ok for a valid password change", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_general",
      passwordHash: "hash"
    });
    mockVerifyPassword.mockResolvedValueOnce(true);
    mockChangePassword.mockResolvedValueOnce({ ok: true });

    const request = new Request("http://localhost/api/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "ValidPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(mockChangePassword).toHaveBeenCalledWith("usr_general", "ValidPassword9", false);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
