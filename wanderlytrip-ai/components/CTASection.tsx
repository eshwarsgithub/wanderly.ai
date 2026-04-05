"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-[#0f172a] px-8 py-20 sm:px-16 sm:py-24 overflow-hidden text-center"
        >
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/12 text-white/50 text-xs font-medium mb-10 tracking-wide uppercase"
            >
              <Sparkles className="w-3 h-3 text-[#14b8a6]" />
              Free forever · No credit card
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-5"
            >
              Your dream trip is
              <br />
              <span className="text-white/60">minutes away</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-white/40 text-lg max-w-md mx-auto mb-12 leading-relaxed"
            >
              Join thousands planning smarter with AI. Personalised, fast, completely free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link href="/generate">
                <button className="btn btn-lg group relative overflow-hidden bg-white text-[#0f172a] hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  Start Planning Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </motion.div>

            <p className="text-white/20 text-xs mt-6 tracking-wide">Takes 30 seconds · Powered by Claude AI</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
