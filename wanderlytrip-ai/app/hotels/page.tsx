"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Building2, Star, MapPin, Search, DollarSign, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import type { HotelOffer } from "@/lib/amadeus";

async function searchHotelsAction(params: {
  cityCode: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}): Promise<HotelOffer[]> {
  const res = await fetch(
    `/api/hotels?cityCode=${params.cityCode}&checkIn=${params.checkIn}&checkOut=${params.checkOut}&adults=${params.adults}`
  );
  if (!res.ok) return [];
  return res.json();
}

function bookingUrl(hotelName: string, city: string, checkIn: string, checkOut: string): string {
  const query = encodeURIComponent(`${hotelName} ${city}`);
  return `https://www.booking.com/search.html?ss=${query}&checkin=${checkIn}&checkout=${checkOut}`;
}

function HotelSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="h-3 w-1/3 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded" />
      </div>
      <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
      <div className="h-3 w-full bg-slate-100 rounded mb-1" />
      <div className="h-3 w-2/3 bg-slate-100 rounded mb-4" />
      <div className="h-9 w-full bg-slate-100 rounded-xl" />
    </div>
  );
}

const inputClass = "h-11 rounded-xl border-slate-200 bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

export default function HotelsPage() {
  const [isPending, startTransition] = useTransition();
  const [hotels, setHotels] = useState<HotelOffer[]>([]);
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({ cityCode: "", checkIn: "", checkOut: "", adults: 2 });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const results = await searchHotelsAction(form);
      setHotels(results);
      setSearched(true);
    });
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdfb] border border-[#99f6e4] text-[#007a6a] text-xs font-medium mb-4">
            <Building2 className="w-3 h-3" />
            Hotel Search
          </div>
          <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">Hotels</h1>
          <p className="text-slate-500 mt-2">Real-time hotel availability via Amadeus</p>
        </motion.div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">City Code (IATA)</Label>
              <Input required placeholder="TYO" maxLength={3} value={form.cityCode}
                onChange={(e) => setForm({ ...form, cityCode: e.target.value.toUpperCase() })}
                className={`${inputClass} uppercase`} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">Guests</Label>
              <Input type="number" min={1} max={9} value={form.adults}
                onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
                className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">Check-in</Label>
              <Input required type="date" value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm">Check-out</Label>
              <Input required type="date" value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className={`${inputClass} [color-scheme:light]`} />
            </div>
          </div>
          <motion.button type="submit" disabled={isPending}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 transition-colors">
            <Search className="w-4 h-4" />
            {isPending ? "Searching..." : "Search Hotels"}
          </motion.button>
        </form>

        {/* Popular cities — shown before first search */}
        {!searched && !isPending && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Popular destinations</p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "TYO", label: "Tokyo" },
                { code: "PAR", label: "Paris" },
                { code: "NYC", label: "New York" },
                { code: "DXB", label: "Dubai" },
                { code: "BCN", label: "Barcelona" },
                { code: "BKK", label: "Bangkok" },
                { code: "ROM", label: "Rome" },
                { code: "SYD", label: "Sydney" },
              ].map((city) => (
                <motion.button
                  key={city.code}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cityCode: city.code }))}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-white/60 hover:text-white hover:border-[#00f5d4]/30 transition-all"
                >
                  <MapPin className="w-3 h-3 text-[#00f5d4]" />
                  {city.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skeletons */}
        {isPending && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <HotelSkeleton key={i} />)}
          </div>
        )}

        {!isPending && searched && hotels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No hotels found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different city code or dates.</p>
          </div>
        )}

        {!isPending && (
          <div className="grid sm:grid-cols-2 gap-4">
            {hotels.map((hotel, i) => {
              const offer = hotel.offers[0];
              const rating = Number(hotel.hotel.rating) || 0;
              const city = hotel.hotel.address?.cityName ?? "";
              return (
                <motion.div key={hotel.hotel.hotelId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-[#0f172a] font-semibold leading-tight">{hotel.hotel.name}</h3>
                      {rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: rating }).map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    {offer && (
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="flex items-center gap-0.5 text-[#0f172a] font-bold text-lg">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          {offer.price.total}
                        </div>
                        <p className="text-slate-400 text-xs">per stay</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{city}, {hotel.hotel.address?.countryCode}</span>
                  </div>
                  {offer && (
                    <div className="text-slate-500 text-xs mb-4 line-clamp-2 flex-1">
                      {offer.room?.description?.text}
                    </div>
                  )}
                  <motion.a
                    href={bookingUrl(hotel.hotel.name, city, form.checkIn, form.checkOut)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0f172a] flex items-center justify-center gap-1.5 hover:bg-[#1e293b] transition-colors mt-auto"
                  >
                    Book on Booking.com <ArrowRight className="w-3.5 h-3.5" />
                  </motion.a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
