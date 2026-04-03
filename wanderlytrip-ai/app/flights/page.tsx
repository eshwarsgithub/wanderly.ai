"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, ArrowRight, Clock, Users, Search, Bell, BellOff, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import type { FlightOffer } from "@/lib/amadeus";
import { getUser, createPriceAlert, loadPriceAlerts, deletePriceAlert, type PriceAlert } from "@/lib/supabase";

async function searchFlightsAction(params: {
  origin: string;
  destination: string;
  date: string;
  adults: number;
}): Promise<FlightOffer[]> {
  const res = await fetch(
    `/api/flights?origin=${params.origin}&destination=${params.destination}&date=${params.date}&adults=${params.adults}`
  );
  if (!res.ok) return [];
  return res.json();
}

function skyscannerUrl(origin: string, destination: string, date: string): string {
  const d = date.replace(/-/g, "").slice(2);
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${d}/`;
}

function FlightSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="h-6 w-12 bg-white/10 rounded" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-px w-24 bg-white/10" />
          </div>
          <div className="h-6 w-12 bg-white/10 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-16 bg-white/10 rounded" />
          <div className="h-7 w-20 bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function FlightsPage() {
  const [isPending, startTransition] = useTransition();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({ origin: "", destination: "", date: "", adults: 1 });
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) return;
      setUserId(user.id);
      const saved = await loadPriceAlerts(user.id);
      setAlerts(saved);
    })();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setTrackingId(null);
    startTransition(async () => {
      const results = await searchFlightsAction(form);
      setFlights(results);
      setSearched(true);
    });
  }

  async function handleTrackRoute() {
    if (!userId) { window.location.href = "/auth/login"; return; }
    const firstPrice = flights[0] ? parseFloat(flights[0].price.total) : null;
    const alert = await createPriceAlert({
      user_id: userId,
      origin: form.origin,
      destination: form.destination,
      travel_date: form.date,
      adults: form.adults,
      last_price: firstPrice,
    });
    setAlerts((a) => [alert, ...a]);
    setTrackingId(alert.id);
  }

  async function handleDeleteAlert(alertId: string) {
    await deletePriceAlert(alertId);
    setAlerts((a) => a.filter((x) => x.id !== alertId));
  }

  const isAlreadyTracked = alerts.some(
    (a) => a.origin === form.origin && a.destination === form.destination && a.travel_date === form.date
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Plane className="w-6 h-6 text-[#00f5d4]" />
            <h1 className="text-3xl font-bold text-white">Flights</h1>
          </div>
          <p className="text-white/50">Search real-time flights via Amadeus</p>
        </motion.div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="glass rounded-2xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">From (IATA)</Label>
              <Input required placeholder="JFK" maxLength={3} value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-11 rounded-xl uppercase" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">To (IATA)</Label>
              <Input required placeholder="NRT" maxLength={3} value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-11 rounded-xl uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Departure Date</Label>
              <Input required type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-11 rounded-xl [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Passengers</Label>
              <Input type="number" min={1} max={9} value={form.adults}
                onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-11 rounded-xl" />
            </div>
          </div>
          <motion.button type="submit" disabled={isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[#0a0a0a] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
            <Search className="w-4 h-4" />
            {isPending ? "Searching..." : "Search Flights"}
          </motion.button>
        </form>

        {/* Popular routes */}
        {!searched && !isPending && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Popular routes</p>
            <div className="flex flex-wrap gap-2">
              {[
                { from: "JFK", to: "NRT", label: "New York → Tokyo" },
                { from: "LAX", to: "CDG", label: "LA → Paris" },
                { from: "LHR", to: "DXB", label: "London → Dubai" },
                { from: "SFO", to: "SIN", label: "SF → Singapore" },
                { from: "ORD", to: "FCO", label: "Chicago → Rome" },
                { from: "BOS", to: "BCN", label: "Boston → Barcelona" },
              ].map((route) => (
                <motion.button key={route.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="button"
                  onClick={() => setForm((f) => ({ ...f, origin: route.from, destination: route.to }))}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-white/60 hover:text-white hover:border-[#00f5d4]/30 transition-all">
                  <Plane className="w-3 h-3 text-[#00f5d4]" />
                  {route.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <FlightSkeleton key={i} />)}
          </div>
        )}

        {!isPending && searched && flights.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No flights found. Check your IATA codes and Amadeus API keys in .env.local</p>
          </div>
        )}

        {/* Results + Track button */}
        {!isPending && flights.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/50 text-sm">{flights.length} flights found</p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTrackRoute}
                disabled={isAlreadyTracked}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-all"
                style={{
                  background: isAlreadyTracked ? "rgba(0,245,212,0.1)" : "rgba(0,245,212,0.15)",
                  border: "1px solid rgba(0,245,212,0.3)",
                  color: "#00f5d4",
                }}
              >
                {isAlreadyTracked ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                {isAlreadyTracked ? "Route tracked" : "Track this route"}
              </motion.button>
            </div>

            <AnimatePresence>
              {trackingId && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 text-[#00f5d4] text-sm flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Route saved! We&apos;ll track price changes for {form.origin} → {form.destination}.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {flights.map((flight, i) => {
                const seg = flight.itineraries[0]?.segments[0];
                const bookUrl = skyscannerUrl(
                  seg?.departure.iataCode ?? form.origin,
                  seg?.arrival.iataCode ?? form.destination,
                  seg?.departure.at?.split("T")[0] ?? form.date
                );
                return (
                  <motion.div key={flight.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-white font-bold text-lg">{seg?.departure.iataCode}</p>
                          <p className="text-white/40 text-xs">{seg?.departure.at?.split("T")[1]?.slice(0, 5)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2 text-white/40 text-xs">
                            <Clock className="w-3 h-3" />
                            {flight.itineraries[0]?.duration?.replace("PT", "").toLowerCase()}
                          </div>
                          <div className="w-24 h-px bg-gradient-to-r from-[#00f5d4]/30 via-[#00f5d4] to-[#00f5d4]/30 relative">
                            <Plane className="w-3 h-3 text-[#00f5d4] absolute -top-1.5 left-1/2 -translate-x-1/2" />
                          </div>
                          <p className="text-white/30 text-xs">{seg?.carrierCode}{seg?.number}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-lg">{seg?.arrival.iataCode}</p>
                          <p className="text-white/40 text-xs">{seg?.arrival.at?.split("T")[1]?.slice(0, 5)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00f5d4] font-bold text-xl">${flight.price.total}</p>
                        <div className="flex items-center gap-1 text-white/40 text-xs justify-end mt-1">
                          <Users className="w-3 h-3" />
                          {flight.numberOfBookableSeats} seats left
                        </div>
                        <motion.a href={bookUrl} target="_blank" rel="noopener noreferrer"
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-[#0a0a0a] px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                          Book on Skyscanner <ArrowRight className="w-3 h-3" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Tracked routes */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00f5d4]" />
              Tracked Routes
            </h2>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{alert.origin} → {alert.destination}</p>
                    <p className="text-white/40 text-xs mt-0.5">{alert.travel_date} · {alert.adults} pax{alert.last_price ? ` · Last seen $${alert.last_price}` : ""}</p>
                  </div>
                  <button onClick={() => handleDeleteAlert(alert.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
