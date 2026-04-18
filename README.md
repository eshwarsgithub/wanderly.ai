# Wanderly.ai

An AI-powered travel planning atelier. Describe your trip in plain language — Wanderly drafts a full multi-day itinerary, complete with activities, costs, weather context, real flights, hotels, and restaurants.

**Live app:** `wanderlytrip-ai/` · `npm run dev` → http://localhost:3000

---

## What it does

- **Natural language input** — type a sentence like *"Ten days in Kyoto, late April. One ryokan at the end."* and get a complete itinerary
- **AI itinerary generation** — Claude claude-sonnet-4-6 drafts day-by-day plans with times, costs, tips, and packing notes, tuned to season, vibe, and traveler count
- **Live weather context** — OpenWeatherMap forecast injected into the AI prompt so suggestions are weather-aware
- **Activity swap** — hover any activity and swap it; Claude returns 3 alternatives inline
- **AI chat refinement** — refine in plain language ("swap day 4 for something quieter"); a diff summary shows exactly what changed
- **Real flights & hotels** — Amadeus API search with Skyscanner / Booking.com book links
- **Real restaurants** — Google Places API with photos, ratings, and Google Maps links; Claude AI fallback
- **Flight price alerts** — track any route; alerts saved to Supabase, visible on /saved
- **PDF export** — clean printable itinerary via `@react-pdf/renderer`
- **Trip sharing** — public share links (`/trip/share/[slug]`) with read-only view
- **Saved trips** — Supabase-persisted gallery with delete and reload on refresh
- **PWA** — installable, cached for offline viewing

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| Styling | Tailwind v4 — CSS-only theme in `app/globals.css` |
| UI | shadcn/ui, lucide-react |
| Animation | Framer Motion 12 |
| AI | LangChain.js + Anthropic claude-sonnet-4-6 |
| Database | Supabase (Postgres + Auth + RLS) |
| Maps | @vis.gl/react-google-maps |
| Flights / Hotels | Amadeus API (test env) |
| Images | Pexels API (fallback: loremflickr) |
| PDF | @react-pdf/renderer |
| PWA | @ducanh2912/next-pwa |

---

## Getting started

```bash
cd wanderlytrip-ai
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

### Required env vars (`.env.local`)

```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
PEXELS_API_KEY=
OPENWEATHERMAP_API_KEY=
GOOGLE_PLACES_API_KEY=
OPENROUTER_API_KEY=
```

### Supabase setup

Run `wanderlytrip-ai/supabase-schema.sql` in the Supabase SQL editor to create the `trips`, `profiles`, and `flight_alerts` tables with RLS policies.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — editorial hero, photo marquee, destination atlas, journal |
| `/generate` | Trip generator form with natural language input |
| `/trip/[id]` | Trip dashboard — timeline, mood board, map, budget tracker, AI chat |
| `/flights` | Real-time flight search (Amadeus) with price tracking |
| `/hotels` | Hotel search (Amadeus) with Booking.com links |
| `/restaurants` | AI + Google Places restaurant picks |
| `/explore` | Public trip inspiration gallery |
| `/saved` | Saved trips + flight alerts (requires auth) |
| `/profile` | User travel preferences |
| `/share/[token]` | Shareable read-only trip view |
| `/guide/[destination]` | AI destination guide |

---

## Key files

```
wanderlytrip-ai/
  app/
    page.tsx                      ← landing page
    trip/[id]/page.tsx            ← trip dashboard
    actions/generate-itinerary.ts ← server actions wrapping AI
    api/flights/route.ts
    api/hotels/route.ts
    api/restaurants/route.ts
    api/images/route.ts           ← Pexels proxy
    api/weather/route.ts
  components/
    InteractiveTimeline.tsx       ← accordion day cards + swap panel
    ItineraryCard.tsx             ← single activity card
    AIChatAssistant.tsx           ← floating chat + diff summary
    BudgetTracker.tsx             ← floating budget sidebar
    TripPDF.tsx                   ← PDF renderer
    TripMap.tsx                   ← Google Maps with activity pins
  lib/
    ai-agent.ts                   ← generateItinerary, refineItinerary
    amadeus.ts                    ← AmadeusClient
    supabase.ts                   ← auth helpers, CRUD, flight alerts
    weather.ts                    ← OpenWeatherMap forecast
    pexels.ts                     ← Pexels image search
```

---

## Design system

All theme tokens live in `app/globals.css` under `@theme inline` (Tailwind v4 — no `tailwind.config.ts`).

Editorial black-and-white palette: `--v-ink: #0f0f0f`, amber accents `#F59E0B`, violet only for editorial italic text and the logo mark.

Custom CSS utilities: `.v-display`, `.v-serif-italic`, `.v-mono`, `.v-card`, `.v-plate-*`, `.v-btn`, `.v-shell`, `.v-on-dark`, `.glass`.

---

## Commands

```bash
npm run dev       # development server
npm run build     # production build + type check
npm run lint      # eslint
```

---

## Roadmap completed

- [x] Phase 0–7: Scaffold, theme, landing, AI agent, dashboard, Supabase auth
- [x] Phase 8: Data integrity — trip persistence, travelers, Pexels images, empty states
- [x] Phase 9: Polish — richer AI prompting, NL input, activity swap, chat diff, weather, PDF, auto-save, user profile
- [x] Phase 10: AI superpowers — Google Places restaurants, flight price tracker
- [x] Phase 11: Social — trip sharing, explore gallery, PWA

---

*A quiet atelier for considered travel.*
