"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, DollarSign, Lightbulb, Timer, ExternalLink, GripVertical, RefreshCw } from "lucide-react";
import type { Activity } from "@/lib/ai-agent";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  food:          { bg: "#fef3c7", text: "#92400e", border: "#fde68a", label: "Food" },
  activity:      { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe", label: "Activity" },
  transport:     { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd", label: "Transport" },
  accommodation: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", label: "Stay" },
  sightseeing:   { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8", label: "Sightseeing" },
};

// Categories that benefit from booking links
const BOOKABLE = new Set(["food", "activity", "sightseeing"]);

interface ItineraryCardProps {
  activity: Activity;
  index: number;
  isLast: boolean;
  isDraggable?: boolean;
  onSwap?: () => void;
  isSwapping?: boolean;
}

function BookingLinks({ activity }: { activity: Activity }) {
  if (!BOOKABLE.has(activity.category)) return null;

  const query = encodeURIComponent(`${activity.name} ${activity.location}`);
  const nameQuery = encodeURIComponent(activity.name);

  const links = [
    {
      label: "Viator",
      href: `https://www.viator.com/searchResults/all?text=${query}`,
      color: "#189fc1",
    },
    {
      label: "GetYourGuide",
      href: `https://www.getyourguide.com/s/?q=${query}`,
      color: "#FF5533",
    },
    {
      label: "TripAdvisor",
      href: `https://www.tripadvisor.com/Search?q=${nameQuery}`,
      color: "#34e0a1",
    },
  ];

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-center gap-1.5 flex-wrap">
      <span className="text-slate-300 text-[10px] font-medium mr-1">Book:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold hover:opacity-80 transition-opacity"
          style={{ background: link.color + "15", color: link.color, border: `1px solid ${link.color}30` }}
        >
          {link.label}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ))}
    </div>
  );
}

export default function ItineraryCard({ activity, index, isLast, isDraggable = false, onSwap, isSwapping = false }: ItineraryCardProps) {
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
      <div className="flex-1 pb-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
          {/* Drag handle + header row */}
          <div className="flex items-start gap-2 mb-2">
            {isDraggable && (
              <div className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onSwap && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSwap(); }}
                      disabled={isSwapping}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 disabled:cursor-wait px-1.5 py-0.5 rounded-full hover:bg-slate-100"
                      title="Swap with AI alternative"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSwapping ? "animate-spin" : ""}`} />
                      {isSwapping ? "Finding…" : "Swap"}
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a]">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    {activity.estimatedCost}
                  </div>
                </div>
              </div>
              <h4 className="font-semibold text-[#0f172a] text-sm leading-snug">{activity.name}</h4>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-xs leading-relaxed mb-2.5">{activity.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            {activity.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-slate-500 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {activity.location}
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
              </a>
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
              <Lightbulb className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 italic leading-relaxed">{activity.tips}</p>
            </div>
          )}

          {/* Booking links */}
          <BookingLinks activity={activity} />
        </div>
      </div>
    </motion.div>
  );
}
