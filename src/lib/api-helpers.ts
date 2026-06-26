import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function getUserId(req?: NextRequest): Promise<string | null> {
  const session = await auth();
  return (session?.user as { id: string } | undefined)?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function serverError(msg = "Server error") {
  return NextResponse.json({ error: msg }, { status: 500 });
}