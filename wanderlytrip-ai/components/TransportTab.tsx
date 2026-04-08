"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Train, Car, Navigation, Footprints, AlertTriangle, CreditCard, Smartphone, ExternalLink, ChevronRight } from "lucide-react";
import type { GeneratedItinerary } from "@/lib/ai-agent";

type TransportMode = "metro" | "bus" | "taxi" | "walk" | "tuk-tuk" | "ferry" | "cable-car" | "rideshare";

interface Transition {
  from: string;
  to: string;
  mode: TransportMode;
  icon: string;
  details: string;
  estimatedTime: string;
  estimatedCost: string;
  tip?: string;
}

interface TransportDay {
  day: number;
  transitions: Transition[];
}

interface TransportData {
  destination: string;
  overview: string;
  travelCard: { name: string | null; tip: string; avgDailyCost: string };
  recommendedApp: string;
  days: TransportDay[];
  warnings: string[];
}

const MODE_COLORS: Record<string, string> = {
  metro: "#60a5fa",
  bus: "#34d399",
  taxi: "#fbbf24",
  rideshare: "#fbbf24",
  walk: "#a78bfa",
  "tuk-tuk": "#fb923c",
  ferry: "#22d3ee",
  "cable-car": "#f472b6",
};

function getModeIcon(mode: TransportMode) {
  switch (mode) {
    case "metro": return Train;
    case "bus": return Bus;
    case "taxi":
    case "rideshare": return Car;
    case "walk": return Footprints;
    default: return Navigation;
  }
}

export default function TransportTab({
  itinerary,
  activeDay,
}: {
  itinerary: GeneratedItinerary;
  activeDay: number;
}) {
  const [data, setData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState(activeDay);

  useEffect(() => { setSelectedDay(activeDay); }, [activeDay]);

  useEffect(() => {
    if (data) return; // already loaded
    setLoading(true);
    setError(false);

    const days = itinerary.days.map((d) => ({
      day: d.day,
      activities: d.activities.map((a) => ({ name: a.name, location: a.location })),
    }));

    fetch("/api/transport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: itinerary.destination, days }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d as TransportData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Bus className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500 text-sm font-medium mb-1">Transport guide unavailable</p>
        <p className="text-slate-400 text-xs">Check your OPENAI_API_KEY environment variable.</p>
      </div>
    );
  }

  const currentDay = data.days.find((d) => d.day === selectedDay) ?? data.days[0];

  return (
    <div className="space-y-4">
      {/* Overview card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-[#0f172a] font-semibold text-sm mb-2 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#00a896]" />
          Getting Around {data.destination}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{data.overview}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Travel card */}
          {data.travelCard?.name && (
            <div
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ background: "#f0fdfb" }}
            >
              <CreditCard className="w-4 h-4 text-[#00a896] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#0f172a] text-xs font-semibold">{data.travelCard.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{data.travelCard.tip}</p>
                <p className="text-[#00a896] text-xs mt-1 font-medium">~{data.travelCard.avgDailyCost}/day</p>
              </div>
            </div>
          )}

          {/* App recommendation */}
          <div
            className="rounded-xl p-3 flex items-start gap-3"
            style={{ background: "#f0f9ff" }}
          >
            <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#0f172a] text-xs font-semibold">Recommended App</p>
              <p className="text-slate-500 text-xs mt-0.5">{data.recommendedApp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.days.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: selectedDay === d.day ? "#0f172a" : "#f1f5f9",
              color: selectedDay === d.day ? "#ffffff" : "#64748b",
            }}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Transitions for selected day */}
      {currentDay && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Day {currentDay.day} — Transit Plan
              </p>
            </div>

            {currentDay.transitions.length === 0 ? (
              <div className="p-8 text-center">
                <Footprints className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-400 text-sm">No transport activities planned for this day.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {currentDay.transitions.map((t, i) => {
                  const ModeIcon = getModeIcon(t.mode);
                  const color = MODE_COLORS[t.mode] ?? "#64748b";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-4"
                    >
                      {/* Route header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          <span className="text-base leading-none">{t.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="font-medium text-[#0f172a] truncate">{t.from}</span>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium text-[#0f172a] truncate">{t.to}</span>
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">{t.details}</p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 ml-11">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ background: `${color}12`, color }}
                        >
                          <ModeIcon className="w-3 h-3" />
                          {t.mode}
                        </span>
                        <span className="text-slate-400 text-xs">{t.estimatedTime}</span>
                        <span className="text-slate-500 text-xs font-medium">{t.estimatedCost}</span>
                      </div>

                      {/* Tip */}
                      {t.tip && (
                        <p className="ml-11 mt-1.5 text-slate-400 text-xs italic">{t.tip}</p>
                      )}

                      {/* Google Maps directions link */}
                      <div className="ml-11 mt-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(t.from + ", " + itinerary.destination)}&destination=${encodeURIComponent(t.to + ", " + itinerary.destination)}&travelmode=${t.mode === "walk" ? "walking" : t.mode === "metro" ? "transit" : t.mode === "bus" ? "transit" : "driving"}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#00a896] hover:underline font-medium"
                        >
                          Open in Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Warnings */}
      {data.warnings?.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "#fefce8", border: "1px solid #fde68a" }}
        >
          <h4 className="text-amber-800 text-xs font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Transport Tips
          </h4>
          <ul className="space-y-1.5">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-amber-700 text-xs leading-relaxed flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
