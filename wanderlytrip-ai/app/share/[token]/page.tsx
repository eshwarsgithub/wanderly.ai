import { notFound } from "next/navigation";
import { Globe, Calendar, DollarSign, Star, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { loadTripByToken } from "@/lib/supabase";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import MoodBoard from "@/components/MoodBoard";

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = await loadTripByToken(token);

  if (!trip) notFound();

  const itinerary = trip.itinerary;

  return (
    <main className="min-h-screen">
      {/* Minimal shared header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0f172a] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#00f5d4]" />
          </div>
          <span className="font-bold text-[#0f172a] text-sm tracking-tight">
            Wanderly<span style={{ color: "#00a896" }}>Trip</span>
            <span className="text-slate-400">.ai</span>
          </span>
        </Link>
        <Link href="/generate">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
            Plan My Trip
          </button>
        </Link>
      </nav>

      {/* Hero banner — dark for contrast */}
      <div className="bg-[#0f172a] pt-16">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/60 text-xs mb-6">
            <Globe className="w-3 h-3 text-[#00f5d4]" />
            Shared itinerary
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 capitalize border border-white/10 mb-4 block w-fit">
            {itinerary.vibe}
          </span>

          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">{itinerary.destination}</h1>
          <p className="text-white/60 max-w-2xl text-lg leading-relaxed mb-8">{itinerary.summary}</p>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: Calendar, label: `${itinerary.totalDays} days` },
              { icon: DollarSign, label: `${itinerary.currency} ${itinerary.totalBudget.toLocaleString()} budget` },
              { icon: MapPin, label: itinerary.country },
              { icon: Star, label: itinerary.bestTimeToVisit },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/60 text-sm">
                <Icon className="w-4 h-4 text-[#00f5d4]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights strip */}
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {itinerary.highlights.map((h, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="text-white/70 text-sm whitespace-nowrap">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-[#0f172a] font-bold text-xl mb-5 tracking-tight">Itinerary</h2>
              <InteractiveTimeline days={itinerary.days} />
            </div>

            <div>
              <h2 className="text-[#0f172a] font-bold text-xl mb-5 tracking-tight">Mood Board</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {itinerary.days.map((day) => (
                  <MoodBoard key={day.day} day={day} destination={itinerary.destination} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-[#0f172a] font-semibold mb-4 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-[#00a896]" /> Packing Tips
              </h3>
              <ul className="space-y-2.5">
                {itinerary.packingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-600 text-xs leading-relaxed">
                    <div className="w-4 h-4 rounded-full bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#00a896] text-[9px] font-bold">{i + 1}</span>
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-[#0f172a] font-semibold mb-4 text-sm">Local Customs</h3>
              <ul className="space-y-2.5">
                {itinerary.localCustoms.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-600 text-xs leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-[#0f172a] rounded-2xl p-5 text-center">
              <p className="text-white/60 text-sm mb-4 leading-relaxed">Like this trip? Create your own with AI in minutes.</p>
              <Link href="/generate">
                <button className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-[#0f172a] hover:bg-slate-50 transition-colors shadow-sm">
                  Plan My Trip Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
