import { describe, expect, it } from "vitest";
import { validateUserProfileInput } from "../apps/web/lib/users";

describe("validateUserProfileInput", () => {
  it("accepts a valid admin payload", () => {
    const result = validateUserProfileInput({
      username: "admin.master",
      displayName: "Admin Master",
      email: "admin@example.com",
      role: "admin"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.username).toBe("admin.master");
      expect(result.value.role).toBe("admin");
    }
  });

  it("rejects invalid usernames", () => {
    const result = validateUserProfileInput({
      username: "x",
      displayName: "Admin Master",
      email: "admin@example.com",
      role: "admin"
    });

    expect(result).toEqual({
      ok: false,
      error: "Username must be 3-50 chars and use letters, numbers, ., _, -."
    });
  });

  it("rejects invalid emails", () => {
    const result = validateUserProfileInput({
      username: "general.alex",
      displayName: "General Alex",
      email: "invalid-email",
      role: "general"
    });

    expect(result).toEqual({
      ok: false,
      error: "Email is invalid."
    });
  });

  it("rejects invalid roles", () => {
    const result = validateUserProfileInput({
      username: "general.alex",
      displayName: "General Alex",
      email: "alex@example.com",
      role: "owner"
    });

    expect(result).toEqual({
      ok: false,
      error: "Role is invalid."
    });
  });
});
