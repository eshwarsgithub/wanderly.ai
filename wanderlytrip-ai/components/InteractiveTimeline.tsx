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

  const isMultiCity = days.some((d) => d.city);
  const cities = isMultiCity ? [...new Set(days.map((d) => d.city).filter(Boolean))] : [];

  if (isMultiCity) {
    return (
      <div className="space-y-8">
        {cities.map((city) => {
          const cityDays = days.filter((d) => d.city === city);
          return (
            <div key={city}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[#0f172a] text-white">{city}</span>
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-slate-400 text-xs">{cityDays.length} day{cityDays.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">
                {cityDays.map((day) => <DayCard key={day.day} day={day} openDay={openDay} setOpenDay={setOpenDay} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {days.map((day) => <DayCard key={day.day} day={day} openDay={openDay} setOpenDay={setOpenDay} />)}
    </div>
  );
}

function DayCard({ day, openDay, setOpenDay }: { day: ItineraryDay; openDay: number; setOpenDay: (n: number) => void }) {
  const isOpen = openDay === day.day;
  const date = new Date(day.date);

  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden"
      style={{
        borderColor: isOpen ? "#0f172a" : "#e2e8f0",
        background: "#ffffff",
        boxShadow: isOpen ? "0 2px 12px rgba(0,196,170,0.08)" : "none",
      }}
    >
      <button
        onClick={() => setOpenDay(isOpen ? 0 : day.day)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all"
            style={
              isOpen
                ? { background: "#0f172a", color: "#ffffff" }
                : { background: "#f1f5f9", color: "#64748b" }
            }
          >
            {day.day}
          </div>
          <div>
            <p className="font-semibold text-[#0f172a] text-sm">{day.theme}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <CalendarDays className="w-3 h-3" />
                {!isNaN(date.getTime()) ? format(date, "EEE, MMM d") : `Day ${day.day}`}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#00a896" }}>
                <DollarSign className="w-3 h-3" />
                ${day.dailyCost}
              </span>
              <span className="text-slate-400 text-xs hidden sm:block">{day.mood}</span>
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-50">
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
    </div>
  );
}
