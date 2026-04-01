"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, MapPin, Calendar, Users, DollarSign, Star, Package, Plane, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import MoodBoard from "@/components/MoodBoard";
import BudgetTracker from "@/components/BudgetTracker";
import AIChatAssistant from "@/components/AIChatAssistant";
import Navbar from "@/components/Navbar";
import type { GeneratedItinerary } from "@/lib/ai-agent";

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "moodboard" | "packing">("timeline");

  useEffect(() => {
    const stored = sessionStorage.getItem(`trip-${id}`);
    if (stored) {
      setItinerary(JSON.parse(stored));
    } else {
      // Could load from Supabase here
      router.push("/generate");
    }
  }, [id, router]);

  function handleItineraryUpdate(updated: GeneratedItinerary) {
    setItinerary(updated);
    sessionStorage.setItem(`trip-${id}`, JSON.stringify(updated));
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-[#00f5d4] border-t-transparent"
          />
          <p className="text-white/50">Loading your trip...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "timeline", label: "Itinerary" },
    { id: "moodboard", label: "Mood Board" },
    { id: "packing", label: "Packing & Tips" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero banner */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 mountain-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #00f5d4, transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          {/* Back */}
          <Link href="/generate" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            New trip
          </Link>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-[#00f5d4]" />
              <Badge className="bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30 capitalize">
                {itinerary.vibe}
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              {itinerary.destination}
            </h1>
            <p className="text-white/60 max-w-2xl text-lg leading-relaxed mb-8">
              {itinerary.summary}
            </p>

            {/* Stats row */}
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
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Highlights */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {itinerary.highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl px-4 py-2.5 flex-shrink-0 flex items-center gap-2"
            >
              <Star className="w-3.5 h-3.5 text-[#00f5d4] flex-shrink-0" />
              <span className="text-white/80 text-sm whitespace-nowrap">{h}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 glass rounded-2xl p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "transparent",
                color: activeTab === tab.id ? "#0a0a0a" : "rgba(255,255,255,0.5)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-3 gap-8 pb-32">
          {/* Main content */}
          <div className="lg:col-span-2">
            {activeTab === "timeline" && (
              <InteractiveTimeline days={itinerary.days} />
            )}

            {activeTab === "moodboard" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {itinerary.days.map((day) => (
                  <MoodBoard key={day.day} day={day} destination={itinerary.destination} />
                ))}
              </div>
            )}

            {activeTab === "packing" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#00f5d4]" />
                    Packing Tips
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.packingTips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 text-white/70 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#00f5d4]/20 border border-[#00f5d4]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#00f5d4] text-xs font-bold">{i + 1}</span>
                        </div>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#00f5d4]" />
                    Local Customs
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.localCustoms.map((custom, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] mt-2 flex-shrink-0" />
                        {custom}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — quick actions */}
          <div className="hidden lg:block space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Search Flights", href: "/flights", icon: Plane },
                  { label: "Find Hotels", href: "/hotels", icon: MapPin },
                  { label: "Save This Trip", href: "/saved", icon: Star },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[#00f5d4]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#00f5d4]" />
                      </div>
                      <span className="text-white/70 text-sm">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Local customs mini card */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">Best Time to Visit</h3>
              <p className="text-white/60 text-sm leading-relaxed">{itinerary.bestTimeToVisit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating widgets */}
      <BudgetTracker itinerary={itinerary} />
      <AIChatAssistant itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} />
    </main>
  );
}
