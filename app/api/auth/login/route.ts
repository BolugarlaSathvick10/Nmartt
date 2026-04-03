import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/server/in-memory-db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { email?: string; password?: string };
  if (!payload.email || !payload.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const result = await loginUser(payload.email, payload.password);
  if (!result.ok) {
    const status = result.error === "Account is blocked" ? 403 : 401;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result);
}
