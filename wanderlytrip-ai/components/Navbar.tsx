"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Plane, Building2, Utensils, Bookmark,
  Compass, ChevronDown, User, LogOut, Map, Settings, Home,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Explore",      href: "/explore",      icon: Compass },
  { label: "Flights",      href: "/flights",       icon: Plane },
  { label: "Hotels",       href: "/hotels",        icon: Building2 },
  { label: "Restaurants",  href: "/restaurants",   icon: Utensils },
  { label: "Saved",        href: "/saved",         icon: Bookmark },
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser]               = useState<SupabaseUser | null>(null);
  const pathname  = usePathname();
  const router    = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Supabase auth state
  useEffect(() => {
    try {
      const sb = getSupabase();
      sb.auth.getUser().then(({ data }) => setUser(data.user));
      const { data: { subscription } } = sb.auth.onAuthStateChange((_ev, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch { /* env vars not set */ }
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      await getSupabase().auth.signOut();
    } catch { /* ignore */ }
    setProfileOpen(false);
    router.push("/");
  }

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-3"
      >
        <div className={`max-w-6xl mx-auto transition-all duration-250 rounded-2xl border ${
          scrolled
            ? "bg-white/97 backdrop-blur-xl border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.05)]"
            : "bg-white/90 backdrop-blur-md border-slate-200/50"
        }`}>
          <div className="px-5 h-14 flex items-center justify-between gap-4">

            {/* Logo + Home button */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Home icon button — visible on non-home pages */}
              {pathname !== "/" && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="/"
                    title="Back to Home"
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0f172a] flex items-center justify-center">
                  <span className="text-[#14b8a6] text-xs font-bold leading-none">W</span>
                </div>
                <span className="font-bold text-[#0f172a] text-sm tracking-tight">
                  Wanderly<span className="text-slate-400 font-medium">.ai</span>
                </span>
              </Link>
            </div>

            {/* Desktop nav — animated active pill */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-3.5 py-1.5 rounded-xl text-sm transition-colors duration-150 flex items-center gap-1.5"
                    style={{ color: isActive ? "#0f172a" : "#64748b" }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-slate-100"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
                    <span className={`relative z-10 ${isActive ? "font-semibold" : "font-medium"}`}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side — CTA + profile */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                /* Logged-in avatar dropdown */
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center text-white text-xs font-bold">
                      {avatarLetter}
                    </div>
                    <span className="text-sm font-medium text-slate-600 max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-[#0f172a] truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <DropdownItem icon={Bookmark} label="My Trips" href="/saved" onClick={() => setProfileOpen(false)} />
                          <DropdownItem icon={Map} label="Explore" href="/explore" onClick={() => setProfileOpen(false)} />
                          <DropdownItem icon={User} label="Profile" href="/profile" onClick={() => setProfileOpen(false)} />
                          <DropdownItem icon={Settings} label="Settings" href="/profile" onClick={() => setProfileOpen(false)} />
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-slate-500 hover:text-[#0f172a] transition-colors font-medium px-3 py-1.5"
                  >
                    Sign in
                  </Link>
                </>
              )}

              <Link href="/generate">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-[#1e293b] transition-colors"
                >
                  <Plane className="w-3.5 h-3.5" />
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
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="max-w-6xl mx-auto mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <div className="p-2.5 space-y-0.5">
                {/* Home link always first in mobile */}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/"
                      ? "text-[#0f172a] bg-slate-100"
                      : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-50"
                  }`}
                >
                  <Home className="w-4 h-4 flex-shrink-0" />
                  Home
                </Link>
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#0f172a] bg-slate-100"
                          : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3.5 py-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {avatarLetter}
                        </div>
                        <span className="text-sm font-medium text-[#0f172a] truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={() => { handleSignOut(); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-[#0f172a] hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign in
                    </Link>
                  )}
                  <Link
                    href="/generate"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors"
                  >
                    <Plane className="w-4 h-4" />
                    Plan a Trip
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

function DropdownItem({
  icon: Icon, label, href, onClick,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-[#0f172a] transition-colors font-medium"
    >
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </Link>
  );
}
