"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Map, DollarSign, MessageCircle, Plane, Heart } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered in Seconds",
    description:
      "Claude AI crafts your complete itinerary — activities, timings, local tips — tailored to your exact vibe and budget.",
    color: "#00f5d4",
  },
  {
    icon: Map,
    title: "Interactive Map Timeline",
    description:
      "Visualize your entire trip on a live Google Map. Drag & drop days, see routes, explore neighborhoods.",
    color: "#a78bfa",
  },
  {
    icon: DollarSign,
    title: "Real-Time Budget Tracker",
    description:
      "Every activity, hotel, and flight tracked live. Know exactly where your money goes before you even leave home.",
    color: "#fbbf24",
  },
  {
    icon: MessageCircle,
    title: "AI Chat Refinement",
    description:
      'Not feeling Day 2? Just say "make it more foodie" and watch your trip transform instantly.',
    color: "#f472b6",
  },
  {
    icon: Plane,
    title: "Flights & Hotels Integrated",
    description:
      "Real-time Amadeus data for flights and hotels. Compare prices, see availability, book with confidence.",
    color: "#38bdf8",
  },
  {
    icon: Heart,
    title: "Save & Share Trips",
    description:
      "Save your favourite itineraries, revisit them anytime, and share with your travel companions.",
    color: "#86efac",
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f5d4]/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[#00f5d4] text-sm font-semibold uppercase tracking-widest mb-4">
            Everything you need
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Travel planning,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00f5d4, #00c4aa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              reimagined.
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything your travel agent could do — done in minutes, at a fraction of the cost,
            with an experience that feels like magic.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group glass rounded-3xl p-8 cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}22, ${feature.color}11)`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>

                <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{feature.description}</p>

                {/* Bottom accent line */}
                <div
                  className="mt-6 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, ${feature.color}60, transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
