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
    <div className="glass rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-white/10 rounded" />
          <div className="h-3 w-1/3 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-16 bg-white/10 rounded" />
      </div>
      <div className="h-3 w-1/2 bg-white/10 rounded mb-4" />
      <div className="h-3 w-full bg-white/10 rounded mb-1" />
      <div className="h-3 w-2/3 bg-white/10 rounded mb-4" />
      <div className="h-9 w-full bg-white/10 rounded-xl" />
    </div>
  );
}

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
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-6 h-6 text-[#00f5d4]" />
            <h1 className="text-3xl font-bold text-white">Hotels</h1>
          </div>
          <p className="text-white/50">Real-time hotel availability via Amadeus</p>
        </motion.div>

        <form onSubmit={handleSearch} className="glass rounded-2xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">City Code (IATA)</Label>
              <Input required placeholder="TYO" maxLength={3} value={form.cityCode}
                onChange={(e) => setForm({ ...form, cityCode: e.target.value.toUpperCase() })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-11 rounded-xl uppercase" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Guests</Label>
              <Input type="number" min={1} max={9} value={form.adults}
                onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-11 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Check-in</Label>
              <Input required type="date" value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-11 rounded-xl [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Check-out</Label>
              <Input required type="date" value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-11 rounded-xl [color-scheme:dark]" />
            </div>
          </div>
          <motion.button type="submit" disabled={isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[#0a0a0a] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
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
          <div className="text-center py-12 text-white/40">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hotels found. Check your city code and Amadeus API keys in .env.local</p>
          </div>
        )}

        {!isPending && (
          <div className="grid sm:grid-cols-2 gap-4">
            {hotels.map((hotel, i) => {
              const offer = hotel.offers[0];
              const city = hotel.hotel.address?.cityName ?? "";
              return (
                <motion.div key={hotel.hotel.hotelId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 hover:border-[#00f5d4]/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{hotel.hotel.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: Number(hotel.hotel.rating) || 3 }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 text-[#fbbf24] fill-current" />
                        ))}
                      </div>
                    </div>
                    {offer && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#00f5d4] font-bold text-lg">
                          <DollarSign className="w-4 h-4" />
                          {offer.price.total}
                        </div>
                        <p className="text-white/30 text-xs">per stay</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40 text-xs mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>{city}, {hotel.hotel.address?.countryCode}</span>
                  </div>
                  {offer && (
                    <div className="text-white/50 text-xs mb-4 line-clamp-2">
                      {offer.room?.description?.text}
                    </div>
                  )}
                  <motion.a
                    href={bookingUrl(hotel.hotel.name, city, form.checkIn, form.checkOut)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0a] flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
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
