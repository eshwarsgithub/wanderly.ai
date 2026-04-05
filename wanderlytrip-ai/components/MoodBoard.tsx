"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ItineraryDay } from "@/lib/ai-agent";
import { getImageUrl } from "@/lib/images";

interface MoodBoardProps {
  day: ItineraryDay;
  destination: string;
}

export default function MoodBoard({ day, destination }: MoodBoardProps) {
  const imageActivities = day.activities.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-[#0f172a] font-semibold text-sm">Day {day.day} Mood Board</h3>
        <p className="text-slate-400 text-xs mt-0.5">{day.theme}</p>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 gap-0.5 bg-slate-100">
        {imageActivities.map((activity, index) => (
          <div key={activity.id} className="relative aspect-square overflow-hidden group">
            <Image
              src={getImageUrl(activity.imageQuery || `${destination} travel`, index)}
              alt={activity.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">{activity.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day stats */}
      <div className="px-4 py-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-xs">Activities</p>
          <p className="text-[#0f172a] font-semibold text-sm">{day.activities.length} planned</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Day cost</p>
          <p className="font-semibold text-sm" style={{ color: "#00a896" }}>${day.dailyCost}</p>
        </div>
      </div>
    </motion.div>
  );
}
