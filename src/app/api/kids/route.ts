import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const kids = await db.kid.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(kids);
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { name, avatarEmoji } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const kid = await db.kid.create({
      data: { userId, name, avatarEmoji: avatarEmoji || "🥋" },
    });
    return NextResponse.json(kid);
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { id, name, avatarEmoji } = await req.json();
    const kid = await db.kid.updateMany({
      where: { id, userId },
      data: { name, avatarEmoji },
    });
    return NextResponse.json(kid);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.kid.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}