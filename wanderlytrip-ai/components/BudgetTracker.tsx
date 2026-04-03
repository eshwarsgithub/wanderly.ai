"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import type { GeneratedItinerary } from "@/lib/ai-agent";

interface BudgetTrackerProps {
  itinerary: GeneratedItinerary;
}

export default function BudgetTracker({ itinerary }: BudgetTrackerProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { days, totalBudget, currency } = itinerary;
  const totalSpent = days.reduce((sum, d) => sum + d.dailyCost, 0);
  const pct = Math.min((totalSpent / totalBudget) * 100, 100);

  const barColor =
    pct < 60 ? "#00f5d4" : pct < 85 ? "#fbbf24" : "#f87171";

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center teal-glow"
        style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
      >
        <DollarSign className="w-6 h-6 text-[#0a0a0a]" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-40 w-72 glass rounded-2xl p-5 teal-glow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00f5d4]" />
          <span className="text-white font-semibold text-sm">Budget Tracker</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main total */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-white/40 text-xs mb-1">Estimated spend</p>
            <p className="text-2xl font-bold text-white">
              {currency} {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs mb-1">Total budget</p>
            <p className="text-white/70 font-semibold">
              {currency} {totalBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}99)` }}
          />
        </div>
        <p className="text-right text-xs mt-1" style={{ color: barColor }}>
          {Math.round(pct)}% of budget
        </p>
      </div>

      {/* Per-day breakdown */}
      <div className="space-y-2">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Per day</p>
        {days.map((day, i) => {
          const dayPct = (day.dailyCost / (totalBudget / days.length)) * 100;
          return (
            <div key={day.day} className="flex items-center gap-3">
              <span className="text-white/40 text-xs w-10 flex-shrink-0">Day {day.day}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dayPct, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="h-full rounded-full bg-[#00f5d4]"
                  style={{ opacity: 0.6 + i * 0.05 }}
                />
              </div>
              <span className="text-white/60 text-xs w-16 text-right flex-shrink-0">
                ${day.dailyCost}
              </span>
            </div>
          );
        })}
      </div>

      {totalSpent < totalBudget && (
        <div className="mt-4 p-3 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20">
          <p className="text-[#00f5d4] text-xs font-medium">
            ${(totalBudget - totalSpent).toLocaleString()} remaining for extras & shopping
          </p>
        </div>
      )}
    </motion.div>
  );
}
