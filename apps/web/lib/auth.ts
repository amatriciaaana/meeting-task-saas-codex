import { createHash, randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppUser } from "@meeting-task/types";
import { db } from "./db";
import { verifyPassword } from "./password";

const SESSION_COOKIE = "meeting_task_session";
const SESSION_AGE_SECONDS = 60 * 60 * 12;
const MAX_FAILED_LOGINS = 5;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapUser(user: {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: "admin" | "general";
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

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);

  await db.session.create({
    data: {
      id: randomUUID(),
      tokenHash,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashToken(token)
      }
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await db.session.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    cookieStore.delete(SESSION_COOKIE);
    if (session) {
      await db.session.delete({
        where: {
          id: session.id
        }
      });
    }
    return null;
  }

  return mapUser(session.user);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/profile");
  }
  return user;
}

export async function authenticateUser(username: string, password: string) {
  const user = await db.user.findUnique({
    where: {
      username
    }
  });

  if (!user) {
    return {
      ok: false as const,
      error: "Invalid username or password."
    };
  }

  if (user.lockedAt) {
    return {
      ok: false as const,
      error: "Account is locked. Ask an admin to unlock it."
    };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  if (!passwordOk) {
    const nextCount = user.failedLoginCount + 1;
    await db.user.update({
      where: {
        id: user.id
      },
      data: {
        failedLoginCount: nextCount,
        lockedAt: nextCount >= MAX_FAILED_LOGINS ? new Date() : null
      }
    });

    return {
      ok: false as const,
      error:
        nextCount >= MAX_FAILED_LOGINS
          ? "Account locked after 5 failed attempts."
          : "Invalid username or password."
    };
  }

  await db.user.update({
    where: {
      id: user.id
    },
    data: {
      failedLoginCount: 0,
      lockedAt: null
    }
  });

  return {
    ok: true as const,
    userId: user.id
  };
}

export async function listUsers() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }]
  });
  return users.map(mapUser);
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  return user ? mapUser(user) : null;
}
