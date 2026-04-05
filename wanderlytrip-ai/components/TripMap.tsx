"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import type { ItineraryDay, Activity } from "@/lib/ai-agent";

interface PinData {
  activity: Activity;
  day: number;
  lat: number;
  lng: number;
}

interface TripMapProps {
  destination: string;
  days: ItineraryDay[];
}

const DAY_COLORS = [
  "#00f5d4", "#f472b6", "#fbbf24", "#60a5fa",
  "#a78bfa", "#34d399", "#fb923c",
];

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
    );
    const data = await res.json();
    if (data.status === "OK" && data.results[0]) {
      return data.results[0].geometry.location;
    }
  } catch {
    // silent fail — map still shows, just without this pin
  }
  return null;
}

export default function TripMap({ destination, days }: TripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [pins, setPins] = useState<PinData[]>([]);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6762, lng: 139.6503 });

  useEffect(() => {
    if (!apiKey) { setLoading(false); return; }

    async function loadPins() {
      // Geocode the destination itself first for an accurate map center
      const destCoords = await geocodeAddress(destination);
      if (destCoords) setMapCenter(destCoords);

      const allActivities: Array<{ activity: Activity; day: number }> = [];
      for (const day of days) {
        for (const activity of day.activities) {
          allActivities.push({ activity, day: day.day });
        }
      }

      // Geocode up to 20 locations (avoid excessive API calls)
      const subset = allActivities.slice(0, 20);
      const results = await Promise.all(
        subset.map(async ({ activity, day }) => {
          const coords = await geocodeAddress(`${activity.location}, ${destination}`);
          if (!coords) return null;
          return { activity, day, ...coords } as PinData;
        })
      );

      setPins(results.filter(Boolean) as PinData[]);
      setLoading(false);
    }

    loadPins();
  }, [days, destination, apiKey]);

  if (!apiKey) {
    return (
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 h-48">
        <MapPin className="w-8 h-8 text-white/20" />
        <p className="text-white/30 text-xs text-center">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable the map
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#00f5d4]" />
        <span className="text-white text-sm font-medium">Activity Map</span>
        {loading && (
          <span className="text-white/30 text-xs ml-auto">Loading pins...</span>
        )}
      </div>

      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: "100%", height: "320px" }}
          defaultCenter={mapCenter}
          defaultZoom={12}
          mapId="wanderly-trip-map"
          colorScheme="DARK"
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
        >
          {pins.map((pin) => {
            const color = DAY_COLORS[(pin.day - 1) % DAY_COLORS.length];
            return (
              <AdvancedMarker
                key={`${pin.day}-${pin.activity.id}`}
                position={{ lat: pin.lat, lng: pin.lng }}
                onClick={() => setSelectedPin(pin)}
              >
                <div
                  className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ background: color }}
                >
                  <span className="text-[10px] font-bold text-[#0a0a0a]">{pin.day}</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {selectedPin && (
            <InfoWindow
              position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
              onCloseClick={() => setSelectedPin(null)}
            >
              <div className="p-1 max-w-[180px]">
                <p className="font-semibold text-xs text-gray-900">{selectedPin.activity.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{selectedPin.activity.location}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Day {selectedPin.day} · {selectedPin.activity.time}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPin.activity.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-xs mt-1 block hover:underline"
                >
                  View on Maps →
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Day color legend */}
      {pins.length > 0 && (
        <div className="p-3 flex flex-wrap gap-2">
          {days.slice(0, 7).map((day) => (
            <div key={day.day} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: DAY_COLORS[(day.day - 1) % DAY_COLORS.length] }}
              />
              <span className="text-white/40 text-xs">Day {day.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
