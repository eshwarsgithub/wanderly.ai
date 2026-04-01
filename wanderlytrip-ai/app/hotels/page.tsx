"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Building2, Star, MapPin, Search, DollarSign } from "lucide-react";
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

        {searched && hotels.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hotels found. Check your city code and Amadeus API keys in .env.local</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {hotels.map((hotel, i) => {
            const offer = hotel.offers[0];
            return (
              <motion.div key={hotel.hotel.hotelId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 hover:border-[#00f5d4]/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{hotel.hotel.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: Number(hotel.hotel.rating) || 3 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-[#fbbf24] fill-current" />
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
                  <span>{hotel.hotel.address?.cityName}, {hotel.hotel.address?.countryCode}</span>
                </div>
                {offer && (
                  <div className="text-white/50 text-xs mb-4 line-clamp-2">
                    {offer.room?.description?.text}
                  </div>
                )}
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0a]"
                  style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
                  Book Now
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
