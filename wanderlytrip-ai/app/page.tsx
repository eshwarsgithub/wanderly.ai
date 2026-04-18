"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── Rotating placeholder suggestions ────────────────────────────
const SUGGESTIONS = [
  "Ten days in Kyoto, late April. One ryokan at the end.",
  "A slow week in Puglia — olive groves, one Michelin stop.",
  "Patagonia in March, hiking at a moderate pace.",
  "First time in Morocco, riads only, textile workshops.",
  "A quiet anniversary in Amalfi — private boat, two suites.",
];

const DESTINATIONS = [
  { idx: "01", name: "Kyoto",     country: "Japan",   season: "Spring", nights: "7 nights",  price: "from $4,800", temp: "14°", tag: "quiet",    imageQuery: "kyoto japan temple cherry blossom" },
  { idx: "02", name: "Puglia",    country: "Italy",   season: "Summer", nights: "6 nights",  price: "from $5,200", temp: "27°", tag: "slow",     imageQuery: "puglia italy whitewashed trulli countryside" },
  { idx: "03", name: "Patagonia", country: "Chile",   season: "Autumn", nights: "10 nights", price: "from $7,900", temp: "9°",  tag: "remote",   imageQuery: "patagonia torres del paine mountain landscape" },
  { idx: "04", name: "Marrakesh", country: "Morocco", season: "Spring", nights: "5 nights",  price: "from $3,400", temp: "21°", tag: "textile",  imageQuery: "marrakesh morocco riad medina colorful" },
  { idx: "05", name: "Faroe",     country: "Denmark", season: "Summer", nights: "6 nights",  price: "from $6,100", temp: "12°", tag: "elemental",imageQuery: "faroe islands dramatic cliffs ocean fog" },
  { idx: "06", name: "Oaxaca",    country: "Mexico",  season: "Winter", nights: "8 nights",  price: "from $4,200", temp: "22°", tag: "craft",    imageQuery: "oaxaca mexico colonial architecture colourful" },
];

const JOURNAL_ENTRIES = [
  { no: "№ 028", kicker: "Dispatch · Kyoto",   title: "On the quiet of Arashiyama at six.",      words: "1,420 words · 6 min read", imageQuery: "arashiyama bamboo forest kyoto morning mist" },
  { no: "№ 027", kicker: "Letter · Puglia",     title: "Four tables, all masseria, none booked.", words: "980 words · 4 min read",   imageQuery: "masseria puglia olive grove table outdoor dining" },
  { no: "№ 026", kicker: "Field notes · Faroe", title: "What the fog taught us about pacing.",    words: "2,110 words · 9 min read", imageQuery: "faroe islands fog misty landscape dramatic" },
];

const MARQUEE_QUERIES = [
  "santorini greece whitewashed",
  "bali rice terraces sunrise",
  "swiss alps mountain snow",
  "venice canal gondola",
  "kyoto geisha lantern night",
  "new york city skyline",
  "morocco desert camel",
  "iceland northern lights aurora",
  "amalfi coast italy cliff",
  "tokyo street neon night",
];

export default function LandingPage() {
  const router = useRouter();
  const [prompt, setPrompt]     = useState("");
  const [phIdx, setPhIdx]       = useState(0);
  const [scrollY, setScrollY]   = useState(0);
  const [activeD, setActiveD]   = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhIdx(i => (i + 1) % SUGGESTIONS.length), 3800);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const onS = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onS, { passive: true });
    return () => window.removeEventListener("scroll", onS);
  }, []);

  function handleCompose(p?: string) {
    const val = p ?? prompt ?? SUGGESTIONS[phIdx];
    const dest = val.split(" ").slice(2, 5).join(" ").replace(/[^a-zA-Z ]/g, "").trim() || "your destination";
    router.push(`/generate?destination=${encodeURIComponent(dest)}&prompt=${encodeURIComponent(val)}`);
  }

  return (
    <main className="aurora-page min-h-screen">
      <Navbar />

      {/* ── Floating orbs ─────────────────────────────────────── */}
      <div className="v-orb v-orb-violet" style={{ width: 420, height: 420, top: -120, left: -80, opacity: 0.3, animation: "v-float-orb 22s ease-in-out infinite", position: "fixed" }} />
      <div className="v-orb v-orb-pink"   style={{ width: 360, height: 360, top: "40vh", right: -80, opacity: 0.3, animation: "v-float-orb 28s ease-in-out infinite", animationDelay: "-5s", position: "fixed" }} />
      <div className="v-orb v-orb-sky"    style={{ width: 480, height: 480, bottom: -160, left: "30vw", opacity: 0.25, animation: "v-float-orb 32s ease-in-out infinite", animationDelay: "-10s", position: "fixed" }} />

      {/* ══════════════════════════════════════════════════════════
          §00 — HERO
      ══════════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: 180, paddingBottom: 100, position: "relative" }}>
        <div className="v-shell">
          {/* Eyebrow row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 80 }}>
            <div className="v-chip v-chip-live">
              <span className="v-chip-dot" />
              The atelier is open
            </div>
            <div className="v-mono v-muted" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Vol. iv · Spring · MMXXVI
            </div>
          </div>

          {/* Headline */}
          <div style={{ transform: `translateY(${scrollY * -0.06}px)` }}>
            <h1 className="v-display v-display-xl" style={{ maxWidth: "14ch", color: "var(--v-ink)" }}>
              Travel,<br />
              <span className="v-serif-italic" style={{ color: "var(--v-violet)" }}>considered.</span>
            </h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 48, alignItems: "end", marginTop: 32 }}>
              <p style={{ fontFamily: "var(--v-font-ui)", fontSize: 18, lineHeight: 1.55, color: "var(--v-slate)", maxWidth: "44ch" }}>
                An intelligent atelier that listens, researches, and drafts a journey shaped to you.
                No categories to pick through. No endless tabs.{" "}
                <span className="v-serif-italic" style={{ color: "var(--v-ink)" }}>Just tell us what you want.</span>
              </p>
              <div className="v-mono v-muted" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "right" }}>
                — a conversation, typed or spoken —
              </div>
            </div>
          </div>

          {/* Prompt bar */}
          <div style={{ marginTop: 64, position: "relative" }}>
            <div className="v-card" style={{
              borderRadius: 20, padding: "10px 10px 10px 28px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, color: "var(--v-violet)" }}>
                <path d="M10 2 L11.5 8.5 L18 10 L11.5 11.5 L10 18 L8.5 11.5 L2 10 L8.5 8.5 Z" fill="currentColor" />
              </svg>
              <div style={{ flex: 1, position: "relative", minHeight: 60 }}>
                <input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCompose(); }}
                  placeholder=""
                  style={{
                    width: "100%", height: 60, background: "transparent", border: "none", outline: "none",
                    fontFamily: "var(--v-font-display)", fontWeight: 300,
                    fontSize: "clamp(1.1rem,2vw,1.6rem)", letterSpacing: "-0.01em", color: "var(--v-ink)",
                  }}
                />
                {!prompt && (
                  <div key={phIdx} style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 60,
                    display: "flex", alignItems: "center", pointerEvents: "none",
                    color: "var(--v-slate-2)", fontFamily: "var(--v-font-display)",
                    fontWeight: 300, fontStyle: "italic",
                    fontSize: "clamp(1.1rem,2vw,1.6rem)", letterSpacing: "-0.01em",
                    animation: "v-fade-slide 0.7s ease",
                  }}>
                    &ldquo;{SUGGESTIONS[phIdx]}&rdquo;
                  </div>
                )}
              </div>
              <button className="v-btn v-btn-ink" onClick={() => handleCompose()}>
                Compose
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12M12 7L7 2M12 7L7 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontSize: 11, color: "var(--v-slate-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <kbd style={{ fontFamily: "var(--v-font-mono)", fontSize: 10, padding: "2px 6px", border: "1px solid var(--v-line)", borderRadius: 4, background: "rgba(255,255,255,0.5)" }}>↵</kbd>
                <span>Or press enter to begin</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span>Voice</span><span>·</span><span>Multi-city</span><span>·</span><span>Bring a PDF</span>
              </div>
            </div>
          </div>

          {/* Quick chips */}
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span className="v-eyebrow" style={{ alignSelf: "center", marginRight: 12 }}>Try —</span>
            {["10 days · Japan · culture", "A week in Puglia", "Patagonia · shoulder season", "Honeymoon · Amalfi", "Safari · Kenya · October"].map(c => (
              <button key={c} className="v-chip"
                style={{ cursor: "pointer", transition: "all 0.3s" }}
                onClick={() => setPrompt(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Stats band */}
          <div style={{
            marginTop: 96,
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            borderTop: "1px solid var(--v-line)", borderBottom: "1px solid var(--v-line)",
            padding: "28px 0",
          }}>
            {[
              ["142", "countries shaped", "so far"],
              ["4.9", "atelier rating", "out of 5"],
              ["11 min", "median draft", "to first itinerary"],
              ["24 / 7", "concierge", "in five languages"],
            ].map(([n, t, sub]) => (
              <div key={t} style={{ padding: "0 24px", borderRight: "1px solid var(--v-line)" }}>
                <div className="v-numeral" style={{ fontSize: "clamp(2.2rem,4vw,3.2rem)", lineHeight: 1, color: "var(--v-ink)" }}>{n}</div>
                <div style={{ marginTop: 8, fontSize: 14, fontFamily: "var(--v-font-ui)" }}>{t}</div>
                <div className="v-mono v-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PHOTO MARQUEE STRIP
      ══════════════════════════════════════════════════════════ */}
      <div style={{ overflow: "hidden", borderTop: "1px solid var(--v-line)", borderBottom: "1px solid var(--v-line)", margin: "0 0 0 0", position: "relative" }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to right, var(--v-bg), transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to left, var(--v-bg), transparent)", zIndex: 2, pointerEvents: "none" }} />
        {/* Double track for seamless loop */}
        <div style={{ display: "flex", animation: "v-marquee 40s linear infinite", willChange: "transform" }}>
          {[...MARQUEE_QUERIES, ...MARQUEE_QUERIES].map((q, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`/api/images?query=${encodeURIComponent(q)}&seed=${i}`}
              alt={q}
              style={{
                width: 280, height: 160, objectFit: "cover", flexShrink: 0,
                borderRight: "1px solid var(--v-line)",
                filter: "grayscale(15%) contrast(1.05)",
                transition: "filter 0.4s",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "grayscale(0%) contrast(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "grayscale(15%) contrast(1.05)")}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          §01 — THREE MOVEMENTS
      ══════════════════════════════════════════════════════════ */}
      <section id="how" style={{ padding: "120px 0", position: "relative" }}>
        <div className="v-shell">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 72 }}>
            <div>
              <div className="v-eyebrow">§ 01 — The method</div>
              <h2 className="v-display v-display-lg" style={{ maxWidth: "16ch", marginTop: 24, color: "var(--v-ink)" }}>
                Three movements<br />
                <span className="v-serif-italic" style={{ color: "var(--v-violet)" }}>toward arrival.</span>
              </h2>
            </div>
            <div className="v-mono v-muted" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "right" }}>
              A conversation ·<br />not a form.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid var(--v-line)" }}>
            {[
              { n: "i",   kicker: "Describe", title: "Write as you would to a friend.", body: "A sentence or a paragraph. Dates or a season. A budget or a feeling. Our atelier reads between the lines — pacing, appetite, solitude.", meta: "Sample input · 18 words" },
              { n: "ii",  kicker: "Draft",    title: "A full itinerary, composed.",     body: "Routes, stays, tables, transits, weather, visas. Drafted in minutes, cross-checked against live pricing and availability. No templates.", meta: "Median compose · 11 minutes" },
              { n: "iii", kicker: "Refine",   title: "Adjust, in plain language.",      body: "\"Swap day four for something quieter.\" \"Add a pottery studio in Arita.\" The itinerary reshapes itself — pricing, maps, logistics included.", meta: "Typical revisions · 3 rounds" },
            ].map((s, i) => (
              <article key={s.n} style={{ padding: "48px 40px 48px 0", borderRight: i < 2 ? "1px solid var(--v-line)" : "none", paddingLeft: i > 0 ? 40 : 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <span className="v-serif-italic" style={{ fontSize: 36, color: "var(--v-violet-deep)", lineHeight: 0.9 }}>{s.n}.</span>
                  <span className="v-eyebrow" style={{ paddingTop: 12 }}>{s.kicker}</span>
                </div>
                <h3 style={{ marginTop: 32, fontFamily: "var(--v-font-display)", fontWeight: 300, fontSize: "clamp(1.5rem,2.2vw,2rem)", lineHeight: 1.1, letterSpacing: "-0.015em", color: "var(--v-ink)" }}>
                  {s.title}
                </h3>
                <p style={{ marginTop: 24, color: "var(--v-slate)", maxWidth: "34ch", lineHeight: 1.6, fontFamily: "var(--v-font-ui)" }}>{s.body}</p>
                <div className="v-mono" style={{ marginTop: 40, fontSize: 10, color: "var(--v-violet-deep)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{s.meta}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §02 — THE ATLAS
      ══════════════════════════════════════════════════════════ */}
      <section id="destinations" style={{ padding: "120px 0", position: "relative" }}>
        <div className="v-shell">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 60 }}>
            <div>
              <div className="v-eyebrow">§ 02 — The atlas</div>
              <h2 className="v-display v-display-lg" style={{ maxWidth: "18ch", marginTop: 24, color: "var(--v-ink)" }}>
                Places we <span className="v-serif-italic" style={{ color: "var(--v-violet)" }}>keep returning</span> to.
              </h2>
            </div>
            <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid currentColor", fontSize: 13, letterSpacing: "0.02em", color: "var(--v-ink)", transition: "gap 0.3s ease" }}>
              Full atlas · 142 destinations
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7H12M12 7L7 2M12 7L7 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {DESTINATIONS.map((d, i) => (
              <article key={d.idx}
                onMouseEnter={() => setActiveD(i)}
                style={{ cursor: "pointer", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
                {/* Photo card */}
                <div style={{
                  position: "relative", overflow: "hidden", borderRadius: 4,
                  aspectRatio: i === 1 || i === 4 ? "3 / 4.3" : "3 / 4",
                  transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
                  transform: activeD === i ? "scale(1.01)" : "scale(1)",
                  background: "#111",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/images?query=${encodeURIComponent(d.imageQuery)}&seed=${i}`}
                    alt={d.name}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.4s",
                      transform: activeD === i ? "scale(1.06)" : "scale(1)",
                      filter: activeD === i ? "brightness(0.7)" : "brightness(0.6) contrast(1.1)",
                    }}
                  />
                  {/* Overlay gradient */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
                  {/* Top meta */}
                  <div className="v-mono" style={{ position: "absolute", top: 14, left: 14, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}>{d.idx} / 06</div>
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, color: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.2)" }}>
                      {d.tag}
                    </span>
                  </div>
                  {/* Bottom text */}
                  <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, color: "white" }}>
                    <div className="v-mono" style={{ fontSize: 10, opacity: 0.65, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      {d.country} · {d.season} · {d.temp}
                    </div>
                    <div className="v-display" style={{ fontSize: "clamp(2rem,3.2vw,2.8rem)", lineHeight: 1, letterSpacing: "-0.02em", marginTop: 8 }}>{d.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, fontSize: 12, fontFamily: "var(--v-font-mono)" }}>
                  <span style={{ letterSpacing: "0.06em" }}>{d.nights}</span>
                  <span style={{ color: "var(--v-violet-deep)" }}>{d.price}</span>
                </div>
                <Link href={`/generate?destination=${encodeURIComponent(d.name)}`}>
                  <button className="v-btn v-btn-ghost" style={{ marginTop: 12, width: "100%", color: "var(--v-ink)", fontSize: 11 }}>
                    Plan {d.name}
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §03 — MANIFESTO
      ══════════════════════════════════════════════════════════ */}
      <section className="v-on-dark" style={{ padding: "140px 0", position: "relative" }}>
        <div className="v-orb v-orb-violet" style={{ width: 500, height: 500, top: -100, right: -100, opacity: 0.15 }} />
        <div className="v-orb v-orb-pink" style={{ width: 400, height: 400, bottom: -80, left: -80, opacity: 0.12 }} />
        <div className="v-shell" style={{ position: "relative", zIndex: 1 }}>
          <div className="v-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>§ 03 — A standing memo</div>
          <div style={{ marginTop: 48 }}>
            <p style={{ fontFamily: "var(--v-font-display)", fontWeight: 300, fontSize: "clamp(1.8rem,3.6vw,3.4rem)", lineHeight: 1.18, letterSpacing: "-0.015em", maxWidth: "26ch", color: "white" }}>
              We believe a great journey is{" "}
              <span className="v-serif-italic" style={{ color: "var(--v-violet-2)" }}>designed</span>, not booked.
              That time is the only true luxury. That the best trips leave{" "}
              <span className="v-serif-italic" style={{ color: "var(--v-pink)" }}>room</span> — for weather, for whims, for the unplanned café.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 80 }}>
            {[
              ["Privately drafted", "Every itinerary is composed for one household. Never repeated, never resold."],
              ["Quietly priced",    "Clear totals, no markups. Suppliers chosen on merit, not commission."],
              ["Humanly supervised","Our concierge reviews every draft before it reaches you."],
            ].map(([t, b], i) => (
              <div key={t} style={{ padding: "32px 32px 32px 0", paddingLeft: i > 0 ? 32 : 0, borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div className="v-eyebrow" style={{ color: "var(--v-violet-2)" }}>0{i + 1}</div>
                <h3 style={{ marginTop: 16, fontFamily: "var(--v-font-display)", fontWeight: 300, fontSize: 22, letterSpacing: "-0.01em", color: "white" }}>{t}</h3>
                <p style={{ marginTop: 12, fontSize: 14, color: "rgba(247,243,255,0.60)", lineHeight: 1.6, fontFamily: "var(--v-font-ui)" }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §04 — JOURNAL DISPATCHES
      ══════════════════════════════════════════════════════════ */}
      <section id="journal" style={{ padding: "120px 0" }}>
        <div className="v-shell">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 60 }}>
            <div>
              <div className="v-eyebrow">§ 04 — The journal</div>
              <h2 className="v-display v-display-lg" style={{ marginTop: 24, color: "var(--v-ink)" }}>
                Dispatches,<br /><span className="v-serif-italic" style={{ color: "var(--v-violet)" }}>unhurried.</span>
              </h2>
            </div>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid currentColor", fontSize: 13, color: "var(--v-ink)" }}>
              All dispatches
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7H12M12 7L7 2M12 7L7 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
            {JOURNAL_ENTRIES.map((e, i) => (
              <article key={e.no} style={{ padding: `0 ${i === 0 ? 0 : 36}px`, paddingRight: i === 2 ? 0 : 36, borderRight: i < 2 ? "1px solid var(--v-line)" : "none", cursor: "pointer" }}>
                <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, aspectRatio: "4 / 3", background: "#111" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/images?query=${encodeURIComponent(e.imageQuery)}&seed=${i + 10}`}
                    alt={e.kicker}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover", filter: "grayscale(20%) contrast(1.08) brightness(0.75)",
                      transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.4s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.filter = "grayscale(0%) contrast(1.05) brightness(0.72)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.filter = "grayscale(20%) contrast(1.08) brightness(0.75)";
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                  <div className="v-mono" style={{ position: "absolute", top: 14, left: 14, fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.75)" }}>{e.no}</div>
                  <div className="v-mono" style={{ position: "absolute", bottom: 14, left: 14, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>photograph</div>
                </div>
                <div className="v-eyebrow" style={{ marginTop: 24, color: "var(--v-violet)" }}>{e.kicker}</div>
                <h3 style={{ marginTop: 16, fontFamily: "var(--v-font-display)", fontWeight: 300, fontSize: "clamp(1.4rem,2vw,1.8rem)", letterSpacing: "-0.01em", lineHeight: 1.15, color: "var(--v-ink)" }}>
                  {e.title}
                </h3>
                <div className="v-mono v-muted" style={{ marginTop: 24, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>{e.words}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §05 — CONCIERGE CTA
      ══════════════════════════════════════════════════════════ */}
      <section id="concierge" style={{ padding: "140px 0", position: "relative" }}>
        <div className="v-shell">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="v-eyebrow">§ 05 — Begin</div>
              <h2 className="v-display" style={{ fontSize: "clamp(3rem,7vw,7rem)", marginTop: 24, color: "var(--v-ink)" }}>
                Tell us<br />
                <span className="v-serif-italic" style={{ color: "var(--v-violet)" }}>where,</span> roughly.
              </h2>
              <p style={{ marginTop: 32, fontSize: 18, color: "var(--v-slate)", maxWidth: "40ch", lineHeight: 1.55, fontFamily: "var(--v-font-ui)" }}>
                A draft in eleven minutes. A conversation as long as it takes. No credit card, no commitment —
                our atelier simply <span className="v-serif-italic">listens first.</span>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
                <Link href="/generate">
                  <button className="v-btn v-btn-ink v-btn-lg">Compose an itinerary</button>
                </Link>
                <button className="v-btn v-btn-ghost" style={{ color: "var(--v-ink)", borderColor: "var(--v-line)" }}>
                  Speak with a human →
                </button>
              </div>
            </div>

            {/* Live draft preview card */}
            <div style={{ position: "relative" }}>
              <div className="v-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--v-line)" }}>
                  <div className="v-mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--v-violet-deep)" }}>
                    Live draft · 00:04:12
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="v-chip-dot" />
                    <span className="v-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>Composing</span>
                  </div>
                </div>
                <div style={{ padding: 28 }}>
                  <div className="v-eyebrow" style={{ color: "var(--v-violet)" }}>Kyoto — Day iii of vii</div>
                  <h4 style={{ marginTop: 16, fontFamily: "var(--v-font-display)", fontSize: 26, fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.15, color: "var(--v-ink)" }}>
                    Morning at Saiho-ji,<br />then Arashiyama on foot.
                  </h4>
                  <div className="v-rule" style={{ marginTop: 24 }} />
                  {[
                    ["06:40", "Walk to Katsura river",   "Light fog forecast · 14°"],
                    ["09:00", "Saiho-ji · moss garden",  "Letter reservation confirmed"],
                    ["12:30", "Lunch · Shigetsu",        "Shōjin ryōri · ¥6,800"],
                    ["15:00", "Bamboo grove, slowly",    "Avoid 11–14 window"],
                  ].map(([t, e, m]) => (
                    <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "14px 0", borderBottom: "1px solid var(--v-line)" }}>
                      <span className="v-numeral" style={{ fontSize: 18, color: "var(--v-violet-deep)", minWidth: 54 }}>{t}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontFamily: "var(--v-font-ui)", color: "var(--v-ink)" }}>{e}</div>
                        <div className="v-mono v-muted" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{m}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
                    <div className="v-mono v-muted" style={{ fontSize: 11 }}>— daily spend ·</div>
                    <div className="v-numeral" style={{ fontSize: 22, color: "var(--v-ink)" }}>¥ 38,400</div>
                  </div>
                </div>
              </div>

              {/* Floating meta chips */}
              <div style={{
                position: "absolute", top: -24, right: -24,
                background: "var(--v-ink)", color: "white",
                padding: "14px 18px", borderRadius: 10,
                boxShadow: "var(--v-shadow-hi)",
                animation: "v-float-y 5s ease-in-out infinite",
              }}>
                <div className="v-eyebrow" style={{ fontSize: 9, color: "var(--v-violet-2)" }}>Weather · arashiyama</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="v-numeral" style={{ fontSize: 28, color: "var(--v-violet-2)" }}>14°</span>
                  <span className="v-mono" style={{ fontSize: 10, opacity: 0.6 }}>light fog → clear by 10:00</span>
                </div>
              </div>
              <div style={{
                position: "absolute", bottom: -24, left: -24,
                background: "linear-gradient(135deg, var(--v-violet), var(--v-sky-deep))", color: "white",
                padding: "14px 18px", borderRadius: 10,
                boxShadow: "var(--v-shadow-hi)",
                animation: "v-float-y 6.5s ease-in-out infinite",
              }}>
                <div className="v-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>Trip total</div>
                <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="v-numeral" style={{ fontSize: 28 }}>$ 4,812</span>
                  <span className="v-mono" style={{ fontSize: 10 }}>· under budget by 6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="v-on-dark" style={{ padding: "80px 0 32px", position: "relative" }}>
        <div className="v-orb v-orb-sky" style={{ width: 400, height: 400, bottom: -100, right: -80, opacity: 0.1 }} />
        <div className="v-shell" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 48 }}>
            <div>
              <WanderlyLogo />
              <p style={{ marginTop: 24, fontFamily: "var(--v-font-display)", fontSize: 20, fontWeight: 300, lineHeight: 1.3, letterSpacing: "-0.01em", color: "rgba(247,243,255,0.80)", maxWidth: 280 }}>
                A quiet atelier for <span className="v-serif-italic" style={{ color: "var(--v-violet-2)" }}>considered</span> travel.
              </p>
            </div>
            {[
              { title: "Journeys", items: ["Sample itineraries", "Destinations A–Z", "The concierge", "Private jets"] },
              { title: "Atelier",  items: ["About", "Journal", "Press", "Careers"] },
              { title: "Members", items: ["Sign in", "Begin planning", "Saved", "Gift a trip"] },
              { title: "Contact", items: ["atelier@wanderly", "+1 (212) 555 0114", "New York · Paris", "Kyoto · Mexico City"] },
            ].map(col => (
              <div key={col.title}>
                <div className="v-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>{col.title}</div>
                <ul style={{ listStyle: "none", display: "grid", gap: 10, marginTop: 24, fontSize: 14, fontFamily: "var(--v-font-ui)" }}>
                  {col.items.map(item => <li key={item} style={{ opacity: 0.65, color: "white" }}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="v-rule-dark" style={{ marginTop: 64 }} />
          <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, opacity: 0.45, fontFamily: "var(--v-font-ui)", color: "white" }}>
            <div>© MMXXVI Wanderly Atelier · All rights, quietly reserved.</div>
            <div className="v-mono">N 40°43′ · W 74°00′ — listening.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function WanderlyLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "white" }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M14 2 L14 26 M2 14 L26 14" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <path d="M6 14 Q14 4 22 14 Q14 24 6 14 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="14" cy="14" r="2" fill="var(--v-violet-2)" />
      </svg>
      <div style={{ fontFamily: "var(--v-font-display)", fontSize: 22, letterSpacing: "-0.02em", fontWeight: 400 }}>
        Wanderly<span style={{ color: "var(--v-violet-2)", fontStyle: "italic" }}>.</span>
      </div>
    </div>
  );
}
