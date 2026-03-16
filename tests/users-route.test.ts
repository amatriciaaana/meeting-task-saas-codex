import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAdmin,
  mockDeleteUser,
  mockUpdateUser
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockUpdateUser: vi.fn()
}));

vi.mock("../apps/web/lib/auth", () => ({
  requireAdmin: mockRequireAdmin
}));

vi.mock("../apps/web/lib/users", async () => {
  const actual = await vi.importActual("../apps/web/lib/users");
  return {
    ...actual,
    deleteUser: mockDeleteUser,
    updateUser: mockUpdateUser
  };
});

import { DELETE, PATCH } from "../apps/web/app/api/users/[id]/route";

describe("/api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({
      id: "usr_admin",
      username: "admin.master",
      displayName: "Admin Master",
      email: "admin@example.com",
      role: "admin"
    });
  });

  it("prevents an admin from deleting their own account", async () => {
    const response = await DELETE(new Request("http://localhost/api/users/usr_admin"), {
      params: Promise.resolve({ id: "usr_admin" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "You cannot delete your own account."
    });
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it("prevents an admin from removing their own admin role", async () => {
    const request = new Request("http://localhost/api/users/usr_admin", {
      method: "PATCH",
      body: JSON.stringify({
        username: "admin.master",
        displayName: "Admin Master",
        email: "admin@example.com",
        role: "general"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "usr_admin" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "You cannot remove your own admin role."
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON in PATCH", async () => {
    const request = new Request("http://localhost/api/users/usr_general", {
      method: "PATCH",
      body: "{not-json",
      headers: { "Content-Type": "application/json" }
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "usr_general" })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON."
    });
  });
});
