# WanderlyTrip.ai

> **Plan your entire trip in minutes with AI.**

A premium AI-powered travel planning platform built with Next.js 16, Claude AI, and Supabase. Generates complete, beautiful itineraries tailored to your vibe — flights, hotels, restaurants, and activities — in seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, RSC) |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion 12 |
| AI | Claude Sonnet 4.6 via Anthropic API + LangChain.js |
| Database | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| Travel Data | Amadeus Self-Service API (flights & hotels) |
| Maps | Google Maps / Places API |
| PWA | @ducanh2912/next-pwa |
| PDF | @react-pdf/renderer |
| Icons | Lucide React |

---

## Features

### AI Core
- **AI Itinerary Generator** — Destination, dates, budget, travelers, vibe → full day-by-day itinerary in ~15s
- **Natural Language Input** — Describe your trip in plain English ("2 weeks eating through SE Asia, $5k budget") → form auto-fills
- **Traveler Personas** — Solo, Couple, Family, Group — Claude adapts pacing, dining, and activity types accordingly
- **Season & Weather Awareness** — OpenWeatherMap forecast injected into prompts for near-future trips; weather badges on day cards
- **Avoid Tourist Traps** — Toggle to bias Claude toward local, authentic experiences
- **Dietary Restrictions** — Vegetarian, vegan, halal, gluten-free, etc. carried into food recommendations
- **Activity Swap** — Hover any activity → Swap button → Claude suggests 3 alternatives for that time slot
- **AI Chat Refinement** — Floating chat to refine any part of the itinerary in natural language
- **Diff View** — After every chat refinement, a "What changed" bullet list shows exactly what Claude updated
- **PDF Export** — Download a clean, branded PDF of the full itinerary with one click

### Product
- **7 Travel Vibes** — Adventure, Culture, Food, Relaxation, Romantic, Luxury, Chill
- **Interactive Timeline** — Expandable day cards with activities, costs, tips, location
- **Mood Board** — Per-day image collages via Pexels API
- **Real-time Budget Tracker** — Floating widget with per-day spend breakdown and progress bar
- **Auto-save** — Itinerary changes auto-save to Supabase for logged-in users; sync indicator in header

### Flights & Discovery
- **Real-time Flights** — Amadeus API search with Skyscanner booking links; supports prod/test env switching
- **Price Alerts** — "Track this route" saves origin/destination/date to Supabase and shows tracked routes
- **Real Restaurants** — Google Places Nearby Search with photos, ratings, Google Maps links; Claude fallback
- **Hotel Search** — Amadeus hotel search by city code

### Social
- **Trip Sharing** — Shareable public link (`/trip/share/[slug]`) — read-only view, no account required
- **Explore Gallery** — `/explore` page with public trips filterable by vibe, destination, and duration; "Use as Template" forks any trip
- **Collaborative Editing** — Invite collaborators by email; Supabase Realtime syncs itinerary changes live across all connected users

### Auth & Profile
- **Supabase Auth** — Email sign-up / sign-in with RLS-protected data
- **User Profile** — Home city, preferred currency, dietary restrictions, default travel style; pre-fills the trip form
- **Saved Trips** — Full trip gallery with delete

### PWA
- **Installable** — Web app manifest, service worker via next-pwa; installable on iOS/Android
- **Offline-friendly** — Images and weather API responses cached by service worker

---

## Getting Started

```bash
cd wanderlytrip-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local`:

```env
ANTHROPIC_API_KEY=               # claude.ai/settings
NEXT_PUBLIC_SUPABASE_URL=        # Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Settings → API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY= # Google Cloud Console (Places + Geocoding)
AMADEUS_CLIENT_ID=               # developers.amadeus.com (free)
AMADEUS_CLIENT_SECRET=           # developers.amadeus.com (free)
OPENWEATHERMAP_API_KEY=          # openweathermap.org (free tier)
AMADEUS_ENV=                     # set to "production" for live Amadeus keys (omit for test)
PEXELS_API_KEY=                  # pexels.com/api (free) — mood board images
```

### Database Setup

Run `supabase-schema.sql` in your Supabase SQL Editor. Creates:

| Table | Purpose |
|---|---|
| `trips` | Itineraries with JSONB storage, `is_public`, `share_slug` |
| `user_profiles` | Home city, currency, dietary, travel style |
| `price_alerts` | Tracked flight routes per user |
| `trip_collaborators` | Email-based collab invites with viewer/editor roles |

Also enables **Supabase Realtime** on the `trips` table for live collaborative editing.

> All tables have Row Level Security (RLS) with `(select auth.uid())` pattern for performance.

---

## Project Structure

```
wanderlytrip-ai/
├── app/
│   ├── page.tsx                       # Landing page
│   ├── generate/page.tsx              # Trip generator form
│   ├── trip/[id]/page.tsx             # Trip dashboard (timeline, swap, share, collab)
│   ├── trip/share/[slug]/page.tsx     # Public read-only shared trip view
│   ├── explore/page.tsx               # Public trip gallery with filters
│   ├── flights/page.tsx               # Flight search + price tracker
│   ├── hotels/page.tsx                # Hotel search
│   ├── restaurants/page.tsx           # Real restaurant discovery (Google Places)
│   ├── saved/page.tsx                 # Saved trips gallery
│   ├── profile/page.tsx               # User travel preferences
│   ├── auth/login/page.tsx            # Sign in / sign up
│   ├── actions/generate-itinerary.ts  # Server Actions (generate, refine, parse NL, swap)
│   └── api/
│       ├── flights/route.ts           # Amadeus flight search
│       ├── hotels/route.ts            # Amadeus hotel search
│       ├── restaurants/route.ts       # Google Places + Claude fallback
│       ├── images/route.ts            # Pexels image proxy
│       └── weather/route.ts           # OpenWeatherMap forecast proxy
├── components/
│   ├── TripForm.tsx                   # Generator form (NL input, persona, tourist traps toggle)
│   ├── InteractiveTimeline.tsx        # Day accordion + activity swap modal + weather badges
│   ├── ItineraryCard.tsx              # Activity card with hover swap button
│   ├── AIChatAssistant.tsx            # Floating chat with diff view
│   ├── ExportButton.tsx               # PDF export with @react-pdf/renderer
│   ├── CollaboratorPanel.tsx          # Invite + manage collaborators
│   ├── MoodBoard.tsx                  # Day image collage
│   ├── BudgetTracker.tsx              # Floating budget widget
│   ├── Navbar.tsx                     # Fixed nav (Explore, Flights, Hotels, Saved, Profile)
│   └── ...
├── lib/
│   ├── ai-agent.ts                    # generateItinerary, refineItinerary, parseNaturalLanguage,
│   │                                  # getActivityAlternatives, computeItineraryDiff
│   ├── weather.ts                     # OpenWeatherMap forecast + geocoding
│   ├── amadeus.ts                     # Amadeus API client (test/prod env switching)
│   └── supabase.ts                    # Supabase client + all CRUD helpers
├── public/
│   └── manifest.json                  # PWA manifest
├── supabase-schema.sql                # Full DB schema (run in Supabase SQL Editor)
└── next.config.ts                     # Next.js + next-pwa config
```

---

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build + type check
npm run lint     # ESLint
```

---

## Design

- Dark background `#0a0a0a` with teal accents `#00f5d4`
- Glassmorphism cards, cinematic gradients, mountain overlays
- Framer Motion 12 animations throughout (parallax hero, entrance, hover, swap modal)
- Mobile-first, fully responsive, PWA-installable

---

Built with [Claude Code](https://claude.ai/code)
