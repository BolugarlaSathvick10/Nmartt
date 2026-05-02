import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createProduct } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";
import type { Product } from "@/types";

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as Product;
  const result = await createProduct(role, payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to create product" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
