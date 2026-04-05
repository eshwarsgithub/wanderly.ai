"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Flights",     href: "/flights" },
  { label: "Hotels",      href: "/hotels" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Saved",       href: "/saved" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" as const }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-3"
      >
        <div className={`max-w-5xl mx-auto transition-all duration-250 rounded-2xl border ${
          scrolled
            ? "bg-white/97 backdrop-blur-xl border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.05)]"
            : "bg-white/90 backdrop-blur-md border-slate-200/50"
        }`}>
          <div className="px-5 h-14 flex items-center justify-between gap-4">

            {/* Logo — pure typographic, minimal */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 rounded-md bg-[#0f172a] flex items-center justify-center">
                <span className="text-[#14b8a6] text-xs font-bold leading-none">W</span>
              </div>
              <span className="font-bold text-[#0f172a] text-sm tracking-tight">
                Wanderly<span className="text-slate-400 font-medium">.ai</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm transition-all duration-150 ${
                    pathname === link.href
                      ? "text-[#0f172a] font-semibold bg-slate-100"
                      : "text-slate-500 font-medium hover:text-[#0f172a] hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link href="/auth/login" className="text-sm text-slate-500 hover:text-[#0f172a] transition-colors font-medium px-3 py-1.5">
                Sign in
              </Link>
              <Link href="/generate">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn btn-primary btn-sm"
                >
                  Plan a Trip
                </motion.button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" as const }}
              className="max-w-5xl mx-auto mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <div className="p-2.5 space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-[#0f172a] bg-slate-100"
                        : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-[#0f172a] hover:bg-slate-50 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/generate" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
                    Plan a Trip →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
