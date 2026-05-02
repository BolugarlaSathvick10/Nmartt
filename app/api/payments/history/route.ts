import { NextRequest, NextResponse } from "next/server";
import { createPaymentHistory, getPaymentHistory } from "@/lib/server/in-memory-db";
import { getRoleFromRequest, getUserIdFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const result = await getPaymentHistory(role);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json(result.records);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    orderId?: string;
    userName?: string;
    amount?: number;
    method?: "paytm" | "phonepe" | "gpay" | "cod" | "upi_scanner";
    utrNumber?: string;
    screenshotFileName?: string;
  };

  if (!payload.orderId || !payload.userName || payload.amount == null || !payload.method) {
    return NextResponse.json({ error: "Invalid payment history payload" }, { status: 400 });
  }

  const userId = getUserIdFromRequest(request) ?? "unknown-user";
  const result = await createPaymentHistory({
    orderId: payload.orderId,
    userId,
    userName: payload.userName,
    amount: payload.amount,
    method: payload.method,
    utrNumber: payload.utrNumber,
    screenshotFileName: payload.screenshotFileName,
  });

  return NextResponse.json({ ok: true, payment: result.payment });
}
