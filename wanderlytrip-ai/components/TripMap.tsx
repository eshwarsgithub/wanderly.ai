"use client";

import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin, Layers, Eye } from "lucide-react";
import type { ItineraryDay, Activity } from "@/lib/ai-agent";
import type { PlaceResult } from "@/lib/geocode";
import { geocodeAddress } from "@/lib/geocode";

interface PinData {
  activity: Activity;
  day: number;
  lat: number;
  lng: number;
}

interface PlaceDetail {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  openNow: boolean | null;
  summary: string;
  photoRef: string | null;
}

export interface TripMapProps {
  destination: string;
  days: ItineraryDay[];
  activeDayNumber?: number;
  nearbyPlaces?: PlaceResult[];
  highlightActivityCoords?: { lat: number; lng: number } | null;
}

const DAY_COLORS = [
  "#00f5d4", "#f472b6", "#fbbf24", "#60a5fa",
  "#a78bfa", "#34d399", "#fb923c",
];

function MapContent({
  pins,
  activeDayNumber,
  nearbyPlaces = [],
  highlightActivityCoords,
  showAttractions,
  attractionPins,
}: {
  pins: PinData[];
  activeDayNumber?: number;
  nearbyPlaces?: PlaceResult[];
  highlightActivityCoords?: { lat: number; lng: number } | null;
  showAttractions: boolean;
  attractionPins: PlaceResult[];
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [selectedNearby, setSelectedNearby] = useState<PlaceResult | null>(null);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [streetViewCoords, setStreetViewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Pan to highlighted activity
  useEffect(() => {
    if (map && highlightActivityCoords) {
      map.panTo(highlightActivityCoords);
      map.setZoom(15);
    }
  }, [map, highlightActivityCoords]);

  // Draw route polyline for active day
  useEffect(() => {
    if (!map || !mapsLib) return;

    // Clean up previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!activeDayNumber) return;

    const dayPins = pins
      .filter((p) => p.day === activeDayNumber)
      .sort((a, b) => a.activity.time.localeCompare(b.activity.time));

    if (dayPins.length < 2) return;

    const color = DAY_COLORS[(activeDayNumber - 1) % DAY_COLORS.length];
    const polyline = new mapsLib.Polyline({
      path: dayPins.map((p) => ({ lat: p.lat, lng: p.lng })),
      strokeColor: color,
      strokeOpacity: 0.55,
      strokeWeight: 2,
      geodesic: true,
    });
    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
      polylineRef.current = null;
    };
  }, [map, mapsLib, pins, activeDayNumber]);

  // Street view panel
  useEffect(() => {
    if (!streetViewCoords || !streetViewRef.current || !mapsLib) return;
    const panorama = new (mapsLib as unknown as typeof google.maps).StreetViewPanorama(
      streetViewRef.current,
      {
        position: streetViewCoords,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
      }
    );
    return () => {
      panorama.setVisible(false);
    };
  }, [streetViewCoords, mapsLib]);

  async function fetchPlaceDetail(placeId: string) {
    try {
      const res = await fetch(`/api/places/detail?placeId=${placeId}`);
      const data = await res.json();
      if (data.detail) setPlaceDetail(data.detail);
    } catch {
      // silent fail
    }
  }

  return (
    <>
      {/* Activity pins */}
      {pins.map((pin) => {
        const color = DAY_COLORS[(pin.day - 1) % DAY_COLORS.length];
        return (
          <AdvancedMarker
            key={`act-${pin.day}-${pin.activity.id}`}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => {
              setSelectedPin(pin);
              setSelectedNearby(null);
              setPlaceDetail(null);
            }}
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

      {/* Nearby place pins (amber) */}
      {nearbyPlaces.map((place) => (
        <AdvancedMarker
          key={`nearby-${place.id}`}
          position={{ lat: place.lat, lng: place.lng }}
          onClick={() => {
            setSelectedNearby(place);
            setSelectedPin(null);
            setPlaceDetail(null);
            fetchPlaceDetail(place.id);
          }}
        >
          <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white/40 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
            <span className="text-[9px] font-bold text-white">★</span>
          </div>
        </AdvancedMarker>
      ))}

      {/* Attraction pins (when layer is toggled on) */}
      {showAttractions &&
        attractionPins.map((place) => (
          <AdvancedMarker
            key={`attr-${place.id}`}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => {
              setSelectedNearby(place);
              setSelectedPin(null);
              setPlaceDetail(null);
              fetchPlaceDetail(place.id);
            }}
          >
            <div className="w-5 h-5 rounded-full bg-orange-400 border-2 border-white/40 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[8px] font-bold text-white">◆</span>
            </div>
          </AdvancedMarker>
        ))}

      {/* InfoWindow for activity pin */}
      {selectedPin && (
        <InfoWindow
          position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
          onCloseClick={() => { setSelectedPin(null); setStreetViewCoords(null); }}
        >
          <div className="p-1 max-w-[200px]">
            <p className="font-semibold text-xs text-gray-900">{selectedPin.activity.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{selectedPin.activity.location}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Day {selectedPin.day} · {selectedPin.activity.time}
            </p>
            <div className="flex gap-2 mt-1.5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPin.activity.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-xs hover:underline"
              >
                Maps →
              </a>
              <button
                onClick={() => setStreetViewCoords({ lat: selectedPin.lat, lng: selectedPin.lng })}
                className="text-teal-600 text-xs hover:underline"
              >
                Street View
              </button>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* InfoWindow for nearby/attraction pin */}
      {selectedNearby && (
        <InfoWindow
          position={{ lat: selectedNearby.lat, lng: selectedNearby.lng }}
          onCloseClick={() => { setSelectedNearby(null); setPlaceDetail(null); setStreetViewCoords(null); }}
        >
          <div className="p-1 max-w-[200px]">
            <p className="font-semibold text-xs text-gray-900">{selectedNearby.name}</p>
            {placeDetail ? (
              <>
                <p className="text-gray-500 text-xs mt-0.5">{placeDetail.address}</p>
                {placeDetail.openNow !== null && (
                  <p className={`text-xs mt-0.5 font-medium ${placeDetail.openNow ? "text-green-600" : "text-red-500"}`}>
                    {placeDetail.openNow ? "Open now" : "Closed"}
                  </p>
                )}
                {placeDetail.rating !== null && (
                  <p className="text-amber-500 text-xs mt-0.5">★ {placeDetail.rating.toFixed(1)}</p>
                )}
                {placeDetail.summary && (
                  <p className="text-gray-400 text-[11px] mt-1 leading-relaxed line-clamp-2">{placeDetail.summary}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-xs mt-0.5 animate-pulse">Loading details…</p>
            )}
            <div className="flex gap-2 mt-1.5">
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${selectedNearby.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-xs hover:underline"
              >
                Maps →
              </a>
              <button
                onClick={() => setStreetViewCoords({ lat: selectedNearby.lat, lng: selectedNearby.lng })}
                className="text-teal-600 text-xs hover:underline"
              >
                Street View
              </button>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Street View panel */}
      {streetViewCoords && (
        <div className="absolute bottom-0 left-0 right-0 h-40 z-10 rounded-b-2xl overflow-hidden">
          <div ref={streetViewRef} className="w-full h-full" />
          <button
            onClick={() => setStreetViewCoords(null)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default function TripMap({
  destination,
  days,
  activeDayNumber,
  nearbyPlaces = [],
  highlightActivityCoords,
}: TripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [pins, setPins] = useState<PinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6762, lng: 139.6503 });
  const [showAttractions, setShowAttractions] = useState(false);
  const [attractionPins, setAttractionPins] = useState<PlaceResult[]>([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);

  useEffect(() => {
    if (!apiKey) { setLoading(false); return; }

    async function loadPins() {
      const destCoords = await geocodeAddress(destination);
      if (destCoords) setMapCenter(destCoords);

      const allActivities: Array<{ activity: Activity; day: number }> = [];
      for (const day of days) {
        for (const activity of day.activities) {
          allActivities.push({ activity, day: day.day });
        }
      }

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

  async function toggleAttractions() {
    const next = !showAttractions;
    setShowAttractions(next);
    if (next && attractionPins.length === 0) {
      setLoadingAttractions(true);
      try {
        const res = await fetch(
          `/api/places?lat=${mapCenter.lat}&lng=${mapCenter.lng}&type=tourist_attraction&radius=3000`
        );
        const data = await res.json();
        setAttractionPins(data.places ?? []);
      } catch {
        // silent fail
      } finally {
        setLoadingAttractions(false);
      }
    }
  }

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
          <span className="text-white/30 text-xs ml-auto animate-pulse">Loading pins…</span>
        )}

        {/* Tourist attractions toggle */}
        <button
          onClick={toggleAttractions}
          disabled={loadingAttractions}
          title="Toggle tourist attractions layer"
          className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all disabled:opacity-50"
          style={{
            background: showAttractions ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
            color: showAttractions ? "#f59e0b" : "rgba(255,255,255,0.4)",
            border: showAttractions ? "1px solid rgba(251,191,36,0.3)" : "1px solid transparent",
          }}
        >
          {loadingAttractions ? (
            <Layers className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Layers className="w-3.5 h-3.5" />
          )}
          Attractions
        </button>
      </div>

      <div className="relative">
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
            <MapContent
              pins={pins}
              activeDayNumber={activeDayNumber}
              nearbyPlaces={nearbyPlaces}
              highlightActivityCoords={highlightActivityCoords}
              showAttractions={showAttractions}
              attractionPins={attractionPins}
            />
          </Map>
        </APIProvider>
      </div>

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
          {nearbyPlaces.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-white/40 text-xs">Nearby</span>
            </div>
          )}
        </div>
      )}

      {/* Street view hint */}
      {pins.length > 0 && (
        <div className="px-3 pb-2 flex items-center gap-1 text-white/20 text-[10px]">
          <Eye className="w-3 h-3" />
          Click any pin for Street View
        </div>
      )}
    </div>
  );
}
