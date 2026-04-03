"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, DollarSign, Users, Sparkles, ChevronRight, Wand2, Loader2, UserCircle2, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import VibeSelector from "@/components/VibeSelector";
import LoadingAnimation from "@/components/LoadingAnimation";
import { generateTripAction, parseNLAction } from "@/app/actions/generate-itinerary";
import { getUser, loadProfile } from "@/lib/supabase";
import type { TravelerPersona } from "@/lib/ai-agent";

const PERSONAS: { value: TravelerPersona; label: string; emoji: string }[] = [
  { value: "solo", label: "Solo", emoji: "🧳" },
  { value: "couple", label: "Couple", emoji: "💑" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { value: "group", label: "Group", emoji: "🎉" },
];

export default function TripForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isParsingNL, startNLTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nlInput, setNlInput] = useState("");
  const [nlFilled, setNlFilled] = useState(false);
  const nlRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 3000,
    travelers: 2,
    vibe: "adventure",
    persona: "couple" as TravelerPersona,
    avoidTouristTraps: false,
    dietaryRestrictions: [] as string[],
  });

  // Pre-fill vibe from user profile
  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) return;
      const profile = await loadProfile(user.id);
      if (!profile) return;
      setForm((f) => ({
        ...f,
        vibe: profile.travel_style ?? f.vibe,
        dietaryRestrictions: profile.dietary ?? [],
      }));
    })();
  }, []);

  // Cycle loading steps
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => setLoadingStep((s) => s + 1), 3500);
    return () => clearInterval(interval);
  }, [isPending]);

  function handleParseNL() {
    if (!nlInput.trim() || isParsingNL) return;
    startNLTransition(async () => {
      const result = await parseNLAction(nlInput);
      if (result.success && result.partial) {
        setForm((f) => ({ ...f, ...result.partial }));
        setNlFilled(true);
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingStep(0);

    startTransition(async () => {
      // Fetch weather for near-future trips
      let weather;
      try {
        const startMs = new Date(form.startDate).getTime();
        const diffDays = Math.ceil((startMs - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5 && form.startDate) {
          const endMs = new Date(form.endDate).getTime();
          const tripDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
          const res = await fetch(
            `/api/weather?destination=${encodeURIComponent(form.destination)}&startDate=${form.startDate}&days=${tripDays}`
          );
          if (res.ok) {
            const data = await res.json();
            weather = data.weather;
          }
        }
      } catch {
        // weather is optional, continue without it
      }

      const result = await generateTripAction({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget,
        travelers: form.travelers,
        vibe: form.vibe,
        persona: form.persona,
        avoidTouristTraps: form.avoidTouristTraps,
        dietaryRestrictions: form.dietaryRestrictions.length > 0 ? form.dietaryRestrictions : undefined,
        weather,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      sessionStorage.setItem(`trip-${result.itinerary.id}`, JSON.stringify(result.itinerary));
      sessionStorage.setItem(`trip-${result.itinerary.id}-travelers`, String(form.travelers));
      router.push(`/trip/${result.itinerary.id}`);
    });
  }

  return (
    <>
      {isPending && <LoadingAnimation step={loadingStep} />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        {/* NL Input Section */}
        <div className="glass rounded-3xl p-6 space-y-3">
          <Label className="text-white/80 font-medium flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#00f5d4]" />
            Describe your dream trip
          </Label>
          <textarea
            rows={2}
            placeholder={`"2 weeks eating through SE Asia with my partner, $5k budget, avoid tourist traps..."`}
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            ref={nlRef}
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 rounded-xl p-3 text-sm resize-none outline-none transition-colors"
          />
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={handleParseNL}
              disabled={isParsingNL || !nlInput.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#0a0a0a] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
            >
              {isParsingNL ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isParsingNL ? "Parsing..." : "Parse with AI"}
            </motion.button>
            <span className="text-white/30 text-xs">or fill the form below</span>
          </div>

          <AnimatePresence>
            {nlFilled && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[#00f5d4] text-xs"
              >
                <Sparkles className="w-3 h-3" />
                Form pre-filled from your description — review and adjust below
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-8">
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

          {/* Persona */}
          <div className="space-y-2">
            <Label className="text-white/80 font-medium flex items-center gap-2">
              <UserCircle2 className="w-4 h-4 text-[#00f5d4]" />
              Traveler type
            </Label>
            <div className="flex items-center gap-3 flex-wrap">
              {PERSONAS.map((p) => (
                <motion.button
                  key={p.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, persona: p.value })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: form.persona === p.value ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "rgba(255,255,255,0.05)",
                    color: form.persona === p.value ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                    border: form.persona === p.value ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span>{p.emoji}</span>
                  {p.label}
                </motion.button>
              ))}
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

          {/* Avoid Tourist Traps Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, avoidTouristTraps: !form.avoidTouristTraps })}
              className="flex items-center gap-3 group"
            >
              <div
                className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{
                  background: form.avoidTouristTraps
                    ? "linear-gradient(135deg, #00f5d4, #00c4aa)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: form.avoidTouristTraps ? "22px" : "4px" }}
                />
              </div>
              <span className="flex items-center gap-1.5 text-white/70 text-sm group-hover:text-white transition-colors">
                <ShieldOff className="w-4 h-4 text-[#00f5d4]" />
                Avoid tourist traps — show me what locals love
              </span>
            </button>
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
        </form>
      </motion.div>
    </>
  );
}
