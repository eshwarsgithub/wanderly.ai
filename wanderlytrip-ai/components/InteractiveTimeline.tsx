"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ChevronDown, CalendarDays, DollarSign, GripVertical, X } from "lucide-react";
import { format } from "date-fns";
import type { ItineraryDay, Activity, GeneratedItinerary } from "@/lib/ai-agent";
import type { WeatherDay } from "@/lib/weather";
import ItineraryCard from "@/components/ItineraryCard";
import WeatherWidget from "@/components/WeatherWidget";
import { swapActivityAction } from "@/app/actions/generate-itinerary";

interface InteractiveTimelineProps {
  days: ItineraryDay[];
  openDay?: number;
  onDayChange?: (n: number) => void;
  onActivitiesReorder?: (dayNumber: number, activities: Activity[]) => void;
  onSwapActivity?: (dayNumber: number, activityId: string, replacement: Activity) => void;
  weatherByDate?: Record<string, WeatherDay>;
  itinerary?: GeneratedItinerary;
}

export default function InteractiveTimeline({
  days,
  openDay = 1,
  onDayChange = () => {},
  onActivitiesReorder,
  onSwapActivity,
  weatherByDate = {},
  itinerary,
}: InteractiveTimelineProps) {
  const isMultiCity = days.some((d) => d.city);
  const cities = isMultiCity ? [...new Set(days.map((d) => d.city).filter(Boolean))] : [];

  if (isMultiCity) {
    return (
      <div className="space-y-8">
        {cities.map((city) => {
          const cityDays = days.filter((d) => d.city === city);
          return (
            <div key={city}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[#0f172a] text-white">
                  {city}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-slate-400 text-xs">
                  {cityDays.length} day{cityDays.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-3">
                {cityDays.map((day) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    openDay={openDay}
                    setOpenDay={onDayChange}
                    onActivitiesReorder={onActivitiesReorder}
                    onSwapActivity={onSwapActivity}
                    weatherData={weatherByDate[day.date]}
                    itinerary={itinerary}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <DayCard
          key={day.day}
          day={day}
          openDay={openDay}
          setOpenDay={onDayChange}
          onActivitiesReorder={onActivitiesReorder}
          onSwapActivity={onSwapActivity}
          weatherData={weatherByDate[day.date]}
          itinerary={itinerary}
        />
      ))}
    </div>
  );
}

function SwapAlternativesPanel({
  activityId,
  swapAlternatives,
  onPick,
  onDismiss,
}: {
  activityId: string;
  swapAlternatives: { id: string; alts: Activity[] } | null;
  onPick: (activityId: string, replacement: Activity) => void;
  onDismiss: () => void;
}) {
  if (swapAlternatives?.id !== activityId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="mx-4 mb-3 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
          <p className="text-xs font-semibold text-[#0f172a]">Choose an alternative</p>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {swapAlternatives.alts.map((alt, i) => (
            <button
              key={i}
              onClick={() => onPick(activityId, alt)}
              className="w-full text-left px-4 py-3 hover:bg-white transition-colors group/alt"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0f172a] group-hover/alt:text-slate-900 truncate">{alt.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{alt.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{alt.location} · {alt.time} · {alt.duration}</p>
                </div>
                <span className="text-xs font-semibold text-[#0f172a] flex-shrink-0 mt-0.5">${alt.estimatedCost}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function DayCard({
  day,
  openDay,
  setOpenDay,
  onActivitiesReorder,
  onSwapActivity,
  weatherData,
  itinerary,
}: {
  day: ItineraryDay;
  openDay: number;
  setOpenDay: (n: number) => void;
  onActivitiesReorder?: (dayNumber: number, activities: Activity[]) => void;
  onSwapActivity?: (dayNumber: number, activityId: string, replacement: Activity) => void;
  weatherData?: WeatherDay;
  itinerary?: GeneratedItinerary;
}) {
  const isOpen = openDay === day.day;
  const date = new Date(day.date);
  const [activities, setActivities] = useState<Activity[]>(day.activities);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<{ id: string; alts: Activity[] } | null>(null);
  const [, startSwap] = useTransition();

  // Sync local state when parent itinerary changes (e.g. after AI refinement)
  const [prevDayActivities, setPrevDayActivities] = useState(day.activities);
  if (day.activities !== prevDayActivities) {
    setPrevDayActivities(day.activities);
    setActivities(day.activities);
  }

  function handleReorder(newActivities: Activity[]) {
    setActivities(newActivities);
    onActivitiesReorder?.(day.day, newActivities);
  }

  function handleSwapRequest(activityId: string) {
    if (!itinerary || swappingId) return;
    setSwappingId(activityId);
    setSwapAlternatives(null);
    const dayIndex = itinerary.days.findIndex((d) => d.day === day.day);
    startSwap(async () => {
      const result = await swapActivityAction(itinerary, dayIndex, activityId);
      if (result.success && result.alternatives.length > 0) {
        setSwapAlternatives({ id: activityId, alts: result.alternatives });
      }
      setSwappingId(null);
    });
  }

  function handlePickAlternative(activityId: string, replacement: Activity) {
    const newActs = activities.map((a) => a.id === activityId ? { ...replacement, id: activityId } : a);
    setActivities(newActs);
    setSwapAlternatives(null);
    onSwapActivity?.(day.day, activityId, { ...replacement, id: activityId });
  }

  const canDrag = !!onActivitiesReorder;

  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden"
      style={{
        borderColor: isOpen ? "#0f172a" : "#e2e8f0",
        background: "#ffffff",
        boxShadow: isOpen ? "0 2px 12px rgba(0,196,170,0.08)" : "none",
      }}
    >
      <button
        onClick={() => setOpenDay(isOpen ? 0 : day.day)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all"
            style={
              isOpen
                ? { background: "#0f172a", color: "#ffffff" }
                : { background: "#f1f5f9", color: "#64748b" }
            }
          >
            {day.day}
          </div>
          <div>
            <p className="font-semibold text-[#0f172a] text-sm">{day.theme}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <CalendarDays className="w-3 h-3" />
                {!isNaN(date.getTime()) ? format(date, "EEE, MMM d") : `Day ${day.day}`}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#64748b" }}>
                <DollarSign className="w-3 h-3" />
                ${day.dailyCost}
              </span>
              <span className="text-slate-400 text-xs hidden sm:block">{day.mood}</span>
              <WeatherWidget weatherData={weatherData} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDrag && isOpen && (
            <span className="text-slate-300 text-[10px] hidden sm:block">drag to reorder</span>
          )}
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-50">
              {canDrag ? (
                <Reorder.Group
                  axis="y"
                  values={activities}
                  onReorder={handleReorder}
                  className="space-y-0"
                  style={{ listStyle: "none", padding: 0, margin: 0 }}
                >
                  {activities.map((activity, index) => (
                    <Reorder.Item
                      key={activity.id}
                      value={activity}
                      style={{ cursor: "grab" }}
                      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10 }}
                      className="relative"
                    >
                      <div className="absolute left-0 top-2 z-10 flex items-start pl-0 opacity-0 hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-5" />
                      </div>
                      <ItineraryCard
                        activity={activity}
                        index={index}
                        isLast={index === activities.length - 1}
                        isDraggable
                        onSwap={onSwapActivity ? () => handleSwapRequest(activity.id) : undefined}
                        isSwapping={swappingId === activity.id}
                      />
                      <SwapAlternativesPanel
                        activityId={activity.id}
                        swapAlternatives={swapAlternatives}
                        onPick={handlePickAlternative}
                        onDismiss={() => setSwapAlternatives(null)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                activities.map((activity, index) => (
                  <div key={activity.id}>
                    <ItineraryCard
                      activity={activity}
                      index={index}
                      isLast={index === activities.length - 1}
                      onSwap={onSwapActivity ? () => handleSwapRequest(activity.id) : undefined}
                      isSwapping={swappingId === activity.id}
                    />
                    <SwapAlternativesPanel
                      activityId={activity.id}
                      swapAlternatives={swapAlternatives}
                      onPick={handlePickAlternative}
                      onDismiss={() => setSwapAlternatives(null)}
                    />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
