import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { deleteUser, updateUser, validateUserProfileInput } from "../../../../lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const admin = await requireAdmin();
  const { id } = await context.params;

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateUserProfileInput({
    username: typeof body.username === "string" ? body.username : "",
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    email: typeof body.email === "string" ? body.email : "",
    role: typeof body.role === "string" ? body.role : ""
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (id === admin.id && validation.value.role === "general") {
    return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
  }

  const result = await updateUser(id, {
    username: validation.value.username,
    displayName: validation.value.displayName,
    email: validation.value.email,
    role: validation.value.role
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user });
}

export async function DELETE(_: Request, context: Context) {
  const admin = await requireAdmin();
  const { id } = await context.params;

  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
