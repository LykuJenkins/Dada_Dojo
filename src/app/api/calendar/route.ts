import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserId, unauthorized, serverError } from "@/lib/api-helpers";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const events = await db.calendarEvent.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(events);
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { name, description, startDate, endDate, allDay } = await req.json();
    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Name, startDate, endDate required" }, { status: 400 });
    }
    const event = await db.calendarEvent.create({
      data: {
        userId,
        name,
        description: description || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay: allDay ?? false,
      },
    });
    return NextResponse.json(event);
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  try {
    const { id, name, description, startDate, endDate, allDay } = await req.json();
    const event = await db.calendarEvent.updateMany({
      where: { id, userId },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay,
      },
    });
    return NextResponse.json(event);
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
    await db.calendarEvent.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}