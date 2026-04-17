"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind, Umbrella, Sun, AlertCircle, Package } from "lucide-react";
import type { WeatherDay } from "@/lib/weather";
import type { GeneratedItinerary } from "@/lib/ai-agent";

interface WeatherAdvisory {
  advisory: string[];
  packingAdditions: string[];
}

function TempBar({ low, high, absMin, absMax }: { low: number; high: number; absMin: number; absMax: number }) {
  const range = absMax - absMin || 1;
  const leftPct = ((low - absMin) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: `${leftPct}%`,
          width: `${Math.max(widthPct, 8)}%`,
          background: `linear-gradient(to right, #60a5fa, #fb923c)`,
        }}
      />
    </div>
  );
}

function RainBadge({ chance }: { chance: number }) {
  if (chance <= 10) return null;
  const color = chance > 70 ? "#ef4444" : chance > 40 ? "#f97316" : "#3b82f6";
  const bg = chance > 70 ? "#fef2f2" : chance > 40 ? "#fff7ed" : "#eff6ff";
  const label = chance > 70 ? "Heavy rain" : chance > 40 ? "Rain likely" : "Showers possible";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: bg, color }}
    >
      <Umbrella className="w-2.5 h-2.5" />
      {chance}% · {label}
    </span>
  );
}

export default function WeatherTab({
  itinerary,
  weatherByDate,
}: {
  itinerary: GeneratedItinerary;
  weatherByDate: Record<string, WeatherDay>;
}) {
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);

  const weatherDays = itinerary.days
    .map((d) => weatherByDate[d.date])
    .filter(Boolean) as WeatherDay[];

  const hasWeather = weatherDays.length > 0;

  useEffect(() => {
    if (!hasWeather) return;
    setLoadingAdvisory(true);
    const activities = itinerary.days.flatMap((d) => d.activities);
    fetch("/api/weather-advisory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weatherDays, destination: itinerary.destination, activities }),
    })
      .then((r) => r.json())
      .then((d) => setAdvisory(d))
      .catch(() => {})
      .finally(() => setLoadingAdvisory(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasWeather) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Sun className="w-10 h-10 mx-auto mb-3 text-slate-200" />
        <p className="text-slate-500 text-sm font-medium mb-1">Weather forecast unavailable</p>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
          Live weather is only available for trips starting within the next 5 days (OpenWeatherMap free tier limitation).
        </p>
      </div>
    );
  }

  const temps = weatherDays.flatMap((w) => [w.tempHighC, w.tempLowC]);
  const absMin = Math.min(...temps);
  const absMax = Math.max(...temps);

  return (
    <div className="space-y-4">
      {/* 5-day forecast */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5" />
            Trip Forecast
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {itinerary.days.map((day, i) => {
            const w = weatherByDate[day.date];
            if (!w) return null;
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="px-5 py-4"
              >
                <div className="flex items-start gap-4">
                  {/* Day label */}
                  <div className="flex-shrink-0 w-14">
                    <p className="text-[#0f172a] text-xs font-semibold">Day {day.day}</p>
                    <p className="text-slate-400 text-[10px]">
                      {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>

                  {/* Icon + description */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://openweathermap.org/img/wn/${w.icon}@1x.png`}
                      alt={w.description}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                    />
                    <span className="text-slate-500 text-xs capitalize hidden sm:block">{w.description}</span>
                  </div>

                  {/* Temp range */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-blue-400 text-xs font-medium">{w.tempLowC}°</span>
                      <span className="text-orange-400 text-xs font-semibold">{w.tempHighC}°C</span>
                    </div>
                    <TempBar low={w.tempLowC} high={w.tempHighC} absMin={absMin} absMax={absMax} />
                  </div>

                  {/* Humidity */}
                  <div className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-400">
                    <Droplets className="w-3 h-3" />
                    {w.humidity}%
                  </div>
                </div>

                {/* Rain badge */}
                {w.precipitationChance > 10 && (
                  <div className="mt-2 ml-14 sm:ml-[88px]">
                    <RainBadge chance={w.precipitationChance} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weather Advisory */}
      {loadingAdvisory ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : advisory?.advisory?.length ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-[#0f172a] font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            AI Weather Advisory
          </h3>
          <ul className="space-y-2.5">
            {advisory.advisory.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "#fef9c3", border: "1px solid #fde68a" }}
                >
                  <span className="text-amber-600 text-[10px] font-bold">{i + 1}</span>
                </div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Packing additions */}
      {advisory?.packingAdditions?.length ? (
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f0fdfb", border: "1px solid #99f6e4" }}
        >
          <h4 className="text-[#065f46] text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Weather-based packing essentials
          </h4>
          <ul className="space-y-1.5">
            {advisory.packingAdditions.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-[#065f46] text-xs">
                <Wind className="w-3 h-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
