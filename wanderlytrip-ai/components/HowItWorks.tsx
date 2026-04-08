"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, MapPin, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    number: "01",
    title: "Tell the AI your dream",
    description:
      "Enter your destination, travel dates, budget, number of travelers, and vibe. Our AI understands nuance — 'adventure' in Tokyo means something different from 'adventure' in Bali.",
    color: "#00f5d4",
    glow: "rgba(0,245,212,0.15)",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Get a cinematic itinerary",
    description:
      "Claude AI crafts a day-by-day plan with activities, local restaurants, hidden gems, estimated costs, packing tips, and cultural customs — tailored entirely to you.",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.15)",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Explore, refine & book",
    description:
      "Dive into your interactive dashboard — chat with AI to refine any day, check live weather, see activities on the map, find nearby places, and book flights & hotels.",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.15)",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: "#060606" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[#00f5d4] text-sm font-semibold tracking-widest uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            From dream to itinerary
            <br />
            <span style={{ color: "#00f5d4" }}>in under 30 seconds</span>
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto">
            No more hours of research. Let Claude AI do the heavy lifting.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0,245,212,0.3) 20%, rgba(0,245,212,0.3) 80%, transparent)",
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center px-4"
              >
                {/* Number badge */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                  style={{ background: step.glow, border: `1px solid ${step.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>

                <span
                  className="text-xs font-bold tracking-widest mb-2"
                  style={{ color: step.color }}
                >
                  STEP {step.number}
                </span>
                <h3 className="text-white font-bold text-xl mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-14"
        >
          <a href="/generate">
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-[#0a0a0a] transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #00f5d4, #00c4aa)",
                boxShadow: "0 0 32px rgba(0,245,212,0.3)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Plan my trip free
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
