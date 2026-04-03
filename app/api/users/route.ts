import { NextRequest, NextResponse } from "next/server";
import { createManagedUser, getUsers } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export async function GET() {
  return NextResponse.json(await getUsers());
}

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as { name?: string; email?: string; password?: string; role?: "admin" | "pm" | "delivery" | "user"; mobile?: string };

  if (!payload.name || !payload.email || !payload.password || !payload.role) {
    return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
  }

  const result = await createManagedUser(role, payload as { name: string; email: string; password: string; role: "admin" | "pm" | "delivery" | "user"; mobile?: string });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to create user" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
