"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Search, Star, MapPin, ArrowRight, ExternalLink } from "lucide-react";
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
  photoUrl?: string;
  placeId?: string;
}

function mapsUrl(r: Restaurant, destination: string): string {
  if (r.placeId) return `https://www.google.com/maps/place/?q=place_id:${r.placeId}`;
  return `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${r.name} ${destination}`)}`;
}

function RestaurantSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-32 bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-white/10 rounded" />
        <div className="h-3 w-1/3 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/10 rounded" />
        <div className="h-8 w-full bg-white/10 rounded-xl" />
      </div>
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
        setRestaurants(Array.isArray(data) ? data : []);
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
          <p className="text-white/50">Real dining picks powered by Google Places</p>
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

        {/* Popular destinations */}
        {!searched && !isPending && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Popular food destinations</p>
            <div className="flex flex-wrap gap-2">
              {["Tokyo", "Paris", "Bangkok", "New York", "Barcelona", "Istanbul", "Mexico City", "Osaka"].map((city) => (
                <motion.button key={city} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="button"
                  onClick={() => setDestination(city)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-white/60 hover:text-white hover:border-[#00f5d4]/30 transition-all">
                  <UtensilsCrossed className="w-3 h-3 text-[#00f5d4]" />
                  {city}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skeletons */}
        {isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantSkeleton key={i} />)}
          </div>
        )}

        {!isPending && searched && restaurants.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No restaurants found. Try a different destination.</p>
          </div>
        )}

        {!isPending && restaurants.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r, i) => (
              <motion.div key={r.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                className="glass rounded-2xl overflow-hidden flex flex-col">

                {/* Photo or placeholder */}
                {r.photoUrl ? (
                  <div className="h-32 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="h-16 bg-gradient-to-r from-[#00f5d4]/10 to-[#00c4aa]/5 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-[#00f5d4]/30" />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{r.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{r.cuisine}</p>
                    </div>
                    <span className="font-bold text-sm flex-shrink-0" style={{ color: PRICE_COLORS[r.priceRange] || "#00f5d4" }}>
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

                  <p className="text-white/60 text-xs mb-3 italic flex-1">{r.vibe}</p>

                  <div className="p-3 rounded-xl bg-[#00f5d4]/8 border border-[#00f5d4]/15 mb-3">
                    <p className="text-[#00f5d4] text-xs font-medium">Must try: {r.mustTry}</p>
                  </div>

                  <p className="text-white/40 text-xs mb-4">{r.tip}</p>

                  <motion.a
                    href={mapsUrl(r, currentDestination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-[#0a0a0a] flex items-center justify-center gap-1.5 mt-auto"
                    style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
                  >
                    {r.placeId ? (
                      <><ExternalLink className="w-3 h-3" /> View on Google Maps</>
                    ) : (
                      <><ArrowRight className="w-3 h-3" /> View on TripAdvisor</>
                    )}
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
