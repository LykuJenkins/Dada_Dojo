import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { kidId, storeItemId } = await req.json();
    const kid = await db.kid.findFirst({ where: { id: kidId, userId } });
    if (!kid) return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    const item = await db.storeItem.findFirst({ where: { id: storeItemId, userId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (kid.totalPoints < item.pointCost) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 });
    }
    await db.$transaction([
      db.purchase.create({
        data: { kidId, storeItemId, pointsSpent: item.pointCost },
      }),
      db.kid.update({
        where: { id: kidId },
        data: { totalPoints: { decrement: item.pointCost } },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const purchases = await db.purchase.findMany({
      where: { storeItem: { userId } },
      include: { kid: true, storeItem: true },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(purchases);
  } catch {
    return serverError();
  }
}