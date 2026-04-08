import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "USD";
  const to = req.nextUrl.searchParams.get("to") ?? "EUR";

  if (from === to) {
    return NextResponse.json({ rate: 1, from, to, date: new Date().toISOString().split("T")[0] });
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    const rate = data.rates?.[to] ?? null;
    return NextResponse.json({ rate, from, to, date: data.date });
  } catch {
    return NextResponse.json({ rate: null, from, to, date: null });
  }
}
