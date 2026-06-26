import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const chores = await db.chore.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(chores);
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { name, icon, points } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const count = await db.chore.count({ where: { userId } });
    const chore = await db.chore.create({
      data: { userId, name, icon: icon || "✅", points: points ?? 1, sortOrder: count },
    });
    return NextResponse.json(chore);
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { id, name, icon, points, completed, kidId } = await req.json();
    if (completed !== undefined && kidId) {
      const chore = await db.chore.findFirst({ where: { id, userId } });
      if (!chore) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existing = await db.choreLog.findFirst({
        where: {
          kidId,
          choreId: id,
          date: { gte: today, lt: tomorrow },
        },
      });

      if (completed && !existing) {
        await db.$transaction([
          db.choreLog.create({
            data: { kidId, choreId: id, points: chore.points },
          }),
          db.kid.update({
            where: { id: kidId },
            data: { totalPoints: { increment: chore.points } },
          }),
        ]);
        return NextResponse.json({ success: true, action: "checked" });
      } else if (!completed && existing) {
        await db.$transaction([
          db.choreLog.delete({ where: { id: existing.id } }),
          db.kid.update({
            where: { id: kidId },
            data: { totalPoints: { decrement: chore.points } },
          }),
        ]);
        return NextResponse.json({ success: true, action: "unchecked" });
      }
      return NextResponse.json({ success: true, action: "no_change" });
    }

    const chore = await db.chore.updateMany({
      where: { id, userId },
      data: { name, icon, points },
    });
    return NextResponse.json(chore);
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
    await db.chore.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}