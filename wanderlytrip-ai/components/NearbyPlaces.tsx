"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, ExternalLink } from "lucide-react";
import type { PlaceResult } from "@/lib/geocode";
import { haversineDistance } from "@/lib/geocode";

const TYPE_LABELS: Record<string, string> = {
  tourist_attraction: "Attraction",
  restaurant: "Restaurant",
  cafe: "Café",
  museum: "Museum",
  park: "Park",
  shopping_mall: "Shopping",
  bar: "Bar",
  night_club: "Nightlife",
  art_gallery: "Gallery",
  zoo: "Zoo",
  aquarium: "Aquarium",
  amusement_park: "Amusement",
  place_of_worship: "Landmark",
  church: "Church",
  mosque: "Mosque",
  hindu_temple: "Temple",
};

function getTypeLabel(types: string[]): string {
  for (const t of types) {
    if (TYPE_LABELS[t]) return TYPE_LABELS[t];
  }
  return "Place";
}

const FILTER_TYPES = [
  { key: "tourist_attraction" as const, label: "Attractions" },
  { key: "restaurant" as const, label: "Food" },
  { key: "cafe" as const, label: "Cafés" },
] as const;

interface NearbyPlacesProps {
  activityLocation: string;
  activityCoords: { lat: number; lng: number } | null;
  destination: string;
  onPlacesChange?: (places: PlaceResult[]) => void;
}

export default function NearbyPlaces({
  activityLocation,
  activityCoords,
  onPlacesChange,
}: NearbyPlacesProps) {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"tourist_attraction" | "restaurant" | "cafe">("tourist_attraction");

  useEffect(() => {
    if (!activityCoords) {
      setPlaces([]);
      onPlacesChange?.([]);
      return;
    }
    setLoading(true);
    setPlaces([]);
    fetch(
      `/api/places?lat=${activityCoords.lat}&lng=${activityCoords.lng}&type=${type}&radius=1500`
    )
      .then((r) => r.json())
      .then(({ places: p }) => {
        const result = p ?? [];
        setPlaces(result);
        onPlacesChange?.(result);
      })
      .catch(() => {
        setPlaces([]);
        onPlacesChange?.([]);
      })
      .finally(() => setLoading(false));
  }, [activityCoords, type]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activityCoords) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-200" />
        <p className="text-slate-400 text-sm">Select an activity above to explore nearby places</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">
        Near <span className="font-medium text-slate-600">{activityLocation}</span>
      </p>

      {/* Type filter */}
      <div className="flex gap-2 mb-4">
        {FILTER_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: type === t.key ? "#0f172a" : "#f1f5f9",
              color: type === t.key ? "#ffffff" : "#64748b",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-6">
          <MapPin className="w-5 h-5 mx-auto mb-1 text-slate-200" />
          <p className="text-slate-400 text-xs">No places found nearby</p>
        </div>
      ) : (
        <div className="space-y-2">
          {places.map((place, i) => (
            <motion.a
              key={place.id}
              href={`https://www.google.com/maps/place/?q=place_id:${place.id}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0f172a] text-sm truncate">{place.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{getTypeLabel(place.types)}</span>
                  {place.rating !== null && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                  {activityCoords && (
                    <span className="text-xs text-slate-300">
                      {haversineDistance(activityCoords.lat, activityCoords.lng, place.lat, place.lng)}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
