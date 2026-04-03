"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Explore", href: "/explore" },
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Saved Trips", href: "/saved" },
  { label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center teal-glow-sm"
            style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
            <Globe className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <span className="font-bold text-white text-lg">
            Wanderly<span className="text-[#00f5d4]">Trip</span>
            <span className="text-white/40">.ai</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/60 hover:text-[#00f5d4] text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/generate">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0a]"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
            >
              Create My Trip
            </motion.button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-white/10 px-4 py-6 flex flex-col gap-4"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/70 hover:text-[#00f5d4] font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/generate" onClick={() => setMobileOpen(false)}>
            <button
              className="w-full py-3 rounded-xl font-semibold text-[#0a0a0a] mt-2"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
            >
              Create My Trip
            </button>
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
