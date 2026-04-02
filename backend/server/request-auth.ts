import type { NextRequest } from "next/server";
import type { UserRole } from "@/types";

const ALLOWED: UserRole[] = ["admin", "pm", "delivery", "user"];

export function getRoleFromRequest(request: NextRequest): UserRole | null {
  const value = request.headers.get("x-user-role");
  if (!value) return null;
  return ALLOWED.includes(value as UserRole) ? (value as UserRole) : null;
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  const value = request.headers.get("x-user-id");
  return value ? value : null;
}

