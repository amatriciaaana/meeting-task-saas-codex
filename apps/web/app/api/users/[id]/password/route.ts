import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";
import { verifyPassword } from "../../../../../lib/password";
import { changePassword } from "../../../../../lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const actor = await requireUser();
  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!newPassword) {
    return NextResponse.json({ error: "New password is required." }, { status: 400 });
  }

  if (actor.id === id) {
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const user = await db.user.findUnique({ where: { id } });

    if (!user || !currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
  } else {
    await requireAdmin();
  }

  const result = await changePassword(id, newPassword, false);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
