import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/auth";
import { unlockUser } from "../../../../../lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  await unlockUser(id);
  return NextResponse.json({ ok: true });
}
