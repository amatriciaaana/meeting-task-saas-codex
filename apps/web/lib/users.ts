import { randomUUID } from "crypto";
import type {
  AppUser,
  CreateUserInput,
  UpdateUserInput,
  UserRole
} from "@meeting-task/types";
import { db } from "./db";
import { hashPassword, validatePasswordPolicy } from "./password";

const usernamePattern = /^[a-zA-Z0-9_.-]{3,50}$/;

function mapUser(user: {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  failedLoginCount: number;
  lockedAt: Date | null;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AppUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    failedLoginCount: user.failedLoginCount,
    lockedAt: user.lockedAt?.toISOString(),
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function validateUserProfileInput(input: {
  username?: string;
  displayName?: string;
  email?: string;
  role?: string;
}) {
  const username = input.username?.trim() ?? "";
  const displayName = input.displayName?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const role = input.role as UserRole | undefined;

  if (input.username !== undefined && !usernamePattern.test(username)) {
    return { ok: false as const, error: "Username must be 3-50 chars and use letters, numbers, ., _, -." };
  }

  if (!displayName || displayName.length > 100) {
    return { ok: false as const, error: "Display name must be between 1 and 100 characters." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Email is invalid." };
  }

  if (input.role !== undefined && role !== "admin" && role !== "general") {
    return { ok: false as const, error: "Role is invalid." };
  }

  return {
    ok: true as const,
    value: {
      username,
      displayName,
      email,
      role
    }
  };
}

export async function createUser(input: CreateUserInput) {
  const validation = validateUserProfileInput(input);
  if (!validation.ok) {
    return validation;
  }
  const passwordError = validatePasswordPolicy(input.password);
  if (passwordError) {
    return { ok: false as const, error: passwordError };
  }

  try {
    const user = await db.user.create({
      data: {
        id: `usr_${randomUUID().slice(0, 8)}`,
        username: validation.value.username,
        displayName: validation.value.displayName,
        email: validation.value.email,
        role: validation.value.role ?? "general",
        passwordHash: await hashPassword(input.password),
        mustChangePassword: false
      }
    });
    return { ok: true as const, user: mapUser(user) };
  } catch {
    return { ok: false as const, error: "User could not be created. Username or email may already exist." };
  }
}

export async function updateUser(userId: string, input: UpdateUserInput & { username?: string }) {
  const validation = validateUserProfileInput(input);
  if (!validation.ok) {
    return validation;
  }

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        username: validation.value.username || undefined,
        displayName: validation.value.displayName,
        email: validation.value.email,
        role: validation.value.role
      }
    });
    return { ok: true as const, user: mapUser(user) };
  } catch {
    return { ok: false as const, error: "User could not be updated." };
  }
}

export async function deleteUser(userId: string) {
  await db.user.delete({ where: { id: userId } });
}

export async function changePassword(userId: string, newPassword: string, mustChangePassword = false) {
  const passwordError = validatePasswordPolicy(newPassword);
  if (passwordError) {
    return { ok: false as const, error: passwordError };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(newPassword),
      failedLoginCount: 0,
      lockedAt: null,
      mustChangePassword
    }
  });

  return { ok: true as const };
}

export async function unlockUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedAt: null
    }
  });
}

export async function resetPassword(userId: string, newPassword: string) {
  return changePassword(userId, newPassword, true);
}
