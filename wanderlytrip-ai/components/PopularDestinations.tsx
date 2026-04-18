"use client";

import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/images";

const DESTINATIONS = [
  {
    name: "Tokyo",
    country: "Japan",
    imageQuery: "tokyo japan cityscape night",
    bestSeason: "Spring",
    budgetRange: "$1,800–$3,500",
    vibes: ["culture", "food", "adventure"],
    seed: 10,
  },
  {
    name: "Bali",
    country: "Indonesia",
    imageQuery: "bali rice terraces temple",
    bestSeason: "Apr–Oct",
    budgetRange: "$800–$2,000",
    vibes: ["relaxation", "culture", "nature"],
    seed: 11,
  },
  {
    name: "Barcelona",
    country: "Spain",
    imageQuery: "barcelona architecture gaudi",
    bestSeason: "May–Jun",
    budgetRange: "$1,200–$2,800",
    vibes: ["culture", "food", "nightlife"],
    seed: 12,
  },
  {
    name: "New York",
    country: "USA",
    imageQuery: "new york city skyline manhattan",
    bestSeason: "Sep–Nov",
    budgetRange: "$2,500–$5,000",
    vibes: ["urban", "food", "culture"],
    seed: 13,
  },
  {
    name: "Marrakech",
    country: "Morocco",
    imageQuery: "marrakech souk medina morocco",
    bestSeason: "Mar–May",
    budgetRange: "$700–$1,800",
    vibes: ["culture", "adventure", "food"],
    seed: 14,
  },
  {
    name: "Santorini",
    country: "Greece",
    imageQuery: "santorini white buildings blue dome sunset",
    bestSeason: "Jun–Sep",
    budgetRange: "$1,500–$3,200",
    vibes: ["relaxation", "romance", "scenic"],
    seed: 15,
  },
  {
    name: "Bangkok",
    country: "Thailand",
    imageQuery: "bangkok thailand temple grand palace",
    bestSeason: "Nov–Feb",
    budgetRange: "$600–$1,500",
    vibes: ["food", "culture", "adventure"],
    seed: 16,
  },
  {
    name: "Patagonia",
    country: "Argentina",
    imageQuery: "patagonia mountains torres del paine",
    bestSeason: "Nov–Feb",
    budgetRange: "$2,000–$4,500",
    vibes: ["adventure", "nature", "scenic"],
    seed: 17,
  },
] as const;

const VIBE_COLORS: Record<string, string> = {
  culture: "#f8fafc",
  food: "#fef9c3",
  adventure: "#fce7f3",
  relaxation: "#ede9fe",
  nature: "#dcfce7",
  nightlife: "#1e293b",
  urban: "#f1f5f9",
  romance: "#fce7f3",
  scenic: "#e0f2fe",
};
const VIBE_TEXT: Record<string, string> = {
  culture: "#475569",
  food: "#92400e",
  adventure: "#9d174d",
  relaxation: "#5b21b6",
  nature: "#166534",
  nightlife: "#ffffff",
  urban: "#475569",
  romance: "#9d174d",
  scenic: "#075985",
};

export default function PopularDestinations() {
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: "#0a0a0a" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[#00f5d4] text-sm font-semibold tracking-widest uppercase mb-3">
            Popular Destinations
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Where will you go next?
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto">
            Click any destination to start planning your perfect trip instantly.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onClick={() =>
                router.push(`/generate?destination=${encodeURIComponent(`${dest.name}, ${dest.country}`)}`)
              }
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(dest.imageQuery, dest.seed)}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                {/* Vibes */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {dest.vibes.map((vibe) => (
                    <span
                      key={vibe}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: VIBE_COLORS[vibe] ?? "#f1f5f9",
                        color: VIBE_TEXT[vibe] ?? "#475569",
                      }}
                    >
                      {vibe}
                    </span>
                  ))}
                </div>

                {/* Name */}
                <h3 className="text-white font-bold text-xl leading-tight">
                  {dest.name}
                </h3>
                <p className="text-white/60 text-xs mt-0.5">{dest.country}</p>

                {/* Meta */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wide">Best</p>
                    <p className="text-white/80 text-xs font-medium">{dest.bestSeason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] uppercase tracking-wide">Budget</p>
                    <p className="text-white/80 text-xs font-medium">{dest.budgetRange}</p>
                  </div>
                </div>

                {/* Plan button */}
                <div className="mt-3 flex items-center gap-1.5 text-[#00f5d4] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Plan this trip
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
