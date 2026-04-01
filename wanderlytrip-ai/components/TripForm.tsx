"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, DollarSign, Users, Sparkles, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import VibeSelector from "@/components/VibeSelector";
import LoadingAnimation from "@/components/LoadingAnimation";
import { generateTripAction } from "@/app/actions/generate-itinerary";

export default function TripForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 3000,
    travelers: 2,
    vibe: "adventure",
  });

  // Cycle loading animation steps
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => s + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingStep(0);

    startTransition(async () => {
      const result = await generateTripAction({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget,
        travelers: form.travelers,
        vibe: form.vibe,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Store in sessionStorage and navigate to trip dashboard
      sessionStorage.setItem(`trip-${result.itinerary.id}`, JSON.stringify(result.itinerary));
      router.push(`/trip/${result.itinerary.id}`);
    });
  }

  return (
    <>
      {isPending && <LoadingAnimation step={loadingStep} />}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 space-y-8 max-w-2xl mx-auto"
      >
        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-white/80 font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00f5d4]" />
            Where are you going?
          </Label>
          <Input
            required
            placeholder="Tokyo, Bali, Paris, New York..."
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-12 rounded-xl text-base"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00f5d4]" />
              Start date
            </Label>
            <Input
              required
              type="date"
              value={form.startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-12 rounded-xl [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00f5d4]" />
              End date
            </Label>
            <Input
              required
              type="date"
              value={form.endDate}
              min={form.startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="bg-white/5 border-white/10 text-white focus:border-[#00f5d4]/50 h-12 rounded-xl [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-4">
          <Label className="text-white/80 font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00f5d4]" />
              Total budget
            </span>
            <span className="text-[#00f5d4] font-bold text-lg">
              ${form.budget.toLocaleString()}
            </span>
          </Label>
          <Slider
            min={500}
            max={20000}
            step={100}
            value={[form.budget]}
            onValueChange={(val) => setForm({ ...form, budget: Array.isArray(val) ? val[0] : val })}
            className="[&_[role=slider]]:bg-[#00f5d4] [&_[role=slider]]:border-[#00f5d4] [&_.bg-primary]:bg-[#00f5d4]"
          />
          <div className="flex justify-between text-white/30 text-xs">
            <span>$500 — Budget</span>
            <span>$10K — Premium</span>
            <span>$20K — Luxury</span>
          </div>
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <Label className="text-white/80 font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00f5d4]" />
            Travelers
          </Label>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <motion.button
                key={n}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setForm({ ...form, travelers: n })}
                className="w-12 h-12 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: form.travelers === n ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "rgba(255,255,255,0.05)",
                  color: form.travelers === n ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                  border: form.travelers === n ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {n}
              </motion.button>
            ))}
            <span className="text-white/40 text-sm">person{form.travelers > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Vibe */}
        <div className="space-y-4">
          <Label className="text-white/80 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00f5d4]" />
            Your travel vibe
          </Label>
          <VibeSelector
            selected={form.vibe}
            onSelect={(vibe) => setForm({ ...form, vibe })}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={isPending ? {} : { scale: 1.02 }}
          whileTap={isPending ? {} : { scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg text-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
        >
          <Sparkles className="w-5 h-5" />
          Generate My Itinerary
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <p className="text-center text-white/30 text-xs">
          Powered by Claude AI · Takes ~15 seconds
        </p>
      </motion.form>
    </>
  );
}
