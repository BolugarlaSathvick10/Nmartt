import { NextRequest, NextResponse } from "next/server";
import { setUserAccess } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as { blocked?: boolean };

  if (typeof payload.blocked !== "boolean") {
    return NextResponse.json({ error: "Invalid access payload" }, { status: 400 });
  }

  const result = await setUserAccess(role, params.id, payload.blocked);
  if (!result.ok) {
    const status = result.error === "User not found" ? 404 : 403;
    return NextResponse.json({ error: result.error ?? "Failed to update access" }, { status });
  }

  return NextResponse.json({ ok: true, user: result.user });
}