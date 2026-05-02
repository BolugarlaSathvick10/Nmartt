import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, updateProduct } from "@/lib/server/in-memory-db";
import { getRoleFromRequest } from "@/lib/server/request-auth";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  const role = getRoleFromRequest(request);
  const payload = (await request.json()) as Product;
  const result = await updateProduct(role, params.id, payload);

  if (!result.ok) {
    const status = result.error === "Product not found" ? 404 : 403;
    return NextResponse.json({ error: result.error ?? "Failed to update product" }, { status });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const role = getRoleFromRequest(request);
  const result = await deleteProduct(role, params.id);

  if (!result.ok) {
    const status = result.error === "Product not found" ? 404 : 403;
    return NextResponse.json({ error: result.error ?? "Failed to delete product" }, { status });
  }

  return NextResponse.json({ ok: true });
}
