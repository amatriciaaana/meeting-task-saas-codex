import { describe, expect, it } from "vitest";
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword
} from "../apps/web/lib/password";

describe("password utilities", () => {
  it("hashes and verifies a valid password", async () => {
    const password = "StrongPassword9";
    const hash = await hashPassword(password);

    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPassword9", hash)).resolves.toBe(false);
  });

  it("rejects malformed hashes", async () => {
    await expect(verifyPassword("StrongPassword9", "bad-hash")).resolves.toBe(false);
  });

  it("enforces the password policy", () => {
    expect(validatePasswordPolicy("short")).toBe(
      "Password must be at least 12 characters."
    );
    expect(validatePasswordPolicy("alllowercase123")).toBe(
      "Password must include uppercase, lowercase, and a number."
    );
    expect(validatePasswordPolicy("ValidPassword9")).toBeNull();
  });
});
