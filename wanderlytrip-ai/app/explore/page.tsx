"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Calendar, DollarSign, Sparkles, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { loadPublicTrips, type TripRecord, type PublicTripsFilter } from "@/lib/supabase";

const VIBES = ["", "adventure", "culture", "food", "relaxation", "romantic", "luxury", "chill"];
const DURATIONS = [
  { label: "Any length", min: undefined, max: undefined },
  { label: "Weekend (1-3d)", min: 1, max: 3 },
  { label: "Week (4-7d)", min: 4, max: 7 },
  { label: "Long (8+d)", min: 8, max: undefined },
];

export default function ExplorePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [isPending, startTransition] = useTransition();
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const [durationIdx, setDurationIdx] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function fetchTrips() {
    const dur = DURATIONS[durationIdx];
    const filters: PublicTripsFilter = {
      vibe: vibe || undefined,
      destination: destination.trim() || undefined,
      minDays: dur.min,
      maxDays: dur.max,
    };
    setFetchError(null);
    startTransition(async () => {
      try {
        const data = await loadPublicTrips(filters);
        setTrips(data);
      } catch (err) {
        setTrips([]);
        setFetchError(err instanceof Error ? err.message : "Failed to load trips");
      }
    });
  }

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe, durationIdx]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTrips();
  }

  function handleForkTrip(trip: TripRecord) {
    try {
      forkTrip(trip);
    } catch {
      // silently ignore fork errors — navigation will handle it
    }
  }

  function forkTrip(trip: TripRecord) {
    const newId = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const forkedItinerary = { ...trip.itinerary, id: newId };
    sessionStorage.setItem(`trip-${newId}`, JSON.stringify(forkedItinerary));
    sessionStorage.setItem(`trip-${newId}-travelers`, String(trip.travelers));
    router.push(`/trip/${newId}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-6 h-6 text-[#00f5d4]" />
            <h1 className="text-3xl font-bold text-white">Explore Trips</h1>
          </div>
          <p className="text-white/50">Browse public itineraries and use them as inspiration</p>
        </motion.div>

        {/* Filters */}
        <div className="glass rounded-2xl p-6 mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Search destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-10 rounded-xl text-sm"
            />
            <motion.button type="submit" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-[#0a0a0a]"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
              <Search className="w-4 h-4" />
              Search
            </motion.button>
          </form>

          {/* Vibe filter */}
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button key={v || "all"} onClick={() => setVibe(v)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all"
                style={{
                  background: vibe === v ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.05)",
                  color: vibe === v ? "#00f5d4" : "rgba(255,255,255,0.5)",
                  border: vibe === v ? "1px solid rgba(0,245,212,0.3)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {v || "All vibes"}
              </button>
            ))}
          </div>

          {/* Duration filter */}
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d, i) => (
              <button key={d.label} onClick={() => setDurationIdx(i)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: durationIdx === i ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.05)",
                  color: durationIdx === i ? "#00f5d4" : "rgba(255,255,255,0.5)",
                  border: durationIdx === i ? "1px solid rgba(0,245,212,0.3)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {isPending && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isPending && fetchError && (
          <div className="text-center py-16">
            <Globe className="w-10 h-10 text-red-400/60 mx-auto mb-4" />
            <p className="text-white/60 font-medium">{fetchError}</p>
          </div>
        )}

        {/* Empty state */}
        {!isPending && !fetchError && trips.length === 0 && (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No public trips yet</h3>
            <p className="text-white/40 mb-6">Be the first to share a trip with the community!</p>
            <Link href="/generate">
              <button className="px-6 py-3 rounded-xl font-semibold text-[#0a0a0a]"
                style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                Create a Trip
              </button>
            </Link>
          </div>
        )}

        {/* Trip cards */}
        {!isPending && !fetchError && trips.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl overflow-hidden hover:border-[#00f5d4]/20 transition-colors flex flex-col">

                <Link href={`/trip/share/${trip.share_slug}`} className="flex-1">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{trip.destination}</h3>
                        <Badge className="mt-1 bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30 capitalize text-xs">
                          {trip.vibe}
                        </Badge>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-[#00f5d4]" />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-white/50">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.itinerary?.totalDays} days
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${trip.budget.toLocaleString()} budget
                      </div>
                    </div>

                    {trip.itinerary?.summary && (
                      <p className="text-white/40 text-xs line-clamp-2">{trip.itinerary.summary}</p>
                    )}
                  </div>
                </Link>

                {/* Use as template */}
                <div className="px-5 pb-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleForkTrip(trip)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#0a0a0a]"
                    style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
                  >
                    <Copy className="w-3 h-3" />
                    Use as Template
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const url = `${window.location.origin}/trip/share/${trip.share_slug}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)" }}
                    title="Copy link"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00f5d4]" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
