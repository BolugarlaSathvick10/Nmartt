import { NextResponse } from "next/server";
import { getUsers } from "@/lib/server/in-memory-db";

export async function GET() {
  return NextResponse.json(await getUsers());
}
