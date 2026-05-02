import { NextRequest, NextResponse } from "next/server";
import { updateProductPrice } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as { price?: number };

  if (typeof payload.price !== "number" || Number.isNaN(payload.price)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const result = await updateProductPrice(role, params.id, payload.price);
  if (!result.ok) {
    const status = result.error === "Product not found" ? 404 : 403;
    return NextResponse.json({ error: result.error ?? "Failed to update product price" }, { status });
  }

  return NextResponse.json({ ok: true });
}
