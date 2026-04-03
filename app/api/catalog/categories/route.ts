import { NextRequest, NextResponse } from "next/server";
import { createCategory } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as { name?: string; image?: string };

  if (!payload.name) {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  const result = await createCategory(role, payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to create category" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, category: result.category });
}