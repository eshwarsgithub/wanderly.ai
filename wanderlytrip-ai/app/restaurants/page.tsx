"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Search, Star, MapPin, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { ChatAnthropic } from "@langchain/anthropic";

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

export default function RestaurantsPage() {
  const [destination, setDestination] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      // This runs on client — for prod, move to a Server Action / Route Handler
      const res = await fetch(`/api/restaurants?destination=${encodeURIComponent(destination)}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
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

        {searched && restaurants.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Configure your /api/restaurants route to show AI-powered results</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5">
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

              <p className="text-white/40 text-xs">{r.tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
