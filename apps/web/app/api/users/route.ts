import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { createUser, validateUserProfileInput } from "../../../lib/users";

export async function GET() {
  await requireAdmin();
  const { listUsers } = await import("../../../lib/auth");
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request: Request) {
  await requireAdmin();
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

  const password = typeof body.password === "string" ? body.password : "";

  const result = await createUser({
    username: validation.value.username,
    displayName: validation.value.displayName,
    email: validation.value.email,
    role: validation.value.role ?? "general",
    password
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}
