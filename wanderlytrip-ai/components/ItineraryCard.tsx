"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, DollarSign, Lightbulb, RefreshCw } from "lucide-react";
import type { Activity } from "@/lib/ai-agent";

const CATEGORY_COLORS: Record<Activity["category"], string> = {
  food: "#fbbf24",
  activity: "#00f5d4",
  transport: "#38bdf8",
  accommodation: "#a78bfa",
  sightseeing: "#f472b6",
};

const CATEGORY_LABELS: Record<Activity["category"], string> = {
  food: "Food & Drink",
  activity: "Activity",
  transport: "Transport",
  accommodation: "Stay",
  sightseeing: "Sightseeing",
};

interface ItineraryCardProps {
  activity: Activity;
  index: number;
  isLast?: boolean;
  onSwap?: (activityId: string) => void;
  isSwapping?: boolean;
}

export default function ItineraryCard({
  activity,
  index,
  isLast = false,
  onSwap,
  isSwapping = false,
}: ItineraryCardProps) {
  const color = CATEGORY_COLORS[activity.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex gap-4 group"
    >
      {/* Timeline stem */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{
            background: `linear-gradient(135deg, ${color}33, ${color}15)`,
            border: `2px solid ${color}60`,
            boxShadow: `0 0 12px ${color}30`,
          }}
        >
          <Clock className="w-4 h-4" style={{ color }} />
        </motion.div>
        {!isLast && (
          <div className="w-px flex-1 mt-2" style={{ background: `linear-gradient(to bottom, ${color}40, transparent)` }} />
        )}
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        className="flex-1 glass rounded-2xl p-5 mb-4 cursor-default"
        style={{ borderColor: `${color}20` }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/40 text-xs font-mono">{activity.time}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${color}20`, color }}
              >
                {CATEGORY_LABELS[activity.category]}
              </span>
            </div>
            <h4 className="text-white font-semibold text-base leading-tight">{activity.name}</h4>
          </div>

          <div className="flex items-start gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 text-[#00f5d4] font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{activity.estimatedCost}</span>
              </div>
              <span className="text-white/30 text-xs">{activity.duration}</span>
            </div>

            {/* Swap button */}
            {onSwap && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSwap(activity.id)}
                disabled={isSwapping}
                title="Find alternatives"
                className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00f5d4] ${isSwapping ? "animate-spin" : ""}`} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed mb-3">{activity.description}</p>

        {/* Location */}
        <div className="flex items-start gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
          <span className="text-white/40 text-xs">{activity.location}</span>
        </div>

        {/* Tip */}
        {activity.tips && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: `${color}0d`, border: `1px solid ${color}20` }}
          >
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
            <p className="text-xs leading-relaxed" style={{ color: `${color}cc` }}>
              {activity.tips}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
