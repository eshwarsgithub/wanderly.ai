"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, Calendar, DollarSign, Globe, Trash2, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { loadTrips, deleteTrip, getUser, type TripRecord } from "@/lib/supabase";
// Note: Supabase client is lazily initialized at runtime
import { Badge } from "@/components/ui/badge";

export default function SavedPage() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) {
        setUserId(user.id);
        const saved = await loadTrips(user.id);
        setTrips(saved);
      }
      setLoading(false);
    })();
  }, []);

  async function handleDelete(tripId: string) {
    await deleteTrip(tripId);
    setTrips((t) => t.filter((trip) => trip.id !== tripId));
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-6 h-6 text-[#00f5d4]" />
              <h1 className="text-3xl font-bold text-white">Saved Trips</h1>
            </div>
            <p className="text-white/50">Your curated travel collection</p>
          </div>
          <Link href="/generate">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#0a0a0a]"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
              <Plus className="w-4 h-4" />
              New Trip
            </motion.button>
          </Link>
        </motion.div>

        {/* Not logged in */}
        {!userId && !loading && (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Sign in to save trips</h3>
            <p className="text-white/40 mb-6">Create an account to save and access your itineraries anywhere.</p>
            <Link href="/auth/login">
              <button className="px-6 py-3 rounded-xl font-semibold text-[#0a0a0a]"
                style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                Sign In
              </button>
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {userId && !loading && trips.length === 0 && (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No saved trips yet</h3>
            <p className="text-white/40 mb-6">Generate your first AI trip and save it here.</p>
            <Link href="/generate">
              <button className="px-6 py-3 rounded-xl font-semibold text-[#0a0a0a]"
                style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                Create a Trip
              </button>
            </Link>
          </div>
        )}

        {/* Trip gallery */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} className="group relative glass rounded-2xl overflow-hidden hover:border-[#00f5d4]/20 transition-colors">
              {/* Card */}
              <Link href={`/trip/${trip.id}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{trip.destination}</h3>
                      <Badge className="mt-1 bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30 capitalize text-xs">
                        {trip.vibe}
                      </Badge>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#00f5d4]" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.start_date} → {trip.end_date}
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${trip.budget.toLocaleString()} budget
                    </div>
                  </div>

                  {trip.itinerary?.summary && (
                    <p className="text-white/40 text-xs mt-4 line-clamp-2">
                      {trip.itinerary.summary}
                    </p>
                  )}
                </div>
              </Link>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(trip.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
