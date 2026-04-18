"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Globe, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import LoadingAnimation from "@/components/LoadingAnimation";
import NearbyGems from "@/components/NearbyGems";
import { generateTripAction, parseNLAction } from "@/app/actions/generate-itinerary";
import { VIBES } from "@/components/VibeSelector";
import type { DestinationStop } from "@/lib/ai-agent";

export default function TripForm({ defaultDestination = "" }: { defaultDestination?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMultiDest, setIsMultiDest] = useState(false);
  const [brief, setBrief] = useState("");
  const [parsing, setParsing] = useState(false);
  const briefTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stops, setStops] = useState<DestinationStop[]>([
    { city: "", days: 3 },
    { city: "", days: 3 },
  ]);

  const [form, setForm] = useState({
    destination: defaultDestination,
    startDate: "",
    endDate: "",
    budget: 3000,
    travelers: 2,
    vibe: "adventure",
  });

  useEffect(() => {
    if (defaultDestination) setForm((p) => ({ ...p, destination: defaultDestination }));
  }, [defaultDestination]);

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

  // Auto-parse natural language brief
  function handleBriefChange(val: string) {
    setBrief(val);
    if (briefTimeout.current) clearTimeout(briefTimeout.current);
    if (val.trim().length < 12) return;
    briefTimeout.current = setTimeout(async () => {
      setParsing(true);
      try {
        const res = await parseNLAction(val);
        if (res.success && res.partial) {
          setForm((prev) => ({
            ...prev,
            destination: res.partial.destination ?? prev.destination,
            startDate: res.partial.startDate ?? prev.startDate,
            endDate: res.partial.endDate ?? prev.endDate,
            budget: res.partial.budget ?? prev.budget,
            travelers: res.partial.travelers ?? prev.travelers,
            vibe: res.partial.vibe ?? prev.vibe,
          }));
        }
      } catch { /* ignore */ }
      setParsing(false);
    }, 900);
  }

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

      if (!result.success) { setError(result.error); return; }
      sessionStorage.setItem(`trip-${result.itinerary.id}`, JSON.stringify(result.itinerary));
      router.push(`/trip/${result.itinerary.id}`);
    });
  }

  // Derived preview values
  const previewDest = isMultiDest
    ? stops.filter((s) => s.city).map((s) => s.city).join(" · ") || "—"
    : form.destination || "—";
  const selectedVibe = VIBES.find((v) => v.id === form.vibe);
  const nightCount = form.startDate && form.endDate
    ? Math.max(0, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
    : null;

  // Section label style
  const sectionLabel: React.CSSProperties = {
    fontFamily: "var(--v-font-mono)",
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--v-slate-2)",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  // Underline input style
  const lineInput: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 0,
    outline: "none",
    width: "100%",
    fontFamily: "var(--v-font-ui)",
    fontSize: 15,
    color: "var(--v-ink)",
    padding: "8px 0",
    transition: "border-color 0.2s",
  };

  return (
    <>
      {isPending && <LoadingAnimation step={loadingStep} />}

      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 28, alignItems: "start" }}
          className="max-md:!grid-cols-1">

          {/* ── LEFT: Sections ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* i. The brief */}
            <div className="v-glass" style={{ padding: "24px 28px", borderRadius: 20 }}>
              <div style={sectionLabel}>
                <span style={{ fontFamily: "var(--v-font-display)", fontStyle: "italic", fontSize: 14, color: "var(--v-violet-2)" }}>i.</span>
                The brief
                {parsing && <span style={{ fontSize: 9, opacity: 0.5 }}>parsing…</span>}
              </div>
              <textarea
                value={brief}
                onChange={(e) => handleBriefChange(e.target.value)}
                placeholder={"Ten days in Kyoto, late April. Two adults, obsessed with temples and kaiseki dining…"}
                rows={3}
                style={{
                  width: "100%", background: "transparent", border: "none", outline: "none", resize: "none",
                  fontFamily: "var(--v-font-display)", fontSize: 18, fontWeight: 300, lineHeight: 1.6,
                  color: "var(--v-ink)", letterSpacing: "-0.01em",
                }}
              />
              <p style={{ fontSize: 11, fontFamily: "var(--v-font-mono)", color: "var(--v-slate-2)", opacity: 0.6, marginTop: 8 }}>
                Optional — AI will auto-fill fields below
              </p>
            </div>

            {/* ii. Where & when */}
            <div className="v-glass" style={{ padding: "24px 28px", borderRadius: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={sectionLabel}>
                  <span style={{ fontFamily: "var(--v-font-display)", fontStyle: "italic", fontSize: 14, color: "var(--v-violet-2)" }}>ii.</span>
                  Where &amp; when
                </div>
                <button
                  type="button"
                  onClick={() => setIsMultiDest(!isMultiDest)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 999, fontSize: 11,
                    fontFamily: "var(--v-font-mono)", letterSpacing: "0.06em",
                    border: "1px solid rgba(124,92,255,0.25)",
                    background: isMultiDest ? "rgba(0,0,0,0.08)" : "transparent",
                    color: isMultiDest ? "#0f0f0f" : "var(--v-slate-2)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <Globe size={11} /> Multi-city
                </button>
              </div>

              {!isMultiDest ? (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--v-slate-2)", opacity: 0.7 }}>Destination</label>
                  <input
                    required
                    placeholder="Tokyo · Bali · Paris · New York"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    style={lineInput}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--v-ink)")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)")}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  {stops.map((stop, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                        background: "#0f0f0f",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 10, fontWeight: 700,
                      }}>{i + 1}</div>
                      <input
                        required={isMultiDest}
                        placeholder={`City ${i + 1}`}
                        value={stop.city}
                        onChange={(e) => updateStop(i, "city", e.target.value)}
                        style={{ ...lineInput, flex: 1 }}
                        onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--v-ink)")}
                        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)")}
                      />
                      <input
                        type="number" min={1} max={14} value={stop.days}
                        onChange={(e) => updateStop(i, "days", Number(e.target.value))}
                        style={{ ...lineInput, width: 36, textAlign: "center", fontSize: 13 }}
                      />
                      <span style={{ fontSize: 11, color: "var(--v-slate-2)", whiteSpace: "nowrap" }}>days</span>
                      {stops.length > 2 && (
                        <button type="button" onClick={() => removeStop(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--v-pink)", opacity: 0.7 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  {stops.length < 4 && (
                    <button type="button" onClick={addStop} style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      fontFamily: "var(--v-font-mono)", fontSize: 11,
                      color: "#64748b", letterSpacing: "0.06em",
                    }}>
                      <Plus size={11} /> Add city
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--v-slate-2)", opacity: 0.7 }}>Start date</label>
                  <input
                    required type="date"
                    value={form.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={{ ...lineInput, colorScheme: "light" } as React.CSSProperties}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--v-ink)")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)")}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--v-slate-2)", opacity: 0.7 }}>End date</label>
                  <input
                    required type="date"
                    value={form.endDate}
                    min={form.startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={{ ...lineInput, colorScheme: "light" } as React.CSSProperties}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--v-ink)")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(0,0,0,0.15)")}
                  />
                </div>
              </div>
            </div>

            {/* iii. The party · The envelope */}
            <div className="v-glass" style={{ padding: "24px 28px", borderRadius: 20 }}>
              <div style={sectionLabel}>
                <span style={{ fontFamily: "var(--v-font-display)", fontStyle: "italic", fontSize: 14, color: "var(--v-violet-2)" }}>iii.</span>
                The party · The envelope
              </div>

              {/* Travelers */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--v-slate-2)", opacity: 0.7, display: "block", marginBottom: 12 }}>Travelers</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n} type="button"
                      onClick={() => setForm({ ...form, travelers: n })}
                      style={{
                        width: 42, height: 42, borderRadius: 999,
                        border: "1px solid",
                        borderColor: form.travelers === n ? "#0f0f0f" : "rgba(0,0,0,0.12)",
                        background: form.travelers === n ? "#0f0f0f" : "transparent",
                        color: form.travelers === n ? "white" : "var(--v-slate-2)",
                        boxShadow: form.travelers === n ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
                        fontSize: 13, fontFamily: "var(--v-font-ui)", fontWeight: 500,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >{n}</button>
                  ))}
                  <span style={{ fontSize: 12, color: "var(--v-slate-2)", alignSelf: "center", fontFamily: "var(--v-font-ui)" }}>
                    person{form.travelers > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--v-slate-2)", opacity: 0.7 }}>Total budget</label>
                  <span style={{ fontFamily: "var(--v-font-display)", fontSize: 22, fontWeight: 300, color: "var(--v-ink)", letterSpacing: "-0.02em" }}>
                    ${form.budget.toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={500} max={20000} step={100}
                  value={[form.budget]}
                  onValueChange={(val) => setForm({ ...form, budget: Array.isArray(val) ? val[0] : val })}
                  className="[&_[role=slider]]:bg-[#0f0f0f] [&_[role=slider]]:border-[#0f0f0f] [&_.bg-primary]:bg-[#0f0f0f]"
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--v-font-mono)", fontSize: 9, letterSpacing: "0.08em", color: "var(--v-slate-2)", opacity: 0.5, textTransform: "uppercase" }}>
                  <span>Budget</span><span>Mid-range</span><span>Premium</span>
                </div>
              </div>
            </div>

            {/* iv. The temperament */}
            <div className="v-glass" style={{ padding: "24px 28px", borderRadius: 20 }}>
              <div style={sectionLabel}>
                <span style={{ fontFamily: "var(--v-font-display)", fontStyle: "italic", fontSize: 14, color: "var(--v-violet-2)" }}>iv.</span>
                The temperament
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {VIBES.map((vibe) => {
                  const isSelected = form.vibe === vibe.id;
                  const Icon = vibe.icon;
                  return (
                    <button
                      key={vibe.id} type="button"
                      onClick={() => setForm({ ...form, vibe: vibe.id })}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 12,
                        border: "1px solid",
                        borderColor: isSelected ? `${vibe.color}60` : "rgba(0,0,0,0.1)",
                        background: isSelected ? `${vibe.color}12` : "rgba(255,255,255,0.4)",
                        color: isSelected ? vibe.color : "var(--v-slate-2)",
                        fontFamily: "var(--v-font-ui)", fontSize: 12, fontWeight: 500,
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      <Icon size={13} style={{ color: isSelected ? vibe.color : "var(--v-slate-2)", flexShrink: 0 }} />
                      {vibe.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(232,67,147,0.06)", border: "1px solid rgba(232,67,147,0.2)", color: "#e84393", fontSize: 13, fontFamily: "var(--v-font-ui)" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit" disabled={isPending}
              whileHover={isPending ? {} : { scale: 1.01 }}
              whileTap={isPending ? {} : { scale: 0.99 }}
              className="v-btn v-btn-ink"
              style={{ width: "100%", padding: "16px 24px", fontSize: 14, gap: 10, justifyContent: "center" }}
            >
              <Sparkles size={15} />
              {isPending ? "Composing your journey…" : "Generate itinerary"}
            </motion.button>

            <p style={{ textAlign: "center", fontSize: 11, fontFamily: "var(--v-font-mono)", color: "var(--v-slate-2)", opacity: 0.5, letterSpacing: "0.06em" }}>
              Powered by Claude AI · ~20 seconds
            </p>
          </div>

          {/* ── RIGHT: Sticky preview ── */}
          <aside className="max-md:hidden" style={{ position: "sticky", top: 100 }}>
            <div style={{
              background: "rgba(26,22,48,0.92)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            }}>
              {/* Destination plate */}
              <div style={{
                aspectRatio: "3/2", position: "relative",
                background: "linear-gradient(135deg, rgba(124,92,255,0.5), rgba(110,195,255,0.3))",
                display: "flex", alignItems: "flex-end",
                padding: "20px 22px",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(124,92,255,0.4) 0%, transparent 60%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: "var(--v-font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Destination</div>
                  <div style={{ fontFamily: "var(--v-font-display)", fontSize: previewDest === "—" ? 28 : Math.min(28, 200 / Math.max(previewDest.length, 1)), fontWeight: 400, color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                    {previewDest}
                  </div>
                </div>
              </div>

              {/* Meta chips */}
              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {nightCount !== null && (
                    <span className="v-chip">
                      {nightCount} night{nightCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="v-chip">
                    {form.travelers} {form.travelers > 1 ? "travelers" : "traveler"}
                  </span>
                  {selectedVibe && (
                    <span className="v-chip" style={{ color: selectedVibe.color, borderColor: `${selectedVibe.color}40`, background: `${selectedVibe.color}12` }}>
                      {selectedVibe.label}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--v-font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Budget</span>
                  <span style={{ fontFamily: "var(--v-font-display)", fontSize: 24, fontWeight: 300, color: "white", letterSpacing: "-0.02em" }}>
                    ${form.budget.toLocaleString()}
                  </span>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                  <div style={{ fontFamily: "var(--v-font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    Ready to plan
                  </div>
                  <div style={{ fontFamily: "var(--v-font-display)", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    {form.destination
                      ? `Your journey to ${form.destination.split("·")[0].trim()} awaits.`
                      : "Fill in the details to begin your journey."}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>

      <NearbyGems destination={isMultiDest ? (stops[0]?.city ?? "") : form.destination} />
    </>
  );
}
