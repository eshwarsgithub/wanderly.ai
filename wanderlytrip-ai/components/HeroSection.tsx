"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Zap } from "lucide-react";

const FLOAT_CARDS = [
  { icon: "🗼", label: "Paris, France",    sub: "5 days · Culture",    delay: 0 },
  { icon: "🌸", label: "Kyoto, Japan",     sub: "7 days · Adventure",  delay: 0.15 },
  { icon: "🏖️", label: "Bali, Indonesia", sub: "10 days · Relaxation", delay: 0.3 },
];

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: "easeOut" as const },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-white">

      {/* Fine dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.7,
        }}
      />

      {/* Very faint centre vignette to lift content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.95) 0%, transparent 80%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div
          variants={fade} initial="hidden" animate="show" custom={0}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-500 text-sm font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse flex-shrink-0" />
            AI-powered travel planning
            <span className="text-slate-300">·</span>
            <span className="text-[#0d9488] font-semibold">Free to start</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fade} initial="hidden" animate="show" custom={1}
          className="text-center text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-tight text-[#0f172a] leading-[1.06] mb-6"
        >
          Plan your perfect trip
          <br />
          <span className="relative inline-block mt-1">
            <span className="relative z-10">in minutes, not days</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, delay: 0.65, ease: "easeOut" as const }}
              className="absolute bottom-1.5 left-0 right-0 h-2.5 -z-0 origin-left rounded-sm"
              style={{ background: "rgba(13,148,136,0.14)" }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fade} initial="hidden" animate="show" custom={2}
          className="text-center text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10"
        >
          Tell us your destination, budget, and vibe.
          Claude AI crafts a complete itinerary — tailored exactly to you.
        </motion.p>

        {/* CTA row */}
        <motion.div
          variants={fade} initial="hidden" animate="show" custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link href="/generate">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary btn-lg group"
            >
              <Sparkles className="w-4 h-4" />
              Start planning free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </Link>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="btn btn-outline btn-lg"
          >
            See how it works
          </button>
        </motion.div>

        {/* Trip preview card */}
        <motion.div
          variants={fade} initial="hidden" animate="show" custom={4}
          className="relative"
        >
          {/* Main card */}
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Browser chrome dots */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                <Zap className="w-3 h-3 text-[#14b8a6]" />
                Generating your itinerary…
              </div>
              <div className="w-14" />
            </div>

            <div className="p-5 space-y-2.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-[#0f172a] text-lg">Tokyo, Japan</p>
                  <p className="text-slate-400 text-xs mt-0.5">7 days · Adventure · $3,200</p>
                </div>
                <span className="teal-tag">Generated ✓</span>
              </div>

              {[
                { day: "Day 1", name: "Senso-ji Temple",     time: "09:00", cost: "Free" },
                { day: "Day 2", name: "Tsukiji Market Tour", time: "11:00", cost: "$45" },
                { day: "Day 3", name: "Hakone Ropeway",      time: "07:00", cost: "$80" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.12, duration: 0.35 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.day} · {item.time}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 flex-shrink-0">{item.cost}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating mini cards */}
          {FLOAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + card.delay, duration: 0.4 }}
              className={`absolute hidden lg:flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${
                i === 0 ? "-left-32 top-8" : i === 1 ? "-right-36 top-4" : "-right-28 bottom-8"
              }`}
            >
              <span className="text-lg">{card.icon}</span>
              <div>
                <p className="text-xs font-semibold text-[#0f172a]">{card.label}</p>
                <p className="text-xs text-slate-400">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fade} initial="hidden" animate="show" custom={6}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["🌍", "✈️", "🏔️", "🏝️"].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs">
                  {e}
                </div>
              ))}
            </div>
            <span>10,000+ trips planned</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-amber-400 text-xs">{s}</span>
            ))}
            <span className="ml-1.5">4.9 / 5</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>195 countries covered</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
