import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockCreateUser, mockListUsers } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockCreateUser: vi.fn(),
  mockListUsers: vi.fn()
}));

vi.mock("../apps/web/lib/auth", () => ({
  requireAdmin: mockRequireAdmin,
  listUsers: mockListUsers
}));

vi.mock("../apps/web/lib/users", async () => {
  const actual = await vi.importActual("../apps/web/lib/users");
  return {
    ...actual,
    createUser: mockCreateUser
  };
});

import { GET, POST } from "../apps/web/app/api/users/route";

describe("/api/users collection routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({
      id: "usr_admin",
      username: "admin.master",
      role: "admin"
    });
  });

  it("lists users for admins", async () => {
    mockListUsers.mockResolvedValueOnce([{ id: "usr_1", username: "general.alex" }]);

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      users: [{ id: "usr_1", username: "general.alex" }]
    });
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/users", {
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

  it("returns 400 for invalid profile data", async () => {
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "ab",
        displayName: "General Alex",
        email: "alex@example.com",
        role: "general",
        password: "ValidPassword9"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Username must be 3-50 chars and use letters, numbers, ., _, -."
    });
  });

  it("returns 400 when createUser fails", async () => {
    mockCreateUser.mockResolvedValueOnce({
      ok: false,
      error: "User could not be created. Username or email may already exist."
    });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "general.alex",
        displayName: "General Alex",
        email: "alex@example.com",
        role: "general",
        password: "ValidPassword9"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "User could not be created. Username or email may already exist."
    });
  });

  it("creates a user on valid input", async () => {
    mockCreateUser.mockResolvedValueOnce({
      ok: true,
      user: { id: "usr_2", username: "general.mina" }
    });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "general.mina",
        displayName: "General Mina",
        email: "mina@example.com",
        role: "general",
        password: "ValidPassword9"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      user: { id: "usr_2", username: "general.mina" }
    });
  });
});
