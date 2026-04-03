"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, DollarSign, X, Check } from "lucide-react";
import { format } from "date-fns";
import type { ItineraryDay, Activity, GeneratedItinerary } from "@/lib/ai-agent";
import type { WeatherDay } from "@/lib/weather";
import ItineraryCard from "@/components/ItineraryCard";
import { swapActivityAction } from "@/app/actions/generate-itinerary";

interface InteractiveTimelineProps {
  days: ItineraryDay[];
  itinerary?: GeneratedItinerary;
  weather?: WeatherDay[];
  onActivitySwap?: (dayIndex: number, activityId: string, replacement: Activity) => void;
}

interface SwapModal {
  dayIndex: number;
  activityId: string;
  alternatives: Activity[];
}

export default function InteractiveTimeline({ days, itinerary, weather, onActivitySwap }: InteractiveTimelineProps) {
  const [openDay, setOpenDay] = useState<number>(1);
  const [swapModal, setSwapModal] = useState<SwapModal | null>(null);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getWeatherForDay(date: string): WeatherDay | undefined {
    if (!weather) return undefined;
    return weather.find((w) => w.date === date);
  }

  function handleSwapRequest(dayIndex: number, activityId: string) {
    setSwappingId(activityId);
    startTransition(async () => {
      const ctx = itinerary ?? ({ days, destination: "", vibe: "", id: "", country: "", totalDays: days.length, totalBudget: 0, currency: "USD", summary: "", highlights: [], packingTips: [], bestTimeToVisit: "", localCustoms: [] } as GeneratedItinerary);
      const result = await swapActivityAction(ctx, dayIndex, activityId);
      setSwappingId(null);
      if (result.success && result.alternatives.length > 0) {
        setSwapModal({ dayIndex, activityId, alternatives: result.alternatives });
      }
    });
  }

  function handlePickAlternative(alternative: Activity) {
    if (!swapModal || !onActivitySwap) return;
    onActivitySwap(swapModal.dayIndex, swapModal.activityId, alternative);
    setSwapModal(null);
  }

  return (
    <>
      <div className="space-y-4">
        {days.map((day, dayIndex) => {
          const isOpen = openDay === day.day;
          const date = new Date(day.date);
          const wx = getWeatherForDay(day.date);

          return (
            <motion.div
              key={day.day}
              layout
              className="glass rounded-2xl overflow-hidden"
              style={{ borderColor: isOpen ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.08)" }}
            >
              {/* Day header */}
              <button
                onClick={() => setOpenDay(isOpen ? 0 : day.day)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{
                      background: isOpen
                        ? "linear-gradient(135deg, #00f5d4, #00c4aa)"
                        : "rgba(255,255,255,0.08)",
                      color: isOpen ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {day.day}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{day.theme}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <CalendarDays className="w-3 h-3" />
                        {!isNaN(date.getTime()) ? format(date, "EEE, MMM d") : `Day ${day.day}`}
                      </span>
                      <span className="flex items-center gap-1 text-[#00f5d4]/70 text-xs">
                        <DollarSign className="w-3 h-3" />
                        ${day.dailyCost} est.
                      </span>
                      <span className="text-white/30 text-xs">{day.mood}</span>

                      {/* Weather badge */}
                      {wx && (
                        <span className="flex items-center gap-1 text-white/50 text-xs">
                          <img
                            src={`https://openweathermap.org/img/wn/${wx.icon}.png`}
                            alt={wx.description}
                            className="w-4 h-4"
                          />
                          {wx.tempHighC}°/{wx.tempLowC}°C
                          {wx.precipitationChance > 30 && (
                            <span className="text-blue-300/70">· {wx.precipitationChance}% rain</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-white/40" />
                </motion.div>
              </button>

              {/* Activities */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2">
                      {day.activities.map((activity, index) => (
                        <ItineraryCard
                          key={activity.id}
                          activity={activity}
                          index={index}
                          isLast={index === day.activities.length - 1}
                          onSwap={onActivitySwap ? (id) => handleSwapRequest(dayIndex, id) : undefined}
                          isSwapping={swappingId === activity.id && isPending}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Swap alternatives modal */}
      <AnimatePresence>
        {swapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSwapModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg glass rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">Choose an alternative</h3>
                <button
                  onClick={() => setSwapModal(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {swapModal.alternatives.map((alt, i) => (
                  <motion.button
                    key={alt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                    onClick={() => handlePickAlternative(alt)}
                    className="w-full text-left glass rounded-2xl p-4 hover:border-[#00f5d4]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-white/40 text-xs font-mono">{alt.time}</span>
                        <h4 className="text-white font-semibold">{alt.name}</h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#00f5d4] font-semibold text-sm">${alt.estimatedCost}</p>
                        <p className="text-white/30 text-xs">{alt.duration}</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-2">{alt.description}</p>
                    <p className="text-white/40 text-xs">{alt.location}</p>

                    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-3.5 h-3.5 text-[#00f5d4]" />
                      <span className="text-[#00f5d4] text-xs font-medium">Choose this</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
