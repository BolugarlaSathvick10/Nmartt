import { NextRequest, NextResponse } from "next/server";
import { getPaymentConfig, updatePaymentConfig } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getPaymentConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as {
    upiQrImageUrl?: string;
    upiId?: string;
    paytmNumber?: string;
    phonepeNumber?: string;
    gpayNumber?: string;
    codEnabled?: boolean;
  };

  const result = await updatePaymentConfig(role, payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true, config: result.config });
}
