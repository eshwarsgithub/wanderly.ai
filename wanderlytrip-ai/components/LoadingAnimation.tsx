"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe, Map, Sparkles, CheckCircle } from "lucide-react";

const STEPS = [
  { icon: Globe,        label: "Analysing your destination",  sub: "Researching best experiences…" },
  { icon: Map,          label: "Crafting your itinerary",     sub: "Building day-by-day schedule…" },
  { icon: Sparkles,     label: "Adding the magic",            sub: "Personalising to your vibe…" },
  { icon: CheckCircle,  label: "Almost ready",                sub: "Finalising your perfect trip…" },
];

interface LoadingAnimationProps { step: number; }

export default function LoadingAnimation({ step }: LoadingAnimationProps) {
  const currentStep = step % STEPS.length;
  const { icon: Icon, label, sub } = STEPS[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6 text-center">

        {/* Animated icon ring */}
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-slate-100"
            style={{ borderTopColor: "#00f5d4" }}
          />
          <div className="absolute inset-2 rounded-full bg-[#f0fdfb] border border-[#99f6e4] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-7 h-7 text-[#00a896]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-1.5"
          >
            <p className="text-[#0f172a] font-semibold text-xl">{label}</p>
            <p className="text-slate-500 text-sm">{sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentStep ? 24 : 6,
                background: i <= currentStep ? "#00f5d4" : "#e2e8f0",
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <p className="text-xs text-slate-400">Claude AI · usually takes ~20 seconds</p>
      </div>
    </motion.div>
  );
}
