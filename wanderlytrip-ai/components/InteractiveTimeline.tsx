"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CalendarDays, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { ItineraryDay } from "@/lib/ai-agent";
import ItineraryCard from "@/components/ItineraryCard";

interface InteractiveTimelineProps {
  days: ItineraryDay[];
}

export default function InteractiveTimeline({ days }: InteractiveTimelineProps) {
  const [openDay, setOpenDay] = useState<number>(1);

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const isOpen = openDay === day.day;
        const date = new Date(day.date);

        return (
          <motion.div
            key={day.day}
            layout
            className="glass rounded-2xl overflow-hidden"
            style={{ borderColor: isOpen ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.08)" }}
          >
            {/* Day header — clickable */}
            <button
              onClick={() => setOpenDay(isOpen ? 0 : day.day)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Day number badge */}
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
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-white/40 text-xs">
                      <CalendarDays className="w-3 h-3" />
                      {!isNaN(date.getTime()) ? format(date, "EEE, MMM d") : `Day ${day.day}`}
                    </span>
                    <span className="flex items-center gap-1 text-[#00f5d4]/70 text-xs">
                      <DollarSign className="w-3 h-3" />
                      ${day.dailyCost} est.
                    </span>
                    <span className="text-white/30 text-xs">{day.mood}</span>
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
  );
}
