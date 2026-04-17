"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Compass, Plus, Check } from "lucide-react";

const TYPE_CONFIG: Record<string, { emoji: string; label: string; bg: string }> = {
  tourist_attraction: { emoji: "🏛️", label: "Attraction",  bg: "#e0f2fe" },
  restaurant:         { emoji: "🍜", label: "Restaurant",  bg: "#fef3c7" },
  cafe:               { emoji: "☕", label: "Café",         bg: "#fdf4ff" },
  museum:             { emoji: "🖼️", label: "Museum",      bg: "#f0fdf4" },
  park:               { emoji: "🌿", label: "Park",         bg: "#dcfce7" },
  shopping_mall:      { emoji: "🛍️", label: "Shopping",   bg: "#fff7ed" },
  bar:                { emoji: "🍸", label: "Bar",          bg: "#fdf2f8" },
  night_club:         { emoji: "🎵", label: "Nightlife",   bg: "#f5f3ff" },
  art_gallery:        { emoji: "🎨", label: "Gallery",     bg: "#ecfdf5" },
  zoo:                { emoji: "🦁", label: "Zoo",          bg: "#fefce8" },
  aquarium:           { emoji: "🐠", label: "Aquarium",    bg: "#eff6ff" },
  place_of_worship:   { emoji: "⛩️", label: "Landmark",   bg: "#fff7ed" },
  natural_feature:    { emoji: "🏔️", label: "Nature",     bg: "#f0fdf4" },
  amusement_park:     { emoji: "🎡", label: "Amusement",  bg: "#fdf4ff" },
};

function getConfig(types: string[]) {
  for (const t of types) if (TYPE_CONFIG[t]) return TYPE_CONFIG[t];
  return { emoji: "📍", label: "Place", bg: "#f8fafc" };
}

interface Place {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  types: string[];
  lat: number;
  lng: number;
}

interface NearbyGemsProps {
  destination: string;
  /** Called when user clicks + on a place */
  onAddPlace?: (name: string) => void;
}

export default function NearbyGems({ destination, onAddPlace }: NearbyGemsProps) {
  const [places, setPlaces]   = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded]     = useState<Set<string>>(new Set());
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetched           = useRef("");

  useEffect(() => {
    const dest = destination.trim();
    if (dest.length < 3) { setPlaces([]); return; }
    if (dest === lastFetched.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      lastFetched.current = dest;
      setLoading(true);
      setAdded(new Set());
      try {
        const geoRes  = await fetch(`/api/geocode?address=${encodeURIComponent(dest)}`);
        const geoData = await geoRes.json();
        if (!geoData.coords) { setLoading(false); return; }
        const { lat, lng } = geoData.coords as { lat: number; lng: number };

        const placesRes  = await fetch(`/api/places?lat=${lat}&lng=${lng}&type=tourist_attraction&radius=3000`);
        const placesData = await placesRes.json();
        setPlaces((placesData.places ?? []).slice(0, 6));
      } catch {
        // silent fail — no Google Maps key or network error
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destination]);

  function handleAdd(place: Place) {
    setAdded(prev => new Set([...prev, place.id]));
    onAddPlace?.(place.name);
  }

  const dest = destination.trim();
  if (dest.length < 3) return null;
  if (!loading && places.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="nearby-gems"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl mx-auto mt-6 px-1"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-[#00a896]" />
          </div>
          <span className="text-[#0f172a] font-semibold text-sm">Nearby Gems</span>
          <span className="text-slate-400 text-xs">· {dest}</span>
        </div>

        {/* Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[90px] rounded-xl bg-slate-100 animate-pulse"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {places.map((place, i) => {
              const cfg     = getConfig(place.types);
              const isAdded = added.has(place.id);
              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className="relative bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  {/* Add button */}
                  {onAddPlace && (
                    <button
                      type="button"
                      onClick={() => handleAdd(place)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-[10px] font-bold"
                      style={
                        isAdded
                          ? { background: "#00a896", color: "#fff" }
                          : { background: "#f1f5f9", color: "#64748b" }
                      }
                      title={isAdded ? "Added" : "Add to itinerary"}
                    >
                      {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: cfg.bg }}
                    >
                      {cfg.emoji}
                    </div>
                    <p className="text-[#0f172a] text-[11px] font-semibold leading-snug line-clamp-2 pr-4">
                      {place.name}
                    </p>
                  </div>

                  {/* Type + rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{cfg.label}</span>
                    {place.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-slate-500 font-medium">
                          {place.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-slate-300 mt-3 text-center">
          Powered by Google Places
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
