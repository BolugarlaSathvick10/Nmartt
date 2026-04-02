import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";
import type { OrderStatus } from "@/types";

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as { status?: OrderStatus };
  if (!payload.status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateOrderStatus(role, params.id, payload.status);
  if (!result.ok) {
    const statusCode = result.error === "Order not found" ? 404 : 403;
    return NextResponse.json({ error: result.error }, { status: statusCode });
  }

  return NextResponse.json({ ok: true });
}
