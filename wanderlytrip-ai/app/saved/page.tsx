"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, Calendar, DollarSign, Globe, Trash2, Plus, AlertTriangle, Bell, BellOff, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";
import { loadTrips, deleteTrip, getUser, loadFlightAlerts, deleteFlightAlert, type TripRecord, type FlightAlert } from "@/lib/supabase";

export default function SavedPage() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [flightAlerts, setFlightAlerts] = useState<FlightAlert[]>([]);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) {
        setUserId(user.id);
        const [saved, alerts] = await Promise.all([
          loadTrips(user.id),
          loadFlightAlerts(user.id).catch(() => [] as FlightAlert[]),
        ]);
        setTrips(saved);
        setFlightAlerts(alerts);
      }
      setLoading(false);
    })();
  }, []);

  async function handleDeleteAlert(id: string) {
    await deleteFlightAlert(id).catch(() => {});
    setFlightAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function handleDelete(tripId: string) {
    await deleteTrip(tripId);
    setTrips((t) => t.filter((trip) => trip.id !== tripId));
    setConfirmDeleteId(null);
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Bookmark className="w-5 h-5 text-slate-500" />
              <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Saved Trips</h1>
            </div>
            <p className="text-slate-500 text-sm">Your curated travel collection</p>
          </div>
          <Link href="/generate">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              New Trip
            </motion.button>
          </Link>
        </motion.div>

        {/* Not logged in */}
        {!userId && !loading && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Globe className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-[#0f172a] text-xl font-semibold mb-2">Sign in to save trips</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">Create an account to save and access your itineraries anywhere.</p>
            <Link href="/auth/login">
              <button className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {userId && !loading && trips.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Bookmark className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-[#0f172a] text-xl font-semibold mb-2">No saved trips yet</h3>
            <p className="text-slate-400 mb-6 text-sm">Generate your first AI trip and save it here.</p>
            <Link href="/generate">
              <button className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
                Create a Trip
              </button>
            </Link>
          </div>
        )}

        {/* Flight price alerts */}
        {userId && !loading && flightAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-amber-500" />
              <h2 className="text-[#0f172a] font-bold text-lg">Flight Alerts</h2>
              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100">
                {flightAlerts.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flightAlerts.map((alert) => (
                <div key={alert.id}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[#0f172a] font-bold text-sm">{alert.origin} → {alert.destination}</p>
                      <p className="text-slate-400 text-xs">{alert.departure_date} · {alert.adults} pax</p>
                    </div>
                  </div>
                  {alert.last_price != null ? (
                    <p className="text-slate-500 text-xs">Last seen: <span className="font-semibold text-[#0f172a]">${alert.last_price}</span></p>
                  ) : (
                    <p className="text-slate-400 text-xs italic">Awaiting first check…</p>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trip gallery */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <Link href={`/trip/${trip.id}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[#0f172a] font-bold text-lg leading-tight">{trip.destination}</h3>
                      <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.2)" }}>
                        {trip.vibe}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.start_date} → {trip.end_date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${trip.budget.toLocaleString()} budget
                    </div>
                  </div>

                  {trip.itinerary?.summary && (
                    <p className="text-slate-400 text-xs mt-4 line-clamp-2 leading-relaxed">
                      {trip.itinerary.summary}
                    </p>
                  )}
                </div>
              </Link>

              {/* Delete button / inline confirm */}
              {confirmDeleteId === trip.id ? (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 border border-red-200 shadow-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-slate-600 text-xs">Delete?</span>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors px-1"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(trip.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
