import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/server/in-memory-db";

// Prevent prerendering this dynamic API route
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getCatalogSnapshot());
}
