import { NextRequest, NextResponse } from "next/server";
import { signupUser } from "@/lib/server/in-memory-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { name?: string; email?: string; password?: string; mobile?: string };
  if (!payload.name || !payload.email || !payload.password) {
    return NextResponse.json({ error: "Invalid signup payload" }, { status: 400 });
  }

  const result = await signupUser(payload.name, payload.email, payload.password, payload.mobile);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json(result);
}
