"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ItineraryDay } from "@/lib/ai-agent";

interface MoodBoardProps {
  day: ItineraryDay;
  destination: string;
}

// Generate Unsplash source URLs based on activity image queries
function getImageUrl(query: string, seed: number): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://source.unsplash.com/400x300/?${encodedQuery}&sig=${seed}`;
}

export default function MoodBoard({ day, destination }: MoodBoardProps) {
  const imageActivities = day.activities.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Day {day.day} Mood Board</h3>
        <p className="text-white/40 text-xs mt-0.5">{day.theme}</p>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 gap-0.5 p-0.5">
        {imageActivities.map((activity, index) => (
          <div key={activity.id} className="relative aspect-square overflow-hidden group">
            <Image
              src={getImageUrl(activity.imageQuery || `${destination} travel`, index)}
              alt={activity.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized // Unsplash source URLs are dynamic
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">{activity.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-white/30 text-xs">Activities</p>
          <p className="text-white font-semibold">{day.activities.length} planned</p>
        </div>
        <div>
          <p className="text-white/30 text-xs">Day cost</p>
          <p className="text-[#00f5d4] font-semibold">${day.dailyCost}</p>
        </div>
      </div>
    </motion.div>
  );
}
