"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Calendar, DollarSign, Search, Copy, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { loadPublicTrips, type TripRecord, type PublicTripsFilter } from "@/lib/supabase";

const VIBES = ["", "adventure", "culture", "food", "relaxation", "romantic", "luxury", "chill"];
const DURATIONS = [
  { label: "Any length", min: undefined, max: undefined },
  { label: "Weekend (1–3d)", min: 1, max: 3 },
  { label: "Week (4–7d)", min: 4, max: 7 },
  { label: "Long (8+d)", min: 8, max: undefined },
];

// Deterministic plate gradient per destination initial
const PLATE_GRADIENTS = [
  "linear-gradient(135deg, rgba(124,92,255,0.55), rgba(110,195,255,0.35))",
  "linear-gradient(135deg, rgba(110,195,255,0.5), rgba(255,184,212,0.35))",
  "linear-gradient(135deg, rgba(255,184,212,0.5), rgba(124,92,255,0.35))",
  "linear-gradient(135deg, rgba(92,200,160,0.5), rgba(110,195,255,0.35))",
  "linear-gradient(135deg, rgba(255,184,100,0.45), rgba(255,184,212,0.35))",
  "linear-gradient(135deg, rgba(124,92,255,0.4), rgba(92,200,160,0.4))",
];
function plateGradient(s: string) {
  return PLATE_GRADIENTS[(s.charCodeAt(0) ?? 0) % PLATE_GRADIENTS.length];
}

export default function ExplorePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [isPending, startTransition] = useTransition();
  const [destination, setDestination] = useState("");
  const [vibe, setVibe] = useState("");
  const [durationIdx, setDurationIdx] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function fetchTrips() {
    const dur = DURATIONS[durationIdx];
    const filters: PublicTripsFilter = {
      vibe: vibe || undefined,
      destination: destination.trim() || undefined,
      minDays: dur.min,
      maxDays: dur.max,
    };
    setFetchError(null);
    startTransition(async () => {
      try {
        const data = await loadPublicTrips(filters);
        setTrips(data);
      } catch (err) {
        setTrips([]);
        setFetchError(err instanceof Error ? err.message : "Failed to load trips");
      }
    });
  }

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe, durationIdx]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTrips();
  }

  function forkTrip(trip: TripRecord) {
    const newId = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const forkedItinerary = { ...trip.itinerary, id: newId };
    sessionStorage.setItem(`trip-${newId}`, JSON.stringify(forkedItinerary));
    sessionStorage.setItem(`trip-${newId}-travelers`, String(trip.travelers));
    router.push(`/trip/${newId}`);
  }

  const chipActive: React.CSSProperties = {
    background: "#0f0f0f",
    color: "#ffffff",
    border: "1px solid #0f0f0f",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };
  const chipIdle: React.CSSProperties = {
    background: "rgba(255,255,255,0.5)",
    color: "var(--v-slate-2)",
    border: "1px solid rgba(124,92,255,0.12)",
  };

  return (
    <main className="aurora-page min-h-screen">
      <Navbar />

      <div className="v-shell" style={{ paddingTop: 112, paddingBottom: 80 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <div className="v-chip" style={{ marginBottom: 16 }}>
            <MapPin size={10} style={{ marginRight: 5 }} />
            Community Atlas
          </div>
          <h1 style={{
            fontFamily: "var(--v-font-display)",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            color: "var(--v-ink)",
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Explore{" "}
            <em style={{ color: "var(--v-violet-2)", fontStyle: "italic" }}>destinations</em>
          </h1>
          <p style={{ fontFamily: "var(--v-font-ui)", fontSize: 15, color: "var(--v-slate-2)", opacity: 0.8, lineHeight: 1.6 }}>
            Browse public itineraries crafted by the community — fork any to make it yours.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="v-glass" style={{ padding: "20px 24px", borderRadius: 20, marginBottom: 32 }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--v-slate-2)", opacity: 0.5 }} />
              <input
                placeholder="Search destination…"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{
                  width: "100%", paddingLeft: 34, paddingRight: 14, height: 40,
                  background: "rgba(255,255,255,0.6)", border: "1px solid rgba(124,92,255,0.15)",
                  borderRadius: 12, outline: "none", fontFamily: "var(--v-font-ui)", fontSize: 13,
                  color: "var(--v-ink)", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--v-violet)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(124,92,255,0.15)")}
              />
            </div>
            <button type="submit" className="v-btn v-btn-ink v-btn-sm" style={{ height: 40, paddingInline: 18 }}>
              Search
            </button>
          </form>

          {/* Vibe chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {VIBES.map((v) => (
              <button key={v || "all"} type="button" onClick={() => setVibe(v)}
                style={{
                  padding: "5px 13px", borderRadius: 999, fontSize: 11,
                  fontFamily: "var(--v-font-ui)", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s", textTransform: "capitalize",
                  ...(vibe === v ? chipActive : chipIdle),
                }}>
                {v || "All vibes"}
              </button>
            ))}
          </div>

          {/* Duration chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DURATIONS.map((d, i) => (
              <button key={d.label} type="button" onClick={() => setDurationIdx(i)}
                style={{
                  padding: "5px 13px", borderRadius: 999, fontSize: 11,
                  fontFamily: "var(--v-font-ui)", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s",
                  ...(durationIdx === i ? chipActive : chipIdle),
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {isPending && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ height: 220, borderRadius: 20, background: "rgba(124,92,255,0.06)", animation: "v-pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isPending && fetchError && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <Globe size={40} style={{ color: "rgba(232,67,147,0.4)", margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "var(--v-font-ui)", color: "var(--v-slate-2)" }}>{fetchError}</p>
          </div>
        )}

        {/* Empty state */}
        {!isPending && !fetchError && trips.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Globe size={48} style={{ color: "rgba(124,92,255,0.2)", margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--v-font-display)", fontSize: 24, fontWeight: 400, color: "var(--v-ink)", marginBottom: 10 }}>
              No public trips yet
            </h3>
            <p style={{ fontFamily: "var(--v-font-ui)", fontSize: 14, color: "var(--v-slate-2)", marginBottom: 24, opacity: 0.7 }}>
              Be the first to share a trip with the community.
            </p>
            <Link href="/generate" style={{ textDecoration: "none" }}>
              <button className="v-btn v-btn-ink">Create a Trip</button>
            </Link>
          </div>
        )}

        {/* Trip cards grid */}
        {!isPending && !fetchError && trips.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {trips.map((trip, i) => (
              <motion.div key={trip.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="v-glass"
                style={{ borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Plate header */}
                <Link href={`/trip/share/${trip.share_slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    aspectRatio: "16/7", background: plateGradient(trip.destination),
                    position: "relative", display: "flex", alignItems: "flex-end", padding: "14px 18px",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 35%, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
                    <div style={{ position: "relative" }}>
                      <div style={{ fontFamily: "var(--v-font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 3 }}>
                        {trip.itinerary?.country ?? "destination"}
                      </div>
                      <div style={{ fontFamily: "var(--v-font-display)", fontSize: 20, fontWeight: 400, color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        {trip.destination}
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px 18px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 999, fontSize: 10,
                        fontFamily: "var(--v-font-ui)", fontWeight: 500, textTransform: "capitalize",
                        background: "rgba(124,92,255,0.1)", color: "var(--v-violet)",
                        border: "1px solid rgba(124,92,255,0.25)",
                      }}>
                        {trip.vibe}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--v-font-ui)", fontSize: 12, color: "var(--v-slate-2)" }}>
                        <Calendar size={11} style={{ opacity: 0.6 }} />
                        {trip.itinerary?.totalDays} days
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--v-font-ui)", fontSize: 12, color: "var(--v-slate-2)" }}>
                        <DollarSign size={11} style={{ opacity: 0.6 }} />
                        ${trip.budget.toLocaleString()}
                      </div>
                    </div>

                    {trip.itinerary?.summary && (
                      <p style={{ fontFamily: "var(--v-font-ui)", fontSize: 12, color: "var(--v-slate-2)", opacity: 0.7, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {trip.itinerary.summary}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Actions */}
                <div style={{ padding: "0 18px 16px", display: "flex", gap: 8, marginTop: "auto" }}>
                  <button
                    onClick={() => forkTrip(trip)}
                    className="v-btn v-btn-ink v-btn-sm"
                    style={{ flex: 1, justifyContent: "center", gap: 6, fontSize: 12 }}
                  >
                    <Copy size={11} /> Use as template
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/trip/share/${trip.share_slug}`)}
                    title="Copy link"
                    style={{
                      width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(124,92,255,0.2)",
                      background: "rgba(124,92,255,0.06)", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "var(--v-violet)",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(124,92,255,0.12)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(124,92,255,0.06)")}
                  >
                    <Globe size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
