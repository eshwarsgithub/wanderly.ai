"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #00f5d4, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-3xl p-12 teal-glow"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#00f5d4]" />
            <span className="text-[#00f5d4] text-sm font-medium uppercase tracking-widest">
              Ready to wander?
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Your dream trip is{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00f5d4, #00c4aa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              minutes away.
            </span>
          </h2>

          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of travelers who plan smarter, explore deeper, and spend less time
            — all thanks to AI.
          </p>

          <Link href="/generate">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl text-[#0a0a0a]"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
            >
              <span>Start Planning — It&apos;s Free</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <p className="text-white/30 text-sm mt-6">No credit card required · Powered by Claude AI</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
