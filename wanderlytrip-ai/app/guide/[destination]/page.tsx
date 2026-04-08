import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe, Clock, Eye, UtensilsCrossed, Bus, ShieldCheck, Lightbulb, DollarSign, ArrowRight,
} from "lucide-react";
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

      {/* Hero */}
      <div className="bg-[#0f172a] pt-16">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/60 text-xs mb-6">
            <Globe className="w-3 h-3 text-[#00f5d4]" />
            Travel Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
            {guide.destination}
          </h1>
          <p className="text-white/50 text-lg mb-6">{guide.country}</p>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">{guide.overview}</p>

          <div className="mt-8">
            <Link href={`/generate?destination=${encodeURIComponent(destination)}`}>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#00f5d4] text-[#0a0a0a] hover:bg-[#00e5c4] transition-colors shadow-lg shadow-[#00f5d4]/20">
                Plan a trip to {guide.destination}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Best Time + Budget side by side */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-[#0f172a] font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00a896]" /> Best Time to Visit
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.bestTime}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-[#0f172a] font-semibold text-sm mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00a896]" /> Budget Estimate
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.budgetEstimate}</p>
          </div>
        </div>

        {/* Must See */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-[#0f172a] font-semibold text-base mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00a896]" /> Must-See Attractions
          </h2>
          <ul className="space-y-3">
            {guide.mustSee.map((item, i) => {
              const [name, ...rest] = item.split(":");
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#00a896] text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-[#0f172a] text-sm font-medium">{name.trim()}</p>
                    {rest.length > 0 && (
                      <p className="text-slate-500 text-xs mt-0.5">{rest.join(":").trim()}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cuisine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-[#0f172a] font-semibold text-base mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-[#00a896]" /> Local Cuisine
          </h2>
          <ul className="space-y-3">
            {guide.cuisine.map((item, i) => {
              const [name, ...rest] = item.split(":");
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00a896] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[#0f172a] text-sm font-medium">{name.trim()}</p>
                    {rest.length > 0 && (
                      <p className="text-slate-500 text-xs mt-0.5">{rest.join(":").trim()}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Getting around + Safety */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-[#0f172a] font-semibold text-sm mb-3 flex items-center gap-2">
              <Bus className="w-4 h-4 text-[#00a896]" /> Getting Around
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.gettingAround}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-[#0f172a] font-semibold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00a896]" /> Safety
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">{guide.safety}</p>
          </div>
        </div>

        {/* Cultural Tips */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-[#0f172a] font-semibold text-base mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#00a896]" /> Cultural Tips
          </h2>
          <ul className="space-y-3">
            {guide.culturalTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-500 text-[10px] font-bold">{i + 1}</span>
                </div>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA bottom */}
        <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
          <p className="text-white/60 text-base mb-6 leading-relaxed max-w-md mx-auto">
            Ready to experience {guide.destination}? Let our AI build your perfect itinerary in seconds.
          </p>
          <Link href={`/generate?destination=${encodeURIComponent(destination)}`}>
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#00f5d4] text-[#0a0a0a] hover:bg-[#00e5c4] transition-colors">
              Plan My {guide.destination} Trip
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
