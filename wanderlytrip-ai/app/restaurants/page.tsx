"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Search, Star, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  neighborhood: string;
  mustTry: string;
  vibe: string;
  tip: string;
}

function tripAdvisorUrl(name: string, destination: string): string {
  return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${name} ${destination}`)}`;
}

function RestaurantSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-white/10 rounded" />
          <div className="h-3 w-1/3 bg-white/10 rounded" />
        </div>
        <div className="h-5 w-8 bg-white/10 rounded" />
      </div>
      <div className="h-3 w-1/2 bg-white/10 rounded mb-3" />
      <div className="h-3 w-3/4 bg-white/10 rounded mb-3" />
      <div className="h-8 w-full bg-white/10 rounded-xl mb-3" />
      <div className="h-3 w-full bg-white/10 rounded" />
    </div>
  );
}

export default function RestaurantsPage() {
  const [destination, setDestination] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const [currentDestination, setCurrentDestination] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const dest = destination.trim();
    startTransition(async () => {
      const res = await fetch(`/api/restaurants?destination=${encodeURIComponent(dest)}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
        setCurrentDestination(dest);
      }
      setSearched(true);
    });
  }

  const PRICE_COLORS: Record<string, string> = {
    "$": "#86efac",
    "$$": "#fbbf24",
    "$$$": "#f472b6",
    "$$$$": "#00f5d4",
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <UtensilsCrossed className="w-6 h-6 text-[#00f5d4]" />
            <h1 className="text-3xl font-bold text-white">Restaurants</h1>
          </div>
          <p className="text-white/50">AI-curated dining picks for any destination</p>
        </motion.div>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-6 mb-8 flex gap-3">
          <Input required placeholder="Tokyo, Paris, New York..."
            value={destination} onChange={(e) => setDestination(e.target.value)}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-11 rounded-xl" />
          <motion.button type="submit" disabled={isPending} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-[#0a0a0a] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
            <Search className="w-4 h-4" />
            {isPending ? "Searching..." : "Search"}
          </motion.button>
        </form>

        {/* Skeletons */}
        {isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantSkeleton key={i} />)}
          </div>
        )}

        {!isPending && searched && restaurants.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Configure your /api/restaurants route to show AI-powered results</p>
          </div>
        )}

        {!isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r, i) => (
              <motion.div key={r.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{r.name}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{r.cuisine}</p>
                  </div>
                  <span className="font-bold text-sm" style={{ color: PRICE_COLORS[r.priceRange] || "#00f5d4" }}>
                    {r.priceRange}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3"
                        style={{ color: j < r.rating ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
                        fill={j < r.rating ? "#fbbf24" : "none"} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <MapPin className="w-3 h-3" />
                    {r.neighborhood}
                  </div>
                </div>

                <p className="text-white/60 text-xs mb-3 italic">{r.vibe}</p>

                <div className="p-3 rounded-xl bg-[#00f5d4]/8 border border-[#00f5d4]/15 mb-3">
                  <p className="text-[#00f5d4] text-xs font-medium">Must try: {r.mustTry}</p>
                </div>

                <p className="text-white/40 text-xs mb-4 flex-1">{r.tip}</p>

                <motion.a
                  href={tripAdvisorUrl(r.name, currentDestination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-[#0a0a0a] flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
                >
                  View on TripAdvisor <ArrowRight className="w-3 h-3" />
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
