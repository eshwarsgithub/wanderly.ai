"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Globe } from "lucide-react";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/* Mountain gradient base */}
        <div className="absolute inset-0 mountain-gradient" />

        {/* Animated teal aurora */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,245,212,0.15) 0%, transparent 70%)",
              "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(0,196,170,0.12) 0%, transparent 70%)",
              "radial-gradient(ellipse 80% 50% at 40% -20%, rgba(0,245,212,0.15) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,245,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </motion.div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #00f5d4, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, #00c4aa, transparent 70%)" }}
        animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20], y: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 teal-glow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#00f5d4]" />
          <span className="text-sm text-[#00f5d4] font-medium">Powered by Claude AI</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-white">Plan your entire</span>
          <br />
          <span
            className="teal-text-glow"
            style={{
              background: "linear-gradient(135deg, #00f5d4 0%, #00c4aa 50%, #7ffff0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            trip in minutes
          </span>
          <br />
          <span className="text-white/80">with AI.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Flights, hotels, restaurants, activities — all curated to your vibe in a
          beautifully crafted itinerary. No more hours of planning. Just wander.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/generate">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg text-[#0a0a0a] overflow-hidden"
              style={{ background: "linear-gradient(135deg, #00f5d4 0%, #00c4aa 100%)" }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #7ffff0 0%, #00f5d4 100%)" }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <Globe className="relative w-5 h-5" />
              <span className="relative">Create My Trip</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-white/70 glass hover:text-[#00f5d4] transition-colors border border-white/10 hover:border-[#00f5d4]/30"
          >
            See how it works
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-12 flex items-center justify-center gap-8 text-white/40 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["🌍", "✈️", "🏔️"].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-xs">
                  {emoji}
                </div>
              ))}
            </div>
            <span>10,000+ trips planned</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div className="hidden sm:flex items-center gap-1">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-[#00f5d4] text-xs">{s}</span>
            ))}
            <span className="ml-1">4.9/5</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-[#00f5d4]/50 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
