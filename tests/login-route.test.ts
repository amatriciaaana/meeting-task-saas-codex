import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuthenticateUser, mockCreateSession, mockGetCurrentUser } = vi.hoisted(() => ({
  mockAuthenticateUser: vi.fn(),
  mockCreateSession: vi.fn(),
  mockGetCurrentUser: vi.fn()
}));

vi.mock("../apps/web/lib/auth", () => ({
  authenticateUser: mockAuthenticateUser,
  createSession: mockCreateSession,
  getCurrentUser: mockGetCurrentUser
}));

import { POST } from "../apps/web/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/auth/login", {
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

  it("returns 400 when username or password is missing", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "", password: "" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Username and password are required."
    });
  });

  it("returns 401 when authentication fails", async () => {
    mockAuthenticateUser.mockResolvedValueOnce({
      ok: false,
      error: "Invalid username or password."
    });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin.master", password: "bad" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid username or password."
    });
  });

  it("creates a session and returns the current user on success", async () => {
    mockAuthenticateUser.mockResolvedValueOnce({
      ok: true,
      userId: "usr_1"
    });
    mockGetCurrentUser.mockResolvedValueOnce({
      id: "usr_1",
      username: "admin.master",
      displayName: "Admin Master",
      email: "admin@example.com",
      role: "admin"
    });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin.master", password: "StrongPassword9" }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);

    expect(mockCreateSession).toHaveBeenCalledWith("usr_1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: {
        id: "usr_1",
        username: "admin.master",
        displayName: "Admin Master",
        email: "admin@example.com",
        role: "admin"
      }
    });
  });
});
