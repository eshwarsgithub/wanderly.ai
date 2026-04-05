"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, DollarSign, Lightbulb, Timer } from "lucide-react";
import type { Activity } from "@/lib/ai-agent";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  food:          { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Food" },
  activity:      { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe", label: "Activity" },
  transport:     { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd", label: "Transport" },
  accommodation: { bg: "#f0fdfb", text: "#065f46", border: "#99f6e4", label: "Stay" },
  sightseeing:   { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8", label: "Sightseeing" },
};

interface ItineraryCardProps {
  activity: Activity;
  index: number;
  isLast: boolean;
}

export default function ItineraryCard({ activity, index, isLast }: ItineraryCardProps) {
  const cat = CATEGORY_STYLES[activity.category] ?? CATEGORY_STYLES.activity;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex gap-4 group"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: cat.bg, borderColor: cat.border, color: cat.text }}
        >
          {index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1 mb-1 min-h-[16px]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
        <div className="bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
                >
                  {cat.label}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {activity.time}
                </span>
              </div>
              <h4 className="font-semibold text-[#0f172a] text-sm leading-snug">{activity.name}</h4>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] flex-shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              {activity.estimatedCost}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-xs leading-relaxed mb-2.5">{activity.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activity.location}
              </span>
            )}
            {activity.duration && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {activity.duration}
              </span>
            )}
          </div>

          {/* Tips */}
          {activity.tips && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#00a896] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 italic leading-relaxed">{activity.tips}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
