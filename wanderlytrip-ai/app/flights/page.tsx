"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, ArrowRight, Clock, Users, Search, AlertCircle, Sparkles, Bell, BellOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import type { FlightOffer } from "@/lib/amadeus";
import { saveFlightAlert, deleteFlightAlert, getUser } from "@/lib/supabase";

interface SearchResult {
  flights: FlightOffer[];
  demo: boolean;
  error?: string;
}

async function searchFlightsAction(params: {
  origin: string;
  destination: string;
  date: string;
  adults: number;
}): Promise<SearchResult> {
  const res = await fetch(
    `/api/flights?origin=${params.origin}&destination=${params.destination}&date=${params.date}&adults=${params.adults}`
  );
  const demo = res.headers.get("X-Demo-Mode") === "1";
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { flights: [], demo: false, error: body.error || "Failed to search flights" };
  }
  const flights = await res.json();
  return { flights, demo };
}

function skyscannerUrl(origin: string, destination: string, date: string): string {
  const d = date.replace(/-/g, "").slice(2);
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${d}/`;
}

function FlightSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="h-6 w-12 bg-slate-100 rounded" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-px w-24 bg-slate-100" />
          </div>
          <div className="h-6 w-12 bg-slate-100 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-16 bg-slate-100 rounded" />
          <div className="h-7 w-20 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const inputClass = "h-11 rounded-xl border-slate-200 bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

export default function FlightsPage() {
  const [isPending, startTransition] = useTransition();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [searched, setSearched] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ origin: "", destination: "", date: "", adults: 1 });
  const [trackedIds, setTrackedIds] = useState<Record<string, string>>({}); // flightId -> alertId
  const [trackingId, setTrackingId] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsDemo(false);
    startTransition(async () => {
      try {
        const result = await searchFlightsAction(form);
        setFlights(result.flights);
        setIsDemo(result.demo);
        setError(result.error ?? null);
      } catch (err) {
        setFlights([]);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSearched(true);
      }
    });
  }

  async function handleTrack(flight: FlightOffer) {
    const seg = flight.itineraries[0]?.segments[0];
    const flightKey = flight.id;

    if (trackedIds[flightKey]) {
      // Already tracked — remove alert
      try {
        await deleteFlightAlert(trackedIds[flightKey]);
        setTrackedIds(prev => { const n = { ...prev }; delete n[flightKey]; return n; });
      } catch { /* silent */ }
      return;
    }

    setTrackingId(flightKey);
    try {
      const user = await getUser();
      if (!user) { window.alert("Sign in to track flight prices."); return; }
      const saved = await saveFlightAlert({
        user_id: user.id,
        origin: seg?.departure.iataCode ?? form.origin,
        destination: seg?.arrival.iataCode ?? form.destination,
        departure_date: seg?.departure.at?.split("T")[0] ?? form.date,
        adults: form.adults,
      });
      setTrackedIds(prev => ({ ...prev, [flightKey]: saved.id }));
    } catch { /* silent */ } finally {
      setTrackingId(null);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-4">
            <Plane className="w-3 h-3" />
            Flight Search
          </div>
          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">Flights</h1>
          <p className="text-slate-500 mt-2">Search real-time flights via Amadeus</p>
        </motion.div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">From (IATA)</Label>
              <Input required placeholder="JFK" maxLength={3} value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })}
                className={`${inputClass} uppercase`} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">To (IATA)</Label>
              <Input required placeholder="NRT" maxLength={3} value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })}
                className={`${inputClass} uppercase`} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">Departure Date</Label>
              <Input required type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">Passengers</Label>
              <Input type="number" min={1} max={9} value={form.adults}
                onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
                className={inputClass} />
            </div>
          </div>
          <motion.button type="submit" disabled={isPending}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 transition-colors">
            <Search className="w-4 h-4" />
            {isPending ? "Searching..." : "Search Flights"}
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

        {/* Demo mode banner */}
        {!isPending && isDemo && flights.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 mb-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>AI-generated demo data</strong> — Add your{" "}
              <a href="https://developers.amadeus.com" target="_blank" rel="noopener noreferrer"
                className="underline font-medium">Amadeus API keys</a>{" "}
              to <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">.env.local</code> for live prices.
            </span>
          </motion.div>
        )}

        {/* Skeletons while loading */}
        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <FlightSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isPending && searched && flights.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No flights found</p>
            <p className="text-slate-400 text-sm mt-1">Try different airports or dates.</p>
          </div>
        )}

        {/* Results */}
        {!isPending && (
          <div className="space-y-4">
            {flights.map((flight, i) => {
              const seg = flight.itineraries[0]?.segments[0];
              const bookUrl = skyscannerUrl(
                seg?.departure.iataCode ?? form.origin,
                seg?.arrival.iataCode ?? form.destination,
                seg?.departure.at?.split("T")[0] ?? form.date
              );
              return (
                <motion.div key={flight.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[#0f172a] font-bold text-lg">{seg?.departure.iataCode}</p>
                        <p className="text-slate-400 text-xs">{seg?.departure.at?.split("T")[1]?.slice(0, 5)}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {flight.itineraries[0]?.duration?.replace("PT", "").toLowerCase()}
                        </div>
                        <div className="relative w-24 flex items-center">
                          <div className="w-full h-px bg-slate-200" />
                          <Plane className="w-3 h-3 text-slate-400 absolute left-1/2 -translate-x-1/2 -translate-y-0.5" />
                        </div>
                        <p className="text-slate-400 text-xs">{seg?.carrierCode}{seg?.number}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#0f172a] font-bold text-lg">{seg?.arrival.iataCode}</p>
                        <p className="text-slate-400 text-xs">{seg?.arrival.at?.split("T")[1]?.slice(0, 5)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#0f172a] font-bold text-2xl">${flight.price.total}</p>
                      <div className="flex items-center gap-1 text-slate-400 text-xs justify-end mt-0.5">
                        <Users className="w-3 h-3" />
                        {flight.numberOfBookableSeats} seats left
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <motion.a
                          href={bookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center gap-1 text-xs text-white bg-[#0f172a] px-3 py-1.5 rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
                        >
                          Book on Skyscanner <ArrowRight className="w-3 h-3" />
                        </motion.a>
                        <AnimatePresence>
                          <motion.button
                            key={trackedIds[flight.id] ? "tracked" : "untracked"}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => handleTrack(flight)}
                            disabled={trackingId === flight.id}
                            title={trackedIds[flight.id] ? "Stop tracking" : "Track price"}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                              trackedIds[flight.id]
                                ? "text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100"
                                : "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {trackedIds[flight.id]
                              ? <><Check className="w-3 h-3" /> Tracked</>
                              : trackingId === flight.id
                              ? <Bell className="w-3 h-3 animate-pulse" />
                              : <><Bell className="w-3 h-3" /> Track</>}
                          </motion.button>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
