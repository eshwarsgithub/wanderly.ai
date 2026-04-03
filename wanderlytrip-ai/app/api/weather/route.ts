import { NextRequest, NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get("destination");
  const startDate = req.nextUrl.searchParams.get("startDate");
  const daysParam = req.nextUrl.searchParams.get("days");

  if (!destination || !startDate) {
    return NextResponse.json({ error: "destination and startDate are required" }, { status: 400 });
  }

  const days = daysParam ? Math.min(parseInt(daysParam, 10), 5) : 5;
  const weather = await getWeatherForecast(destination, startDate, days);

  return NextResponse.json({ weather });
}
