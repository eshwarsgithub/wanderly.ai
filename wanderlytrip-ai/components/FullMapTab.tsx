"use client";

import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { MapPin, UtensilsCrossed, Building2, Camera, Search, Navigation } from "lucide-react";
import type { ItineraryDay } from "@/lib/ai-agent";
import type { PlaceResult } from "@/lib/geocode";
import { geocodeAddress } from "@/lib/geocode";

type Layer = "itinerary" | "restaurants" | "hotels" | "attractions";

interface PinData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  day?: number;
  type: Layer;
  address?: string;
  rating?: number | null;
}

const LAYER_CONFIG: Record<Layer, { label: string; icon: typeof MapPin; color: string; placeType: string }> = {
  itinerary: { label: "Itinerary", icon: Navigation, color: "#00f5d4", placeType: "" },
  restaurants: { label: "Restaurants", icon: UtensilsCrossed, color: "#fb923c", placeType: "restaurant" },
  hotels: { label: "Hotels", icon: Building2, color: "#60a5fa", placeType: "lodging" },
  attractions: { label: "Attractions", icon: Camera, color: "#f472b6", placeType: "tourist_attraction" },
};

const DAY_COLORS = ["#00f5d4", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa", "#34d399", "#fb923c"];

function MapLayers({
  pins,
  layer,
}: {
  pins: PinData[];
  layer: Layer;
}) {
  const [selected, setSelected] = useState<PinData | null>(null);
  const map = useMap();

  function handleClick(pin: PinData) {
    setSelected(pin);
    map?.panTo({ lat: pin.lat, lng: pin.lng });
  }

  return (
    <>
      {pins.map((pin) => {
        const color =
          pin.type === "itinerary"
            ? DAY_COLORS[(( pin.day ?? 1) - 1) % DAY_COLORS.length]
            : LAYER_CONFIG[layer].color;

        return (
          <AdvancedMarker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleClick(pin)}
          >
            <div
              className="flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{
                width: pin.type === "itinerary" ? 28 : 24,
                height: pin.type === "itinerary" ? 28 : 24,
                borderRadius: "50%",
                background: color,
                border: "2px solid rgba(255,255,255,0.6)",
              }}
            >
              {pin.type === "itinerary" ? (
                <span className="text-[9px] font-bold text-[#0a0a0a]">{pin.day}</span>
              ) : (
                <MapPin className="w-3 h-3 text-white" />
              )}
            </div>
          </AdvancedMarker>
        );
      })}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-1 max-w-[180px]">
            <p className="font-semibold text-xs text-gray-900 leading-tight">{selected.name}</p>
            {selected.address && <p className="text-gray-400 text-xs mt-0.5">{selected.address}</p>}
            {selected.day && <p className="text-gray-400 text-xs mt-0.5">Day {selected.day}</p>}
            {selected.rating && (
              <p className="text-amber-500 text-xs mt-0.5">★ {selected.rating.toFixed(1)}</p>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-xs hover:underline mt-1 block"
            >
              View in Google Maps →
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function FullMapTab({
  destination,
  days,
}: {
  destination: string;
  days: ItineraryDay[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeLayer, setActiveLayer] = useState<Layer>("itinerary");
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 });
  const [pinsByLayer, setPinsByLayer] = useState<Partial<Record<Layer, PinData[]>>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Geocode destination center on mount
  useEffect(() => {
    geocodeAddress(destination).then((c) => {
      if (c) setMapCenter(c);
    });
  }, [destination]);

  // Load itinerary pins once
  useEffect(() => {
    if (!apiKey) return;
    async function loadItineraryPins() {
      const pins: PinData[] = [];
      const subset = days.flatMap((d) =>
        d.activities.slice(0, 3).map((a) => ({ activity: a, day: d.day }))
      ).slice(0, 24);

      await Promise.all(
        subset.map(async ({ activity, day }) => {
          const coords = await geocodeAddress(`${activity.location}, ${destination}`);
          if (coords) {
            pins.push({
              id: `itinerary-${day}-${activity.id}`,
              name: activity.name,
              lat: coords.lat,
              lng: coords.lng,
              day,
              type: "itinerary",
            });
          }
        })
      );
      setPinsByLayer((prev) => ({ ...prev, itinerary: pins }));
    }
    loadItineraryPins();
  }, [days, destination, apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load place layer when switching
  useEffect(() => {
    if (activeLayer === "itinerary" || pinsByLayer[activeLayer]) return;
    if (!apiKey) return;

    const { placeType } = LAYER_CONFIG[activeLayer];
    setLoading(true);

    fetch(`/api/places?lat=${mapCenter.lat}&lng=${mapCenter.lng}&type=${placeType}&radius=3000`)
      .then((r) => r.json())
      .then(({ places }: { places: PlaceResult[] }) => {
        const pins: PinData[] = (places ?? []).map((p) => ({
          id: `${activeLayer}-${p.id}`,
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          type: activeLayer,
          address: p.address,
          rating: p.rating,
        }));
        setPinsByLayer((prev) => ({ ...prev, [activeLayer]: pins }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeLayer, mapCenter, apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const coords = await geocodeAddress(`${searchQuery}, ${destination}`);
    if (coords) setMapCenter(coords);
  }

  if (!apiKey) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-200" />
        <p className="text-slate-500 text-sm font-medium mb-1">Map unavailable</p>
        <p className="text-slate-400 text-xs">
          Add <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env.local
        </p>
      </div>
    );
  }

  const currentPins = pinsByLayer[activeLayer] ?? [];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search locations in ${destination}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:border-[#00a896] transition-colors bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: "#0f172a" }}
        >
          Go
        </button>
      </form>

      {/* Layer toggles */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(Object.entries(LAYER_CONFIG) as [Layer, typeof LAYER_CONFIG[Layer]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isActive = activeLayer === key;
          return (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: isActive ? cfg.color : "#f1f5f9",
                color: isActive ? (key === "itinerary" ? "#0a0a0a" : "#ffffff") : "#64748b",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
              {!loading && pinsByLayer[key] && (
                <span
                  className="rounded-full px-1.5 text-[10px] font-bold"
                  style={{
                    background: isActive ? "rgba(0,0,0,0.15)" : "#e2e8f0",
                    color: isActive ? (key === "itinerary" ? "#0a0a0a" : "#ffffff") : "#64748b",
                  }}
                >
                  {pinsByLayer[key]?.length}
                </span>
              )}
              {loading && activeLayer === key && (
                <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
              )}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        <APIProvider apiKey={apiKey}>
          <Map
            style={{ width: "100%", height: "520px" }}
            defaultCenter={mapCenter}
            center={mapCenter}
            defaultZoom={13}
            mapId="wanderly-full-map"
            colorScheme="LIGHT"
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            streetViewControl
          >
            <MapLayers pins={currentPins} layer={activeLayer} />
          </Map>
        </APIProvider>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          {activeLayer === "itinerary" ? (
            days.slice(0, 7).map((d) => (
              <div key={d.day} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: DAY_COLORS[(d.day - 1) % DAY_COLORS.length] }}
                />
                <span className="text-slate-400 text-xs">Day {d.day}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: LAYER_CONFIG[activeLayer].color }}
              />
              <span className="text-slate-400 text-xs">
                {currentPins.length} {LAYER_CONFIG[activeLayer].label.toLowerCase()} shown
              </span>
            </div>
          )}
          <span className="text-slate-300 text-xs ml-auto">Click any pin for details</span>
        </div>
      </div>
    </div>
  );
}
