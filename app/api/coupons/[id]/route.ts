import { NextRequest, NextResponse } from "next/server";
import { deleteCoupon, updateCoupon } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const role = getRoleFromRequest(request);
  const { id } = await context.params;
  const payload = (await request.json()) as {
    code?: string;
    discount?: number;
    minOrder?: number;
    expiryDate?: string;
    active?: boolean;
  };

  if (!payload.code || payload.discount == null || payload.minOrder == null || !payload.expiryDate) {
    return NextResponse.json({ error: "Invalid coupon payload" }, { status: 400 });
  }

  const result = await updateCoupon(role, id, {
    code: payload.code,
    discount: payload.discount,
    minOrder: payload.minOrder,
    expiryDate: payload.expiryDate,
    active: payload.active,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const role = getRoleFromRequest(request);
  const { id } = await context.params;
  const result = await deleteCoupon(role, id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
