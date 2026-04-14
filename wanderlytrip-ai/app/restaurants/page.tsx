"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Search, Star, MapPin, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
          <div className="h-3 w-1/3 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-8 bg-slate-100 rounded" />
      </div>
      <div className="h-3 w-1/2 bg-slate-100 rounded mb-3" />
      <div className="h-3 w-3/4 bg-slate-100 rounded mb-3" />
      <div className="h-8 w-full bg-slate-100 rounded-xl mb-3" />
      <div className="h-3 w-full bg-slate-100 rounded" />
    </div>
  );
}

const PRICE_BG: Record<string, { bg: string; text: string; border: string }> = {
  "$":    { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "$$":   { bg: "#fefce8", text: "#92400e", border: "#fde68a" },
  "$$$":  { bg: "#fdf4ff", text: "#86198f", border: "#f5d0fe" },
  "$$$$": { bg: "#f0fdfb", text: "#007a6a", border: "#99f6e4" },
};

export default function RestaurantsPage() {
  const [destination, setDestination] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const [currentDestination, setCurrentDestination] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const dest = destination.trim();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/restaurants?destination=${encodeURIComponent(dest)}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
          setCurrentDestination(dest);
        } else {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Failed to load restaurant recommendations");
          setRestaurants([]);
        }
      } catch (err) {
        setRestaurants([]);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSearched(true);
      }
    });
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdfb] border border-[#99f6e4] text-[#007a6a] text-xs font-medium mb-4">
            <UtensilsCrossed className="w-3 h-3" />
            AI-Curated Dining
          </div>
          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">Restaurants</h1>
          <p className="text-slate-500 mt-2">AI-curated dining picks for any destination</p>
        </motion.div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-8 flex gap-3">
          <Input required placeholder="Tokyo, Paris, New York..."
            value={destination} onChange={(e) => setDestination(e.target.value)}
            className="flex-1 h-11 rounded-xl border-slate-200 bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]" />
          <motion.button type="submit" disabled={isPending}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 transition-colors whitespace-nowrap">
            <Search className="w-4 h-4" />
            {isPending ? "Searching..." : "Search"}
          </motion.button>
        </form>

        {/* Error state */}
        {!isPending && error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Skeletons */}
        {isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <RestaurantSkeleton key={i} />)}
          </div>
        )}

        {!isPending && searched && restaurants.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No restaurants found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different destination.</p>
          </div>
        )}

        {!isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r, i) => {
              const price = PRICE_BG[r.priceRange] ?? PRICE_BG["$$"];
              return (
                <motion.div key={r.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }} whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-md hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-[#0f172a] font-semibold leading-tight">{r.name}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{r.cuisine}</p>
                    </div>
                    <span className="flex-shrink-0 ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: price.bg, color: price.text, border: `1px solid ${price.border}` }}>
                      {r.priceRange}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3"
                          style={{ color: j < r.rating ? "#f59e0b" : "#e2e8f0" }}
                          fill={j < r.rating ? "#f59e0b" : "#e2e8f0"} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin className="w-3 h-3" />
                      {r.neighborhood}
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs mb-3 italic leading-relaxed">{r.vibe}</p>

                  <div className="p-3 rounded-xl bg-[#f0fdfb] border border-[#99f6e4] mb-3">
                    <p className="text-[#007a6a] text-xs font-medium">Must try: {r.mustTry}</p>
                  </div>

                  <p className="text-slate-400 text-xs mb-4 flex-1 leading-relaxed">{r.tip}</p>

                  <motion.a
                    href={tripAdvisorUrl(r.name, currentDestination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0f172a] flex items-center justify-center gap-1.5 hover:bg-[#1e293b] transition-colors"
                  >
                    View on TripAdvisor <ArrowRight className="w-3 h-3" />
                  </motion.a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
