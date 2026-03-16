import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { changePassword } from "../../../../lib/users";
import { verifyPassword } from "../../../../lib/password";

export async function POST(request: Request) {
  const currentUser = await requireUser();
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: currentUser.id } });

  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const result = await changePassword(currentUser.id, newPassword, false);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
