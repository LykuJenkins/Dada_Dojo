import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const items = await db.listItem.findMany({
      where: { userId },
      orderBy: [{ completed: "asc" }, { sortOrder: "asc" }],
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
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const count = await db.listItem.count({ where: { userId, completed: false } });
    const item = await db.listItem.create({
      data: { userId, name, description: description || "", sortOrder: count },
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
    const { id, name, description, completed } = await req.json();
    const item = await db.listItem.updateMany({
      where: { id, userId },
      data: { name, description, completed, completedAt: completed ? new Date() : null },
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
    await db.listItem.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}