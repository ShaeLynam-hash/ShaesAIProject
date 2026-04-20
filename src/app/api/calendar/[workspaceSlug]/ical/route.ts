import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function fmtIcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> }
) {
  const { workspaceSlug } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return new NextResponse("Not found", { status: 404 });

  const appointments = await prisma.appointment.findMany({
    where: { workspaceId: workspace.id, status: { not: "CANCELLED" } },
    include: { service: true },
    orderBy: { date: "asc" },
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Stactoro//${workspace.name}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${workspace.name} Appointments`,
    "X-WR-TIMEZONE:UTC",
  ];

  for (const apt of appointments) {
    const start = new Date(apt.date);
    const end = new Date(start.getTime() + apt.service.duration * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${apt.id}@stactoro`,
      `DTSTART:${fmtIcalDate(start)}`,
      `DTEND:${fmtIcalDate(end)}`,
      `SUMMARY:${apt.service.name} — ${apt.clientName}`,
      `DESCRIPTION:Client: ${apt.clientName}\\nEmail: ${apt.clientEmail}${apt.notes ? `\\nNotes: ${apt.notes}` : ""}`,
      `STATUS:${apt.status === "CONFIRMED" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${workspaceSlug}-calendar.ics"`,
    },
  });
}
