import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { resetPassword } from "../../../../../lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const result = await resetPassword(id, newPassword);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
