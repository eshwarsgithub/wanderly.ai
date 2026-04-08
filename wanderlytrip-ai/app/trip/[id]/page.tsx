"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, MapPin, Calendar, Users, DollarSign, Star, Package,
  Plane, ArrowLeft, BookmarkPlus, Check, AlertCircle, Share2,
  Download, Copy, BookOpen,
} from "lucide-react";
import Link from "next/link";
import InteractiveTimeline from "@/components/InteractiveTimeline";
import MoodBoard from "@/components/MoodBoard";
import BudgetTracker from "@/components/BudgetTracker";
import AIChatAssistant from "@/components/AIChatAssistant";
import TripMap from "@/components/TripMap";
import NearbyPlaces from "@/components/NearbyPlaces";
import CurrencyConverter from "@/components/CurrencyConverter";
import SimilarDestinations from "@/components/SimilarDestinations";
import TransportTab from "@/components/TransportTab";
import WeatherTab from "@/components/WeatherTab";
import FullMapTab from "@/components/FullMapTab";
import VisaPanel from "@/components/VisaPanel";
import EmergencyPanel from "@/components/EmergencyPanel";
import TripCardGenerator from "@/components/TripCardGenerator";
import Navbar from "@/components/Navbar";
import type { GeneratedItinerary, Activity } from "@/lib/ai-agent";
import type { WeatherDay } from "@/lib/weather";
import type { PlaceResult } from "@/lib/geocode";
import { geocodeAddress } from "@/lib/geocode";
import { saveTrip, loadTrip, shareTrip, getUser } from "@/lib/supabase";

type SaveState = "idle" | "saving" | "saved" | "error";
type ShareState = "idle" | "sharing" | "copied" | "error";
type ActiveTab = "timeline" | "transport" | "weather" | "map" | "moodboard" | "packing" | "nearby" | "phrasebook";

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "timeline", label: "Itinerary" },
  { id: "transport", label: "Transport" },
  { id: "weather", label: "Weather" },
  { id: "map", label: "Full Map" },
  { id: "moodboard", label: "Mood Board" },
  { id: "packing", label: "Packing" },
  { id: "nearby", label: "Nearby" },
  { id: "phrasebook", label: "Phrasebook" },
];

// ── Lazy-loaded tabs ──────────────────────────────────────────────────────────
import dynamic from "next/dynamic";
const Phrasebook = dynamic(() => import("@/components/Phrasebook"), {
  loading: () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  ),
});

// ── Nearby tab content ────────────────────────────────────────────────────────
function NearbyTabContent({
  itinerary,
  onNearbyPlacesChange,
  onHighlightCoordsChange,
}: {
  itinerary: GeneratedItinerary;
  onNearbyPlacesChange: (p: PlaceResult[]) => void;
  onHighlightCoordsChange: (c: { lat: number; lng: number } | null) => void;
}) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const day = itinerary.days[selectedDayIdx];

  async function selectActivity(activity: Activity) {
    setSelectedActivity(activity);
    setCoords(null);
    onHighlightCoordsChange(null);
    setGeocoding(true);
    const c = await geocodeAddress(`${activity.location}, ${itinerary.destination}`);
    setCoords(c);
    onHighlightCoordsChange(c);
    setGeocoding(false);
  }

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {itinerary.days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => { setSelectedDayIdx(i); setSelectedActivity(null); setCoords(null); onHighlightCoordsChange(null); onNearbyPlacesChange([]); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: selectedDayIdx === i ? "#0f172a" : "#f1f5f9",
              color: selectedDayIdx === i ? "#ffffff" : "#64748b",
            }}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Activity selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wide">
          Pick an activity
        </p>
        <div className="space-y-1">
          {day.activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => selectActivity(activity)}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all"
              style={{
                background: selectedActivity?.id === activity.id ? "#f0fdfb" : "transparent",
                border: `1px solid ${selectedActivity?.id === activity.id ? "#99f6e4" : "transparent"}`,
              }}
            >
              <MapPin className="w-3.5 h-3.5 text-[#00a896] flex-shrink-0" />
              <span className="text-sm font-medium text-[#0f172a] flex-1 min-w-0 truncate">
                {activity.name}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">{activity.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby places panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-[#0f172a] font-semibold text-sm mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00a896]" />
          Nearby Places
        </h3>
        {geocoding ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <NearbyPlaces
            activityLocation={selectedActivity?.location ?? ""}
            activityCoords={coords}
            destination={itinerary.destination}
            onPlacesChange={onNearbyPlacesChange}
          />
        )}
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function TripDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showTripCard, setShowTripCard] = useState(false);

  // Lifted openDay for InteractiveTimeline ↔ TripMap sync
  const [openDay, setOpenDay] = useState(1);

  // Weather data
  const [weatherByDate, setWeatherByDate] = useState<Record<string, WeatherDay>>({});

  // Nearby tab state (shared with TripMap)
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
  const [nearbyHighlightCoords, setNearbyHighlightCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    async function loadTripData() {
      const stored = sessionStorage.getItem(`trip-${id}`);
      let data: GeneratedItinerary | null = null;

      if (stored) {
        data = JSON.parse(stored) as GeneratedItinerary;
        setItinerary(data);
      } else {
        const record = await loadTrip(id as string);
        if (record) {
          data = record.itinerary;
          setItinerary(data);
          sessionStorage.setItem(`trip-${id}`, JSON.stringify(data));
        } else {
          router.push("/generate");
          return;
        }
      }

      // Fetch weather in the background (silent fail)
      if (data && data.days[0]?.date) {
        fetch(
          `/api/weather?destination=${encodeURIComponent(data.destination)}&startDate=${data.days[0].date}&days=${data.totalDays}`
        )
          .then((r) => r.json())
          .then(({ weather }: { weather: WeatherDay[] }) => {
            const map: Record<string, WeatherDay> = {};
            for (const w of weather ?? []) map[w.date] = w;
            setWeatherByDate(map);
          })
          .catch(() => {});
      }
    }
    loadTripData();
  }, [id, router]);

  function handleActivitiesReorder(dayNumber: number, activities: Activity[]) {
    if (!itinerary) return;
    const updated: GeneratedItinerary = {
      ...itinerary,
      days: itinerary.days.map((d) =>
        d.day === dayNumber ? { ...d, activities } : d
      ),
    };
    setItinerary(updated);
    sessionStorage.setItem(`trip-${id}`, JSON.stringify(updated));
  }

  function handleItineraryUpdate(updated: GeneratedItinerary) {
    setItinerary(updated);
    sessionStorage.setItem(`trip-${id}`, JSON.stringify(updated));
    setSaveState("idle");
    persistTrip(updated).catch(() => {});
  }

  async function persistTrip(data: GeneratedItinerary) {
    const user = await getUser();
    if (!user) return;
    await saveTrip({
      id: id as string,
      user_id: user.id,
      destination: data.destination,
      vibe: data.vibe,
      budget: data.totalBudget,
      travelers: 1,
      start_date: data.days[0]?.date ?? "",
      end_date: data.days[data.days.length - 1]?.date ?? "",
      itinerary: data,
    });
  }

  async function handleShare() {
    if (shareState === "sharing") return;
    setShareState("sharing");
    try {
      const user = await getUser();
      if (!user) {
        sessionStorage.setItem("returnUrl", `/trip/${id}`);
        router.push("/auth/login");
        return;
      }
      await persistTrip(itinerary!);
      const token = await shareTrip(id as string);
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 3000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  }

  async function handleExportPdf() {
    if (!itinerary || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itinerary.destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-itinerary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleSaveTrip() {
    if (!itinerary || saveState === "saving") return;
    setSaveState("saving");
    setSaveError("");
    try {
      const user = await getUser();
      if (!user) {
        sessionStorage.setItem("returnUrl", `/trip/${id}`);
        router.push("/auth/login");
        return;
      }
      await persistTrip(itinerary);
      setSaveState("saved");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  const handleNearbyPlacesChange = useCallback((p: PlaceResult[]) => setNearbyPlaces(p), []);
  const handleHighlightCoordsChange = useCallback((c: { lat: number; lng: number } | null) => setNearbyHighlightCoords(c), []);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0f172a]"
          />
          <p className="text-slate-400 text-sm">Loading your trip...</p>
        </div>
      </div>
    );
  }

  const saveLabel =
    saveState === "saving" ? "Saving…" :
    saveState === "saved" ? "Saved ✓" :
    saveState === "error" ? "Retry Save" : "Save Trip";
  const SaveIcon = saveState === "saved" ? Check : BookmarkPlus;

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Share toast */}
      <AnimatePresence>
        {(shareState === "copied" || shareState === "error") && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg max-w-sm"
            style={{ background: shareState === "copied" ? "#0f172a" : "#ef4444", color: "#fff" }}
          >
            {shareState === "copied"
              ? <><Copy className="w-4 h-4 flex-shrink-0" /> Link copied! Share it with anyone.</>
              : <><AlertCircle className="w-4 h-4" /> Could not create share link</>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save toast */}
      <AnimatePresence>
        {(saveState === "saved" || saveState === "error") && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
            style={{ background: saveState === "saved" ? "#0f172a" : "#ef4444", color: "#fff" }}
          >
            {saveState === "saved"
              ? <><Check className="w-4 h-4" /> Trip saved to your collection!</>
              : <><AlertCircle className="w-4 h-4" /> {saveError || "Could not save trip"}</>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero banner */}
      <div className="bg-[#0f172a] pt-16">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <Link href="/generate" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            New trip
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#14b8a6]" />
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 capitalize border border-white/10">
                  {itinerary.vibe}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: saveState === "saving" ? 1 : 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSaveTrip}
                disabled={saveState === "saving"}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70 transition-all"
                style={
                  saveState === "saved"
                    ? { background: "rgba(15,23,42,0.06)", color: "#0f172a", border: "1px solid #e2e8f0" }
                    : saveState === "error"
                    ? { background: "#ef4444", color: "#ffffff", border: "none" }
                    : { background: "#ffffff", color: "#0f172a", border: "none" }
                }
              >
                <SaveIcon className="w-4 h-4" />
                {saveLabel}
              </motion.button>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
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
                  <Icon className="w-4 h-4 text-[#14b8a6]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Highlights strip */}
      <div className="bg-[#0f172a] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {itinerary.highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
              >
                <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="text-white/70 text-sm whitespace-nowrap">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-32 bg-[#f5f7fa]">
        {/* Tabs — scrollable on mobile */}
        <div className="overflow-x-auto mb-8">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? "#0f172a" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#64748b",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {activeTab === "timeline" && (
              <InteractiveTimeline
                days={itinerary.days}
                openDay={openDay}
                onDayChange={setOpenDay}
                onActivitiesReorder={handleActivitiesReorder}
                weatherByDate={weatherByDate}
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
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-[#0f172a] font-semibold text-base mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#00a896]" />
                    Packing Tips
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.packingTips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 text-slate-600 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#00a896] text-xs font-bold">{i + 1}</span>
                        </div>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-[#0f172a] font-semibold text-base mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00a896]" />
                    Local Customs
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.localCustoms.map((custom, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                        {custom}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "nearby" && (
              <NearbyTabContent
                itinerary={itinerary}
                onNearbyPlacesChange={handleNearbyPlacesChange}
                onHighlightCoordsChange={handleHighlightCoordsChange}
              />
            )}

            {activeTab === "transport" && (
              <TransportTab itinerary={itinerary} activeDay={openDay} />
            )}

            {activeTab === "weather" && (
              <WeatherTab itinerary={itinerary} weatherByDate={weatherByDate} />
            )}

            {activeTab === "map" && (
              <FullMapTab destination={itinerary.destination} days={itinerary.days} />
            )}

            {activeTab === "phrasebook" && (
              <Phrasebook destination={itinerary.destination} />
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* Map — always visible, reflects active day + nearby places */}
            <TripMap
              destination={itinerary.destination}
              days={itinerary.days}
              activeDayNumber={openDay}
              nearbyPlaces={activeTab === "nearby" ? nearbyPlaces : []}
              highlightActivityCoords={activeTab === "nearby" ? nearbyHighlightCoords : null}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-[#0f172a] font-semibold mb-4 text-sm">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "Search Flights", href: "/flights", icon: Plane },
                  { label: "Find Hotels", href: "/hotels", icon: MapPin },
                ].map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[#f0fdfb] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#00a896]" />
                      </div>
                      <span className="text-slate-600 text-sm">{label}</span>
                    </div>
                  </Link>
                ))}

                {/* Travel Guide link */}
                <Link href={`/guide/${encodeURIComponent(itinerary.destination)}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-[#f0fdfb] flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#00a896]" />
                    </div>
                    <span className="text-slate-600 text-sm">Travel Guide</span>
                  </div>
                </Link>

                <button
                  onClick={handleShare}
                  disabled={shareState === "sharing"}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0fdfb] flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-[#00a896]" />
                  </div>
                  <span className="text-slate-600 text-sm">
                    {shareState === "sharing" ? "Generating link…" : shareState === "copied" ? "Link copied!" : "Share Trip"}
                  </span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0fdfb] flex items-center justify-center">
                    <Download className="w-4 h-4 text-[#00a896]" />
                  </div>
                  <span className="text-slate-600 text-sm">
                    {isExportingPdf ? "Exporting…" : "Export PDF"}
                  </span>
                </button>

                {/* Trip Card */}
                <button
                  onClick={() => setShowTripCard(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0fdfb] flex items-center justify-center">
                    <Copy className="w-4 h-4 text-[#00a896]" />
                  </div>
                  <span className="text-slate-600 text-sm">Trip Card</span>
                </button>
              </div>
            </div>

            {/* Visa & Entry */}
            <VisaPanel destination={itinerary.destination} />

            {/* Emergency Contacts */}
            <EmergencyPanel destination={itinerary.destination} />

            {/* Currency Converter */}
            <CurrencyConverter
              tripCurrency={itinerary.currency}
              totalBudget={itinerary.totalBudget}
            />

            {/* Trip details compact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Best time</span>
                  <span className="text-[#0f172a] text-xs font-medium text-right max-w-[160px] leading-tight">{itinerary.bestTimeToVisit}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Country</span>
                  <span className="text-[#0f172a] text-xs font-medium">{itinerary.country}</span>
                </div>
              </div>
            </div>

            {/* Similar Destinations */}
            <SimilarDestinations
              destination={itinerary.destination}
              vibe={itinerary.vibe}
              budget={itinerary.totalBudget}
            />
          </div>
        </div>
      </div>

      {/* Floating widgets */}
      <BudgetTracker itinerary={itinerary} />
      <AIChatAssistant itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} />

      {/* Trip Card modal */}
      <AnimatePresence>
        {showTripCard && (
          <TripCardGenerator itinerary={itinerary} onClose={() => setShowTripCard(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
