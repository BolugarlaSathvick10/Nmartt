import { NextRequest, NextResponse } from "next/server";
import { clearProductActivities, getProductActivities } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 50;
  return NextResponse.json(await getProductActivities(Number.isFinite(limit) ? limit : 50));
}

export async function DELETE(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const older = request.nextUrl.searchParams.get("olderThanDays");
  const olderThanDays = older == null ? undefined : Number(older);
  await clearProductActivities(Number.isFinite(olderThanDays as number) ? olderThanDays : undefined);
  return NextResponse.json({ ok: true });
}
