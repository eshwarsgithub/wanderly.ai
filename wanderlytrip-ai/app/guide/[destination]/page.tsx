import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe, Clock, Eye, UtensilsCrossed, Bus, ShieldCheck,
  Lightbulb, DollarSign, ArrowRight, Gem, MapPin,
} from "lucide-react";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { getDestinationGuide } from "@/lib/guide";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination: rawDestination } = await params;
  const destination = decodeURIComponent(rawDestination);

  const guide = await getDestinationGuide(destination);
  if (!guide) notFound();

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <Navbar />

      {/* ── Cinematic Hero ─────────────────────────────────────────── */}
      <div className="relative bg-[#0a0f1e] overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #00f5d4 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
          />
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-32 pb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/50 text-xs">
              <Globe className="w-3 h-3 text-[#00f5d4]" />
              Travel Guide
            </div>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/40 text-xs">{guide.country}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-3 text-white leading-none">
            {guide.destination}
          </h1>
          <p className="text-[#00f5d4] text-base font-medium mb-6 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {guide.country}
          </p>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mb-10">
            {guide.overview}
          </p>

          <Link href={`/generate?destination=${encodeURIComponent(destination)}`}>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-[#00f5d4] text-[#0a0a0a] hover:bg-[#00e5c4] transition-colors shadow-lg shadow-[#00f5d4]/25">
              Plan a trip to {guide.destination}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/5 bg-white/[0.03]">
          <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatItem icon={<Clock className="w-4 h-4 text-[#00f5d4]" />} label="Best Time" value={guide.bestTime} />
            <StatItem icon={<DollarSign className="w-4 h-4 text-[#00f5d4]" />} label="Daily Budget" value={guide.budgetEstimate} />
            <StatItem icon={<ShieldCheck className="w-4 h-4 text-[#00f5d4]" />} label="Safety" value={guide.safety} />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-14 space-y-8">

        {/* Must-See */}
        <section>
          <SectionHeader icon={<Eye className="w-4 h-4 text-[#00a896]" />} title="Must-See Attractions" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {guide.mustSee.map((item, i) => {
              const [name, ...rest] = item.split(":");
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00a896] text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[#0f172a] text-sm font-semibold">{name.trim()}</p>
                  </div>
                  {rest.length > 0 && (
                    <p className="text-slate-500 text-xs leading-relaxed">{rest.join(":").trim()}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Hidden Gems */}
        {(guide.hiddenGems ?? []).length > 0 && (
          <section>
            <SectionHeader
              icon={<Gem className="w-4 h-4 text-[#8b5cf6]" />}
              title="Hidden Gems"
              badge="Locals only"
            />
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {(guide.hiddenGems ?? []).map((item, i) => {
                const [name, ...rest] = item.split(":");
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-violet-200 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                        <Gem className="w-3 h-3 text-[#8b5cf6]" />
                      </div>
                      <p className="text-[#0f172a] text-sm font-semibold">{name.trim()}</p>
                    </div>
                    {rest.length > 0 && (
                      <p className="text-slate-500 text-xs leading-relaxed">{rest.join(":").trim()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Food Scene */}
        <section>
          <SectionHeader icon={<UtensilsCrossed className="w-4 h-4 text-[#00a896]" />} title="Food Scene" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {guide.cuisine.map((item, i) => {
              const [name, ...rest] = item.split(":");
              const emojis = ["🍜", "🍣", "🥘", "🍛", "🥗", "🍢", "🫕", "🥩"];
              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-200 transition-all flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {emojis[i % emojis.length]}
                  </div>
                  <div>
                    <p className="text-[#0f172a] text-sm font-semibold">{name.trim()}</p>
                    {rest.length > 0 && (
                      <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{rest.join(":").trim()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Getting Around */}
        <section>
          <SectionHeader icon={<Bus className="w-4 h-4 text-[#00a896]" />} title="Getting Around" />
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-slate-600 text-sm leading-relaxed">{guide.gettingAround}</p>
          </div>
        </section>

        {/* Cultural Tips */}
        <section>
          <SectionHeader icon={<Lightbulb className="w-4 h-4 text-amber-500" />} title="Cultural Tips" />
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {guide.culturalTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="relative bg-[#0a0f1e] rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #00f5d4 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
            />
          </div>
          <div className="relative">
            <p className="text-[#00f5d4] text-xs font-semibold uppercase tracking-widest mb-3">
              Ready to go?
            </p>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              Plan your {guide.destination} adventure
            </h2>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Let our AI build a complete day-by-day itinerary tailored to your vibe, budget, and travel dates.
            </p>
            <Link href={`/generate?destination=${encodeURIComponent(destination)}`}>
              <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold bg-[#00f5d4] text-[#0a0a0a] hover:bg-[#00e5c4] transition-colors shadow-xl shadow-[#00f5d4]/20">
                Build My Itinerary
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-white/70 text-xs leading-snug">{value}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: ReactNode;
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-[#0f172a] font-bold text-base">{title}</h2>
      {badge && (
        <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-semibold">
          {badge}
        </span>
      )}
    </div>
  );
}
