import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const items = await db.storeItem.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(items);
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { name, description, pointCost, icon } = await req.json();
    if (!name || pointCost === undefined) {
      return NextResponse.json({ error: "Name and pointCost required" }, { status: 400 });
    }
    const count = await db.storeItem.count({ where: { userId } });
    const item = await db.storeItem.create({
      data: { userId, name, description: description || "", pointCost, icon: icon || "🎁", sortOrder: count },
    });
    return NextResponse.json(item);
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { id, name, description, pointCost, icon, isActive } = await req.json();
    const item = await db.storeItem.updateMany({
      where: { id, userId },
      data: { name, description, pointCost, icon, isActive },
    });
    return NextResponse.json(item);
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
    await db.storeItem.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}