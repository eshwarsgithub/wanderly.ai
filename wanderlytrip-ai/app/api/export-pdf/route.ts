import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import TripPDF from "@/components/TripPDF";
import type { GeneratedItinerary } from "@/lib/ai-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itinerary = body.itinerary as GeneratedItinerary;

    if (!itinerary?.destination) {
      return NextResponse.json({ error: "Invalid itinerary" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(TripPDF, { itinerary }) as any);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${itinerary.destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-itinerary.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
