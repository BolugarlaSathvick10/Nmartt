import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/server/in-memory-db";

export async function GET() {
  return NextResponse.json(await getCatalogSnapshot());
}
