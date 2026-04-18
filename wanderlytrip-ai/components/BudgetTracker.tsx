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
    pct < 60 ? "#00c4aa" : pct < 85 ? "#f59e0b" : "#ef4444";

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all"
      >
        <DollarSign className="w-5 h-5 text-slate-500" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-40 w-72 bg-white rounded-2xl border border-slate-200 shadow-lg p-5 max-w-[calc(100vw-2rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <span className="text-[#0f172a] font-semibold text-sm">Budget Tracker</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main total */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-slate-400 text-xs mb-1">Estimated spend</p>
            <p className="text-2xl font-bold text-[#0f172a]">
              {currency} {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Total budget</p>
            <p className="text-slate-500 font-semibold text-sm">
              {currency} {totalBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: barColor }}
          />
        </div>
        <p className="text-right text-xs mt-1 font-medium" style={{ color: barColor }}>
          {Math.round(pct)}% of budget
        </p>
      </div>

      {/* Per-day breakdown */}
      <div className="space-y-2">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Per day</p>
        {days.map((day, i) => {
          const dayPct = (day.dailyCost / (totalBudget / days.length)) * 100;
          return (
            <div key={day.day} className="flex items-center gap-3">
              <span className="text-slate-400 text-xs w-10 flex-shrink-0">Day {day.day}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dayPct, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: "#00c4aa", opacity: 0.6 + i * 0.05 }}
                />
              </div>
              <span className="text-slate-500 text-xs w-16 text-right flex-shrink-0">
                ${day.dailyCost}
              </span>
            </div>
          );
        })}
      </div>

      {totalSpent < totalBudget && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-slate-500 text-xs font-medium">
            ${(totalBudget - totalSpent).toLocaleString()} remaining for extras & shopping
          </p>
        </div>
      )}
    </motion.div>
  );
}
