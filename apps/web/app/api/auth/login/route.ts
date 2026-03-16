import { NextResponse } from "next/server";
import { authenticateUser, createSession, getCurrentUser } from "../../../../lib/auth";

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const result = await authenticateUser(username, password);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await createSession(result.userId);
  const user = await getCurrentUser();

  return NextResponse.json({ user });
}
