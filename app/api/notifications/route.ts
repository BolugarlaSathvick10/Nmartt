import { NextRequest, NextResponse } from "next/server";
import { getNotificationsForUser, pushNotification } from "@/lib/server/in-memory-db";
import { getRoleFromRequest, getUserIdFromRequest } from "@/lib/server/request-auth";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const userId = getUserIdFromRequest(request);
  const result = await getNotificationsForUser(userId, role);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const actorUserId = getUserIdFromRequest(request);
  const payload = (await request.json()) as {
    title?: string;
    message?: string;
    type?: "festival" | "offer" | "coupon" | "info";
    targetRoles?: Array<"admin" | "pm" | "delivery" | "user">;
  };

  if (!payload.title || !payload.message || !payload.type) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }

  const result = await pushNotification(role, actorUserId, {
    title: payload.title,
    message: payload.message,
    type: payload.type,
    targetRoles: payload.targetRoles,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true, notification: result.notification });
}
