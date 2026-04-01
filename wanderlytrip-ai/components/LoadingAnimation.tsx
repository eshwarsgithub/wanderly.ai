"use client";

import { motion } from "framer-motion";
import { Sparkles, Globe, Map, Plane } from "lucide-react";

const STEPS = [
  { icon: Globe, text: "Analysing your destination..." },
  { icon: Map, text: "Crafting your itinerary..." },
  { icon: Sparkles, text: "Adding local magic..." },
  { icon: Plane, text: "Finalising your trip..." },
];

export default function LoadingAnimation({ step = 0 }: { step?: number }) {
  const currentStep = STEPS[step % STEPS.length];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm">
      {/* Orbiting particles */}
      <div className="absolute w-64 h-64">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? "#00f5d4" : "#00c4aa",
              marginLeft: -4,
              marginTop: -4,
            }}
            animate={{
              rotate: [i * 90, i * 90 + 360],
              x: [Math.cos((i * Math.PI) / 2) * 80, Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 80],
              y: [Math.sin((i * Math.PI) / 2) * 80, Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 80],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Central icon */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          className="w-24 h-24 rounded-3xl flex items-center justify-center teal-glow"
          style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,196,170,0.1))", border: "1px solid rgba(0,245,212,0.3)" }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            key={step}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Icon className="w-12 h-12 text-[#00f5d4]" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <motion.h3
            key={currentStep.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Planning Your Trip
          </motion.h3>
          <motion.p
            key={`sub-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#00f5d4] font-medium"
          >
            {currentStep.text}
          </motion.p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full"
              animate={{
                width: i === step % STEPS.length ? 24 : 6,
                backgroundColor: i <= step % STEPS.length ? "#00f5d4" : "rgba(255,255,255,0.2)",
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>

        <p className="text-white/40 text-sm max-w-xs text-center">
          Claude AI is crafting a bespoke itinerary just for you. This takes about 15 seconds.
        </p>
      </div>
    </div>
  );
}
