import { NextRequest, NextResponse } from "next/server";
import { requestPasswordResetOtp } from "@/lib/server/in-memory-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { mobile?: string };
  if (!payload.mobile) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
  }

  const result = await requestPasswordResetOtp(payload.mobile);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
