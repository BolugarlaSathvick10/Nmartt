import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/server/in-memory-db";
import { getUserIdFromRequest } from "@/lib/server/request-auth";

export async function PATCH(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    name?: string;
    mobile?: string;
    aadhaarNumber?: string;
    drivingLicenseNumber?: string;
    aadhaarImage?: string;
    drivingLicenseImage?: string;
    vehicleNumber?: string;
    address?: string;
  };
  const result = await updateUserProfile(userId, payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
