import { NextRequest, NextResponse } from "next/server";
import { createCoupon, getCoupons } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export async function GET() {
  return NextResponse.json(await getCoupons());
}

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
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

  const result = await createCoupon(role, {
    code: payload.code,
    discount: payload.discount,
    minOrder: payload.minOrder,
    expiryDate: payload.expiryDate,
    active: payload.active,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true, coupon: result.coupon });
}
