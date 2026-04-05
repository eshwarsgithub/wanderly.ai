"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Map, DollarSign, MessageCircle, Plane, Heart, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    label: "AI Trip Planning",
    desc: "Claude AI generates a complete, personalised itinerary in under 30 seconds. Day-by-day activities, timing, and costs — all tailored to your vibe.",
    span: "lg:col-span-2",
    accent: "#0ea5e9",
    large: true,
  },
  {
    icon: Map,
    label: "Interactive Map",
    desc: "Every activity pinned on a live map. Visualise your journey geographically.",
    span: "lg:col-span-1",
    accent: "#8b5cf6",
    large: false,
  },
  {
    icon: DollarSign,
    label: "Budget Tracker",
    desc: "Real-time cost breakdown per day. Never go over budget.",
    span: "lg:col-span-1",
    accent: "#14b8a6",
    large: false,
  },
  {
    icon: MessageCircle,
    label: "AI Chat Refinement",
    desc: "Not happy with Day 3? Chat with AI to swap activities, change vibes, or cut costs instantly.",
    span: "lg:col-span-1",
    accent: "#f97316",
    large: false,
  },
  {
    icon: Plane,
    label: "Flights & Hotels",
    desc: "Search real flights and hotels via Amadeus and book with Skyscanner or Booking.com.",
    span: "lg:col-span-2",
    accent: "#6366f1",
    large: false,
  },
  {
    icon: Heart,
    label: "Save & Share",
    desc: "Save your trips, share public links, or export to PDF. Your itinerary, everywhere.",
    span: "lg:col-span-1",
    accent: "#ec4899",
    large: false,
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 px-4 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-14 max-w-xl"
        >
          <p className="text-xs font-semibold text-[#0d9488] uppercase tracking-[0.12em] mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0f172a] tracking-tight leading-[1.08] mb-4">
            Everything you need
            <br />to travel smarter
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            From AI-generated itineraries to real-time flight search — one tool, entire trip.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-default ${f.span}`}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.accent}12` }}
              >
                <f.icon className="w-4 h-4" style={{ color: f.accent }} />
              </div>

              <h3 className="font-semibold text-[#0f172a] text-sm mb-2">{f.label}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

              {/* Accent bottom line on hover */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: f.accent }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex justify-center"
        >
          <a
            href="/generate"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f172a] hover:text-slate-600 transition-colors group"
          >
            Start planning for free
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
