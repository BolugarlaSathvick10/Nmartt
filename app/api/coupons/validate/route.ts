import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/server/in-memory-db";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { code?: string; subtotal?: number };
  if (!payload.code || payload.subtotal == null) {
    return NextResponse.json({ error: "Invalid coupon validation payload" }, { status: 400 });
  }

  const result = await validateCoupon(payload.code, payload.subtotal);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, coupon: result.coupon });
}
