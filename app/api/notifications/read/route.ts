import { NextRequest, NextResponse } from "next/server";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/server/in-memory-db";
import { getRoleFromRequest, getUserIdFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const userId = getUserIdFromRequest(request);
  const payload = (await request.json()) as { notificationId?: string; all?: boolean };

  if (payload.all) {
    const result = await markAllNotificationsRead(userId, role);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!payload.notificationId) {
    return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
  }

  const result = await markNotificationRead(userId, payload.notificationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
