import Link from "next/link";
import { Globe, MapPin, Calendar, DollarSign, Star, Package, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import MoodBoard from "@/components/MoodBoard";
import Navbar from "@/components/Navbar";
import { loadTripBySlug } from "@/lib/supabase";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SharedTripPage({ params }: Props) {
  const { slug } = await params;
  const record = await loadTripBySlug(slug);

  if (!record) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <Navbar />
        <div className="text-center pt-16">
          <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Trip not found</h1>
          <p className="text-white/40 mb-6">This trip doesn&apos;t exist or is private.</p>
          <Link href="/explore">
            <button className="px-6 py-3 rounded-xl font-semibold text-[#0a0a0a]"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
              Browse public trips
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const { itinerary } = record;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* CTA Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#00f5d4]/20 to-[#00c4aa]/10 border-b border-[#00f5d4]/20 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="text-white/70 text-sm">
            ✨ You&apos;re viewing a shared trip — <span className="text-[#00f5d4]">create your own in minutes</span>
          </p>
          <Link href="/generate">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-[#0a0a0a] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
              Plan my trip <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative pt-28 overflow-hidden">
        <div className="absolute inset-0 mountain-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #00f5d4, transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-6 h-6 text-[#00f5d4]" />
            <Badge className="bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30 capitalize">
              {itinerary.vibe}
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">{itinerary.destination}</h1>
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
        <div className="h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Highlights */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {itinerary.highlights.map((h, i) => (
            <div key={i} className="glass rounded-xl px-4 py-2.5 flex-shrink-0 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-[#00f5d4] flex-shrink-0" />
              <span className="text-white/80 text-sm whitespace-nowrap">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-white font-semibold text-xl mb-5">Day-by-Day Itinerary</h2>
              <InteractiveTimeline days={itinerary.days} />
            </div>

            <div>
              <h2 className="text-white font-semibold text-xl mb-5">Mood Board</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {itinerary.days.slice(0, 4).map((day) => (
                  <MoodBoard key={day.day} day={day} destination={itinerary.destination} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-[#00f5d4]" />
                Packing Tips
              </h3>
              <ul className="space-y-2">
                {itinerary.packingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">Local Customs</h3>
              <ul className="space-y-2">
                {itinerary.localCustoms.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] mt-1.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
