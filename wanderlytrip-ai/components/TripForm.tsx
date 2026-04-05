"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, DollarSign, Users, Sparkles, ArrowRight, Plus, Trash2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import VibeSelector from "@/components/VibeSelector";
import LoadingAnimation from "@/components/LoadingAnimation";
import { generateTripAction } from "@/app/actions/generate-itinerary";
import type { DestinationStop } from "@/lib/ai-agent";

export default function TripForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMultiDest, setIsMultiDest] = useState(false);
  const [stops, setStops] = useState<DestinationStop[]>([
    { city: "", days: 3 },
    { city: "", days: 3 },
  ]);

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 3000,
    travelers: 2,
    vibe: "adventure",
  });

  function addStop() {
    if (stops.length < 4) setStops([...stops, { city: "", days: 2 }]);
  }
  function removeStop(i: number) {
    if (stops.length > 2) setStops(stops.filter((_, idx) => idx !== i));
  }
  function updateStop(i: number, field: keyof DestinationStop, value: string | number) {
    const updated = [...stops];
    updated[i] = { ...updated[i], [field]: value };
    setStops(updated);
  }

  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => setLoadingStep((s) => s + 1), 3500);
    return () => clearInterval(interval);
  }, [isPending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingStep(0);
    startTransition(async () => {
      const primaryDestination = isMultiDest
        ? stops.map((s) => s.city).filter(Boolean).join(" · ")
        : form.destination;

      const result = await generateTripAction({
        destination: primaryDestination,
        destinations: isMultiDest ? stops.filter((s) => s.city) : undefined,
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
      sessionStorage.setItem(`trip-${result.itinerary.id}`, JSON.stringify(result.itinerary));
      router.push(`/trip/${result.itinerary.id}`);
    });
  }

  const inputClass = "h-11 rounded-xl border-slate-200 bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

  return (
    <>
      {isPending && <LoadingAnimation step={loadingStep} />}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-7 max-w-2xl mx-auto"
      >

        {/* Destination */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00a896]" />
              Where to?
            </Label>
            <button
              type="button"
              onClick={() => setIsMultiDest(!isMultiDest)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={
                isMultiDest
                  ? { background: "#f8fafc", borderColor: "#cbd5e1", color: "#0f172a" }
                  : { background: "transparent", borderColor: "#e2e8f0", color: "#94a3b8" }
              }
            >
              <Globe className="w-3 h-3" />
              Multi-city
            </button>
          </div>

          {!isMultiDest ? (
            <Input required placeholder="Tokyo, Bali, Paris, New York…" value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className={inputClass} />
          ) : (
            <div className="space-y-2">
              {stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{i + 1}</div>
                  <Input required={isMultiDest} placeholder={`City ${i + 1}`} value={stop.city}
                    onChange={(e) => updateStop(i, "city", e.target.value)}
                    className={`flex-1 ${inputClass}`} />
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 h-11">
                    <Input type="number" min={1} max={14} value={stop.days}
                      onChange={(e) => updateStop(i, "days", Number(e.target.value))}
                      className="w-10 bg-transparent border-0 text-[#0f172a] text-center text-sm p-0 h-auto focus-visible:ring-0" />
                    <span className="text-slate-400 text-xs whitespace-nowrap">days</span>
                  </div>
                  {stops.length > 2 && (
                    <button type="button" onClick={() => removeStop(i)}
                      className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {stops.length < 4 && (
                <button type="button" onClick={addStop}
                  className="flex items-center gap-1.5 text-[#00a896] hover:text-[#007a6a] text-sm transition-colors pt-1 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add city (max 4)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00a896]" />
              Start date
            </Label>
            <Input required type="date" value={form.startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className={`${inputClass} [color-scheme:light]`} />
          </div>
          <div className="space-y-2">
            <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00a896]" />
              End date
            </Label>
            <Input required type="date" value={form.endDate}
              min={form.startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className={`${inputClass} [color-scheme:light]`} />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#00a896]" />
              Total budget
            </Label>
            <span className="text-[#0f172a] font-bold text-base">${form.budget.toLocaleString()}</span>
          </div>
          <Slider min={500} max={20000} step={100} value={[form.budget]}
            onValueChange={(val) => setForm({ ...form, budget: Array.isArray(val) ? val[0] : val })}
            className="[&_[role=slider]]:bg-[#0f172a] [&_[role=slider]]:border-[#0f172a] [&_.bg-primary]:bg-[#0f172a]" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>$500</span><span>Budget</span><span>$10K</span><span>Premium</span><span>$20K</span>
          </div>
        </div>

        {/* Travelers */}
        <div className="space-y-3">
          <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00a896]" />
            Travelers
          </Label>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button"
                onClick={() => setForm({ ...form, travelers: n })}
                className="w-11 h-11 rounded-xl text-sm font-semibold transition-all border"
                style={
                  form.travelers === n
                    ? { background: "#0f172a", color: "#ffffff", borderColor: "#0f172a" }
                    : { background: "#ffffff", color: "#475569", borderColor: "#e2e8f0" }
                }
              >
                {n}
              </button>
            ))}
            <span className="text-slate-400 text-sm ml-1">person{form.travelers > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Vibe */}
        <div className="space-y-3">
          <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00a896]" />
            Your travel vibe
          </Label>
          <VibeSelector selected={form.vibe} onSelect={(vibe) => setForm({ ...form, vibe })} />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button type="submit" disabled={isPending}
          whileHover={isPending ? {} : { scale: 1.01 }}
          whileTap={isPending ? {} : { scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-base disabled:opacity-50 transition-all shadow-sm"
          style={{ background: "#0f172a", color: "#ffffff" }}
        >
          <Sparkles className="w-4 h-4" />
          {isPending ? "Generating your itinerary…" : "Generate My Itinerary"}
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </motion.button>

        <p className="text-center text-slate-400 text-xs">
          Powered by Claude AI · Takes ~20 seconds
        </p>
      </motion.form>
    </>
  );
}
