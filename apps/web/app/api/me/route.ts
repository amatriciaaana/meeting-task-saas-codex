import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { updateUser, validateUserProfileInput } from "../../../lib/users";

export async function PATCH(request: Request) {
  const currentUser = await requireUser();
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateUserProfileInput({
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    email: typeof body.email === "string" ? body.email : ""
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = await updateUser(currentUser.id, {
    displayName: validation.value.displayName,
    email: validation.value.email
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ user: result.user });
}
