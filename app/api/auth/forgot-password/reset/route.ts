import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithOtp } from "@/lib/server/in-memory-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    mobile?: string;
    otp?: string;
    newPassword?: string;
  };

  if (!payload.mobile || !payload.otp || !payload.newPassword) {
    return NextResponse.json(
      { error: "Mobile, OTP and new password are required" },
      { status: 400 }
    );
  }

  const result = await resetPasswordWithOtp(payload.mobile, payload.otp, payload.newPassword);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
