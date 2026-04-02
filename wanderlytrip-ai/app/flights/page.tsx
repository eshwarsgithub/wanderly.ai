"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Plane, ArrowRight, Clock, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import type { FlightOffer } from "@/lib/amadeus";

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
  // Format: YYMMDD
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const results = await searchFlightsAction(form);
      setFlights(results);
      setSearched(true);
    });
  }

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

        {/* Skeletons while loading */}
        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <FlightSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isPending && searched && flights.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No flights found. Check your IATA codes and Amadeus API keys in .env.local</p>
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
                      <motion.a
                        href={bookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#0a0a0a] px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
                      >
                        Book on Skyscanner <ArrowRight className="w-3 h-3" />
                      </motion.a>
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
