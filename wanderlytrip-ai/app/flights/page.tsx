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
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdfb] border border-[#99f6e4] text-[#007a6a] text-xs font-medium mb-4">
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

        {/* Skeletons while loading */}
        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <FlightSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isPending && searched && flights.length === 0 && (
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
                          <Plane className="w-3 h-3 text-[#00a896] absolute left-1/2 -translate-x-1/2 -translate-y-0.5" />
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
                      <motion.a
                        href={bookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-white bg-[#0f172a] px-3 py-1.5 rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
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
