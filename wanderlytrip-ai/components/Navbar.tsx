"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, Bookmark, ChevronDown } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Destinations", href: "/explore" },
  { label: "Flights",      href: "/flights" },
  { label: "Hotels",       href: "/hotels" },
  { label: "Journal",      href: "/explore" },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [user,         setUser]         = useState<SupabaseUser | null>(null);
  const pathname   = usePathname();
  const router     = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = pathname.startsWith("/trip/") || pathname.startsWith("/share/");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    try {
      const sb = getSupabase();
      sb.auth.getUser().then(({ data }) => setUser(data.user));
      const { data: { subscription } } = sb.auth.onAuthStateChange((_ev, s) => setUser(s?.user ?? null));
      return () => subscription.unsubscribe();
    } catch { /* env not set */ }
  }, []);

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  async function handleSignOut() {
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
    setProfileOpen(false);
    router.push("/");
  }

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? "U";

  // Nav appearance based on scroll + page darkness
  const navBg     = scrolled ? (isDark ? "rgba(26,22,48,0.75)"  : "rgba(247,243,255,0.82)") : "transparent";
  const navBorder = scrolled ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(124,92,255,0.15)")  : "transparent";
  const navColor  = isDark ? "white" : "var(--v-ink)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: scrolled ? "14px 0" : "22px 0",
        background: navBg,
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: `1px solid ${navBorder}`,
        color: navColor,
        transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div className="v-shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
              <path d="M14 2 L14 26 M2 14 L26 14" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
              <path d="M6 14 Q14 4 22 14 Q14 24 6 14 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <circle cx="14" cy="14" r="2" fill="var(--v-violet-2)" />
            </svg>
            <span style={{ fontFamily: "var(--v-font-display)", fontSize: 20, letterSpacing: "-0.02em", fontWeight: 400, color: "inherit" }}>
              Wanderly<span style={{ color: "var(--v-violet-2)", fontStyle: "italic" }}>.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 32 }}>
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} style={{
                fontSize: 13, fontFamily: "var(--v-font-ui)", fontWeight: 400,
                color: "inherit", opacity: pathname === link.href ? 1 : 0.65,
                textDecoration: "none", letterSpacing: "-0.005em",
                transition: "opacity 0.25s",
              }}
                onMouseOver={e => (e.currentTarget.style.opacity = "1")}
                onMouseOut={e => (e.currentTarget.style.opacity = pathname === link.href ? "1" : "0.65")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: auth + CTA */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 12 }}>
            {user ? (
              <div style={{ position: "relative" }} ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px", borderRadius: 999,
                  background: scrolled ? "rgba(255,255,255,0.3)" : "transparent",
                  border: "1px solid rgba(124,92,255,0.2)", cursor: "pointer",
                  fontFamily: "var(--v-font-ui)", fontSize: 13, color: "inherit",
                  transition: "all 0.25s",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 999,
                    background: "linear-gradient(135deg, var(--v-violet), var(--v-sky-deep))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 11, fontWeight: 700,
                  }}>{avatarLetter}</div>
                  <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.8 }}>
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={12} style={{ opacity: 0.5, transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        width: 220,
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(124,92,255,0.15)",
                        borderRadius: 16,
                        boxShadow: "0 8px 32px rgba(124,92,255,0.15)",
                        overflow: "hidden", zIndex: 60,
                      }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(124,92,255,0.1)" }}>
                        <div style={{ fontSize: 10, fontFamily: "var(--v-font-mono)", color: "var(--v-slate-2)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Signed in as</div>
                        <div style={{ fontSize: 13, fontFamily: "var(--v-font-ui)", color: "var(--v-ink)", fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                      </div>
                      <div style={{ padding: 6 }}>
                        {[
                          { icon: Bookmark, label: "My Trips",  href: "/saved" },
                          { icon: User,     label: "Profile",   href: "/profile" },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link key={href} href={href} onClick={() => setProfileOpen(false)} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 12px", borderRadius: 10,
                            fontSize: 13, fontFamily: "var(--v-font-ui)",
                            color: "var(--v-ink)", textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                            onMouseOver={e => (e.currentTarget.style.background = "rgba(124,92,255,0.06)")}
                            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Icon size={14} style={{ color: "var(--v-slate-2)" }} />
                            {label}
                          </Link>
                        ))}
                        <div style={{ borderTop: "1px solid rgba(124,92,255,0.1)", margin: "4px 0" }} />
                        <button onClick={handleSignOut} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                          fontSize: 13, fontFamily: "var(--v-font-ui)", color: "#e84393",
                          background: "transparent", border: "none", transition: "background 0.15s",
                          textAlign: "left",
                        }}
                          onMouseOver={e => (e.currentTarget.style.background = "rgba(232,67,147,0.06)")}
                          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" style={{
                fontSize: 12, fontFamily: "var(--v-font-ui)", color: "inherit",
                opacity: 0.65, textDecoration: "none", letterSpacing: "0.04em",
              }}>
                Sign in
              </Link>
            )}

            <Link href="/generate" style={{ textDecoration: "none" }}>
              <button className="v-btn v-btn-ink v-btn-sm">
                Begin planning
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", padding: 4 }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed", top: 70, left: 16, right: 16, zIndex: 49,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(124,92,255,0.15)",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(124,92,255,0.15)",
              overflow: "hidden",
              padding: 12,
            }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} style={{
                display: "flex", alignItems: "center", padding: "12px 16px",
                borderRadius: 12, fontSize: 14, fontFamily: "var(--v-font-ui)",
                color: "var(--v-ink)", textDecoration: "none",
                background: pathname === link.href ? "rgba(124,92,255,0.08)" : "transparent",
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid rgba(124,92,255,0.1)", margin: "8px 0", paddingTop: 8 }}>
              <Link href="/generate" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none" }}>
                <button className="v-btn v-btn-ink" style={{ width: "100%", marginTop: 4 }}>
                  Begin planning
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
