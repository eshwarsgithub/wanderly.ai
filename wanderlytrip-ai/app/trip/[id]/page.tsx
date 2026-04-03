"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, MapPin, Calendar, Users, DollarSign, Star, Package, Plane, ArrowLeft,
  BookmarkPlus, Check, AlertCircle, Share2, Loader2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import MoodBoard from "@/components/MoodBoard";
import BudgetTracker from "@/components/BudgetTracker";
import AIChatAssistant from "@/components/AIChatAssistant";
import TripMap from "@/components/TripMap";
import ExportButton from "@/components/ExportButton";
import CollaboratorPanel from "@/components/CollaboratorPanel";
import Navbar from "@/components/Navbar";
import type { GeneratedItinerary, Activity } from "@/lib/ai-agent";
import { saveTrip, loadTrip, getUser, publishTrip, generateSlug, subscribeToTrip, type TripRecord } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type SaveState = "idle" | "saving" | "saved" | "auto-saving" | "error";
type ShareState = "idle" | "sharing" | "shared";

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripRecord, setTripRecord] = useState<TripRecord | null>(null);
  const [travelers, setTravelers] = useState(1);
  const [activeTab, setActiveTab] = useState<"timeline" | "moodboard" | "packing">("timeline");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [, startShareTransition] = useTransition();

  // Cache user to avoid re-fetching on every auto-save
  const userRef = useRef<User | null>(null);
  const savedRef = useRef(false); // track if trip has been saved at least once

  useEffect(() => {
    (async () => {
      // Load user once
      const user = await getUser();
      userRef.current = user;

      const stored = sessionStorage.getItem(`trip-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as GeneratedItinerary;
        setItinerary(parsed);
        const storedTravelers = sessionStorage.getItem(`trip-${id}-travelers`);
        if (storedTravelers) setTravelers(Number(storedTravelers));
      } else {
        const record = await loadTrip(id as string);
        if (record) {
          setItinerary(record.itinerary);
          setTripRecord(record);
          setTravelers(record.travelers);
          sessionStorage.setItem(`trip-${id}`, JSON.stringify(record.itinerary));
          sessionStorage.setItem(`trip-${id}-travelers`, String(record.travelers));
          savedRef.current = true;
          setSaveState("saved");
        } else {
          router.push("/generate");
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Subscribe to real-time updates from collaborators
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToTrip(id as string, (newItinerary) => {
      setItinerary(newItinerary);
      sessionStorage.setItem(`trip-${id}`, JSON.stringify(newItinerary));
    });
    return () => unsubscribe();
  }, [id]);

  function handleItineraryUpdate(updated: GeneratedItinerary) {
    setItinerary(updated);
    sessionStorage.setItem(`trip-${id}`, JSON.stringify(updated));
    // Auto-save if user is logged in
    if (userRef.current) {
      autoSave(updated);
    }
  }

  function handleActivitySwap(dayIndex: number, activityId: string, replacement: Activity) {
    if (!itinerary) return;
    const updated = { ...itinerary };
    updated.days = updated.days.map((day, i) =>
      i === dayIndex
        ? { ...day, activities: day.activities.map((a) => a.id === activityId ? replacement : a) }
        : day
    );
    handleItineraryUpdate(updated);
  }

  async function autoSave(data: GeneratedItinerary) {
    const user = userRef.current;
    if (!user) return;
    setSaveState("auto-saving");
    try {
      const record = await saveTrip({
        id: id as string,
        user_id: user.id,
        destination: data.destination,
        vibe: data.vibe,
        budget: data.totalBudget,
        travelers,
        start_date: data.days[0]?.date ?? "",
        end_date: data.days[data.days.length - 1]?.date ?? "",
        itinerary: data,
        is_public: tripRecord?.is_public ?? false,
        share_slug: tripRecord?.share_slug ?? null,
      });
      setTripRecord(record);
      savedRef.current = true;
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  }

  async function persistTrip(data: GeneratedItinerary) {
    const user = await getUser();
    userRef.current = user;
    if (!user) return;
    const saved = await saveTrip({
      id: id as string,
      user_id: user.id,
      destination: data.destination,
      vibe: data.vibe,
      budget: data.totalBudget,
      travelers,
      start_date: data.days[0]?.date ?? "",
      end_date: data.days[data.days.length - 1]?.date ?? "",
      itinerary: data,
      is_public: tripRecord?.is_public ?? false,
      share_slug: tripRecord?.share_slug ?? null,
    });
    setTripRecord(saved);
  }

  async function handleSaveTrip() {
    if (!itinerary || saveState === "saving" || saveState === "saved") return;
    setSaveState("saving");
    setSaveError("");
    try {
      const user = await getUser();
      if (!user) { router.push("/auth/login"); return; }
      userRef.current = user;
      await persistTrip(itinerary);
      savedRef.current = true;
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  async function handleShare() {
    if (!itinerary) return;
    setShareState("sharing");
    startShareTransition(async () => {
      try {
        // Ensure saved first
        if (!savedRef.current) await handleSaveTrip();
        const slug = generateSlug(itinerary.destination);
        await publishTrip(id as string, slug);
        const shareUrl = `${window.location.origin}/trip/share/${slug}`;
        await navigator.clipboard.writeText(shareUrl);
        setShareState("shared");
        setTimeout(() => setShareState("idle"), 4000);
      } catch {
        setShareState("idle");
      }
    });
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-[#00f5d4] border-t-transparent"
          />
          <p className="text-white/50">Loading your trip...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "timeline", label: "Itinerary" },
    { id: "moodboard", label: "Mood Board" },
    { id: "packing", label: "Packing & Tips" },
  ] as const;

  const saveLabel = saveState === "saving" ? "Saving…"
    : saveState === "auto-saving" ? "Saving…"
    : saveState === "saved" ? "Saved!" : "Save Trip";
  const SaveIcon = saveState === "saved" ? Check : BookmarkPlus;

  const isOwner = !!(userRef.current && tripRecord && tripRecord.user_id === userRef.current.id);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Toast notifications */}
      <AnimatePresence>
        {(saveState === "saved" || saveState === "error") && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl"
            style={{
              background: saveState === "saved" ? "linear-gradient(135deg,#00f5d4,#00c4aa)" : "#ef4444",
              color: saveState === "saved" ? "#0a0a0a" : "#fff",
            }}
          >
            {saveState === "saved"
              ? <><Check className="w-4 h-4" /> Trip saved to your collection!</>
              : <><AlertCircle className="w-4 h-4" /> {saveError || "Could not save trip"}</>}
          </motion.div>
        )}
        {shareState === "shared" && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl"
            style={{ background: "linear-gradient(135deg,#00f5d4,#00c4aa)", color: "#0a0a0a" }}
          >
            <Share2 className="w-4 h-4" /> Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero banner */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 mountain-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #00f5d4, transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
          <Link href="/generate" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            New trip
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#00f5d4]" />
                <Badge className="bg-[#00f5d4]/20 text-[#00f5d4] border-[#00f5d4]/30 capitalize">
                  {itinerary.vibe}
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Auto-save indicator */}
                {saveState === "auto-saving" && (
                  <span className="flex items-center gap-1.5 text-white/40 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </span>
                )}

                <ExportButton itinerary={itinerary} />

                {/* Share button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleShare}
                  disabled={shareState === "sharing"}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70 transition-all"
                  style={{
                    background: shareState === "shared" ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.08)",
                    color: shareState === "shared" ? "#00f5d4" : "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {shareState === "sharing"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Share2 className="w-4 h-4" />}
                  {shareState === "sharing" ? "Sharing..." : shareState === "shared" ? "Copied!" : "Share"}
                </motion.button>

                {/* Save button */}
                <motion.button
                  whileHover={{ scale: saveState === "saved" ? 1 : 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSaveTrip}
                  disabled={saveState === "saving" || saveState === "saved"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70 transition-all"
                  style={{
                    background: saveState === "saved"
                      ? "rgba(0,245,212,0.15)"
                      : "linear-gradient(135deg, #00f5d4, #00c4aa)",
                    color: saveState === "saved" ? "#00f5d4" : "#0a0a0a",
                    border: saveState === "saved" ? "1px solid rgba(0,245,212,0.3)" : "none",
                  }}
                >
                  <SaveIcon className="w-4 h-4" />
                  {saveLabel}
                </motion.button>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              {itinerary.destination}
            </h1>
            <p className="text-white/60 max-w-2xl text-lg leading-relaxed mb-8">
              {itinerary.summary}
            </p>

            <div className="flex flex-wrap gap-6">
              {[
                { icon: Calendar, label: `${itinerary.totalDays} days` },
                { icon: DollarSign, label: `${itinerary.currency} ${itinerary.totalBudget.toLocaleString()} budget` },
                { icon: MapPin, label: itinerary.country },
                { icon: Star, label: itinerary.bestTimeToVisit },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon className="w-4 h-4 text-[#00f5d4]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Highlights */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {itinerary.highlights.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl px-4 py-2.5 flex-shrink-0 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-[#00f5d4] flex-shrink-0" />
              <span className="text-white/80 text-sm whitespace-nowrap">{h}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 glass rounded-2xl p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "transparent",
                color: activeTab === tab.id ? "#0a0a0a" : "rgba(255,255,255,0.5)",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-32">
          {/* Main content */}
          <div className="lg:col-span-2">
            {activeTab === "timeline" && (
              <InteractiveTimeline
                days={itinerary.days}
                itinerary={itinerary}
                onActivitySwap={handleActivitySwap}
              />
            )}

            {activeTab === "moodboard" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {itinerary.days.map((day) => (
                  <MoodBoard key={day.day} day={day} destination={itinerary.destination} />
                ))}
              </div>
            )}

            {activeTab === "packing" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#00f5d4]" />
                    Packing Tips
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.packingTips.map((tip, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 text-white/70 text-sm">
                        <div className="w-5 h-5 rounded-full bg-[#00f5d4]/20 border border-[#00f5d4]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#00f5d4] text-xs font-bold">{i + 1}</span>
                        </div>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#00f5d4]" />
                    Local Customs
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.localCustoms.map((custom, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] mt-2 flex-shrink-0" />
                        {custom}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">
            {activeTab === "timeline" && (
              <TripMap destination={itinerary.destination} days={itinerary.days} />
            )}

            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Search Flights", href: "/flights", icon: Plane },
                  { label: "Find Hotels", href: "/hotels", icon: MapPin },
                  { label: "Restaurants", href: `/restaurants`, icon: Users },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[#00f5d4]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#00f5d4]" />
                      </div>
                      <span className="text-white/70 text-sm">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Collaborators panel */}
            <CollaboratorPanel tripId={id as string} isOwner={isOwner} />

            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">Best Time to Visit</h3>
              <p className="text-white/60 text-sm leading-relaxed">{itinerary.bestTimeToVisit}</p>
            </div>
          </div>
        </div>
      </div>

      <BudgetTracker itinerary={itinerary} />
      <AIChatAssistant itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} />
    </main>
  );
}
