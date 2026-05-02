import { NextRequest, NextResponse } from "next/server";
import { toggleCoupon } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const role = getRoleFromRequest(request);
  const { id } = await context.params;
  const result = await toggleCoupon(role, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
