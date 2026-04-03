# WanderlyTrip.ai — Codebase Review & Status Brief
> Date: 2026-04-02 | For: Grok Review + Brainstorming Session

---

## Project Overview

**WanderlyTrip.ai** is an AI-powered travel planning web app.

- **Stack**: Next.js 16 (App Router) · Tailwind v4 · shadcn/ui · Framer Motion 12 · Supabase · Claude Sonnet 4.6 · LangChain.js · Amadeus API
- **Location**: `wanderlytrip-ai/` subdirectory
- **Dev**: `cd wanderlytrip-ai && npm run dev` → http://localhost:3000

---

## Current Completion: ~75%

---

## What's Fully Built

### Pages
| Page | Route | Status |
|------|-------|--------|
| Landing | `/` | Done — Hero (parallax), Features (6-grid), CTA, Navbar |
| Trip Generator | `/generate` | Done — Form: destination, dates, budget slider ($500–$20K), travelers, vibe |
| Trip Dashboard | `/trip/[id]` | Done — 3 tabs: Timeline, Mood Board, Packing Tips |
| Flights | `/flights` | Done — Search form + Amadeus API cards |
| Hotels | `/hotels` | Done — Search form + Amadeus API cards |
| Restaurants | `/restaurants` | Done — Claude AI-powered recommendations |
| Auth | `/auth/login` | Done — Supabase sign in / sign up |
| Saved Trips | `/saved` | Done — Gallery with delete, Supabase-persisted |

### Core Components
| Component | What It Does | Status |
|-----------|-------------|--------|
| `HeroSection` | Cinematic landing, floating orbs, gradient text, scroll indicator | Done |
| `FeaturesSection` | 6-feature grid with icons | Done |
| `TripForm` | Full trip generation form with validation | Done |
| `VibeSelector` | 7-vibe pill selector (Adventure, Culture, Food, Relaxation, Romantic, Luxury, Chill) | Done |
| `InteractiveTimeline` | Accordion day cards expanding to activity list | Done |
| `ItineraryCard` | Activity card: time, name, description, location, cost, category, tips, timeline stem | Done |
| `MoodBoard` | 2×2 Unsplash image grid per day | Done |
| `BudgetTracker` | Floating sidebar: total spend, per-day breakdown, remaining budget | Done |
| `AIChatAssistant` | Floating chat to refine itinerary via Claude | Done |
| `LoadingAnimation` | Multi-step cinematic loader during AI generation | Done |
| `Navbar` | Fixed header, glass on scroll, mobile hamburger | Done |

### Backend / AI
| File | What It Does | Status |
|------|-------------|--------|
| `lib/ai-agent.ts` | LangChain + Claude Sonnet 4.6 — `generateItinerary()` + `refineItinerary()` | Done |
| `lib/amadeus.ts` | Amadeus API client — flights + hotels | Done (needs credentials) |
| `lib/supabase.ts` | Supabase client, auth helpers, `saveTrip()` / `loadTrips()` / `deleteTrip()` | Done (needs setup) |
| `app/actions/generate-itinerary.ts` | Server Actions wrapping AI agent | Done |
| `app/api/flights/route.ts` | GET `/api/flights` — Amadeus flight search | Done |
| `app/api/hotels/route.ts` | GET `/api/hotels` — Amadeus hotel search | Done |
| `app/api/restaurants/route.ts` | GET `/api/restaurants` — Claude AI recommendations | Done |
| `supabase-schema.sql` | DB schema: trips table, RLS, indexes | Done (needs to be run) |

---

## What's Partially Done

| Feature | Gap |
|---------|-----|
| **Amadeus API** | Code correct, needs real `AMADEUS_CLIENT_ID` + `AMADEUS_CLIENT_SECRET` in `.env.local` |
| **Supabase CRUD** | `saveTrip()` is written — no "Save Trip" button on `/trip/[id]` to call it |
| **Google Maps** | Package installed (`@vis.gl/react-google-maps`) — zero implementation in UI |
| **Trip Persistence** | SessionStorage only — trips lost on tab close if not logged in + saved |

---

## What's Missing (Priority Order)

| # | Feature | Gap | Effort |
|---|---------|-----|--------|
| 1 | **Save Trip Button** | `/trip/[id]` has no way to persist to Supabase | Low |
| 2 | **Trip Persistence** | SessionStorage clears on tab close | Low |
| 3 | **Google Maps** | Promised in UI copy, package installed, but zero implementation | Medium |
| 4 | **Booking Redirects** | "Book Now" buttons are dead — no external link to Skyscanner/Booking.com | Low |
| 5 | **Error Boundaries** | No `error.tsx` — crashes show blank screen | Low |
| 6 | **Skeleton Loaders** | Search pages have no loading states while fetching | Low |
| 7 | **Unsplash Fix** | Using deprecated `source.unsplash.com` — should switch to Pexels or official Unsplash API | Low |
| 8 | **Trip Sharing** | Mentioned in features section but zero implementation | Medium |
| 9 | **Tests** | No tests exist in the repo | High (if going to prod) |

---

## Tracking Against the Plan (from CLAUDE.md)

| Step | Status |
|------|--------|
| Add API keys to `.env.local` | Pending — your credentials needed |
| Run `supabase-schema.sql` in Supabase SQL Editor | Pending — your Supabase project |
| Replace Unsplash `source.unsplash.com` with proper image API | Not done |
| Add Google Maps to trip dashboard | Not done |
| Add "Save Trip" button calling `saveTrip()` | Not done |

---

## Data Flow (Key Route)

```
User fills TripForm
  → Server Action: generateTripAction()
    → lib/ai-agent.ts: generateItinerary()
      → Claude Sonnet 4.6 via LangChain
        → Returns GeneratedItinerary JSON
  → sessionStorage.setItem('trip-{id}', JSON)
  → redirect to /trip/[id]
    → TripDashboard reads sessionStorage
      → InteractiveTimeline + MoodBoard + BudgetTracker + AIChatAssistant
        → AIChatAssistant calls refineTripAction()
          → lib/ai-agent.ts: refineItinerary()
```

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0a0a0a` (dark base) |
| Primary accent | `#00f5d4` (teal) |
| Secondary accent | `#00c4aa` |
| Animations | Framer Motion — parallax, entrance, hover, loading |
| Cards | Glassmorphism (`.glass` utility class) |
| Key gradient | `.mountain-gradient`, `.cinematic-overlay`, `.teal-glow` |
| Theme config | `app/globals.css` under `@theme inline` (Tailwind v4, no config file) |

---

## Env Vars Required

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
```

---

## Recommended Next Actions

### Unblock the App (do first)
1. Add all API keys to `.env.local`
2. Run `supabase-schema.sql` in Supabase SQL Editor

### High Value (build next)
1. **Save Trip button** on `/trip/[id]` — one function call, `saveTrip()` already exists
2. **Google Maps** in trip dashboard sidebar — map pins per activity location
3. **Booking redirect links** — Skyscanner/Booking.com deep links for flight + hotel results
4. **Pexels/Unsplash API** — replace deprecated `source.unsplash.com` image URLs

### Stretch Goals (brainstorm)
- Real-time collaborative trip editing (Supabase Realtime)
- Trip sharing via public URL / social cards
- PDF export of itinerary
- Weather integration per destination + dates
- Price alerts for flights/hotels
- AI trip version history (compare refinements)
- Monetization — premium vibes, longer itineraries, priority generation

---

## Open Questions for Brainstorming

1. Should trip generation be behind auth (require login) or stay open?
2. What's the sharing model — public link, invite-only, or social?
3. Is Amadeus the right API or should we swap to a simpler aggregator (Skyscanner API, Kiwi.com)?
4. Should we keep `source.unsplash.com` (no key needed) or invest in proper Pexels/Unsplash integration?
5. What's the monetization angle — freemium, per-trip credit, subscription?
6. Mobile app someday — or keep web-first?
7. Onboarding flow — should we collect travel preferences on first login for personalization?
