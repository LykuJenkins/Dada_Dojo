import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const kidId = searchParams.get("kidId");
    const days = parseInt(searchParams.get("days") || "7", 10);

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const logs = await db.choreLog.findMany({
      where: {
        kid: { userId },
        ...(kidId ? { kidId } : {}),
        date: { gte: since },
      },
      include: { chore: true, kid: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(logs);
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { kidId, amount, reason } = await req.json();
    if (!kidId || amount === undefined) {
      return NextResponse.json({ error: "kidId and amount required" }, { status: 400 });
    }
    const kid = await db.kid.findFirst({ where: { id: kidId, userId } });
    if (!kid) return NextResponse.json({ error: "Kid not found" }, { status: 404 });

    const adjustment = await db.$transaction([
      db.pointAdjustment.create({ data: { kidId, amount, reason } }),
      db.kid.update({
        where: { id: kidId },
        data: { totalPoints: { increment: amount } },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { kidId, newTotal } = await req.json();
    const kid = await db.kid.findFirst({ where: { id: kidId, userId } });
    if (!kid) return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    await db.kid.update({
      where: { id: kidId },
      data: { totalPoints: newTotal },
    });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}