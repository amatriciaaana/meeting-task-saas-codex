import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFindUnique, mockUpdate, mockVerifyPassword } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockVerifyPassword: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

vi.mock("../apps/web/lib/db", () => ({
  db: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

vi.mock("../apps/web/lib/password", async () => {
  const actual = await vi.importActual("../apps/web/lib/password");
  return {
    ...actual,
    verifyPassword: mockVerifyPassword
  };
});

import { authenticateUser } from "../apps/web/lib/auth";

describe("authenticateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a generic error for unknown users", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    await expect(authenticateUser("missing.user", "SecretPass9")).resolves.toEqual({
      ok: false,
      error: "Invalid username or password."
    });
  });

  it("rejects locked users before checking the password", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_1",
      username: "locked.user",
      passwordHash: "hash",
      failedLoginCount: 5,
      lockedAt: new Date(),
      role: "general",
      displayName: "Locked User",
      email: "locked@example.com",
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await expect(authenticateUser("locked.user", "SecretPass9")).resolves.toEqual({
      ok: false,
      error: "Account is locked. Ask an admin to unlock it."
    });
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });

  it("increments failed login count on a bad password", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_1",
      username: "general.alex",
      passwordHash: "hash",
      failedLoginCount: 2,
      lockedAt: null,
      role: "general",
      displayName: "General Alex",
      email: "alex@example.com",
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockVerifyPassword.mockResolvedValueOnce(false);

    await expect(authenticateUser("general.alex", "WrongPass9")).resolves.toEqual({
      ok: false,
      error: "Invalid username or password."
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "usr_1" },
      data: {
        failedLoginCount: 3,
        lockedAt: null
      }
    });
  });

  it("locks the account after the fifth failed attempt", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_1",
      username: "general.alex",
      passwordHash: "hash",
      failedLoginCount: 4,
      lockedAt: null,
      role: "general",
      displayName: "General Alex",
      email: "alex@example.com",
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockVerifyPassword.mockResolvedValueOnce(false);

    await expect(authenticateUser("general.alex", "WrongPass9")).resolves.toEqual({
      ok: false,
      error: "Account locked after 5 failed attempts."
    });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate.mock.calls[0]?.[0].data.failedLoginCount).toBe(5);
    expect(mockUpdate.mock.calls[0]?.[0].data.lockedAt).toBeInstanceOf(Date);
  });

  it("clears the failed count on successful login", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "usr_1",
      username: "admin.master",
      passwordHash: "hash",
      failedLoginCount: 3,
      lockedAt: null,
      role: "admin",
      displayName: "Admin Master",
      email: "admin@example.com",
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockVerifyPassword.mockResolvedValueOnce(true);

    await expect(authenticateUser("admin.master", "StrongPassword9")).resolves.toEqual({
      ok: true,
      userId: "usr_1"
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "usr_1" },
      data: {
        failedLoginCount: 0,
        lockedAt: null
      }
    });
  });
});
