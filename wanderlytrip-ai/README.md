# WanderlyTrip.ai

> **Plan your entire trip in minutes with AI.**

A premium AI-powered travel planning platform built with Next.js 16, OpenAI GPT-4o, and Supabase. Generates complete, beautiful itineraries tailored to your vibe — flights, hotels, restaurants, and activities — in seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, RSC) |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion 12 |
| AI | OpenAI GPT-4o / GPT-4o-mini via LangChain.js |
| Database | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| Travel Data | Amadeus Self-Service API (flights & hotels) |
| Maps | Google Maps / Places API (`@vis.gl/react-google-maps`) |
| Images | Pexels API |
| PWA | @ducanh2912/next-pwa |
| PDF | @react-pdf/renderer |
| Icons | Lucide React |

---

## Features

### AI Core
- **AI Itinerary Generator** — Destination, dates, budget, travelers, vibe → full day-by-day itinerary in ~15s powered by GPT-4o
- **Natural Language Input** — Describe your trip in plain English ("2 weeks eating through SE Asia, $5k budget") → form auto-fills
- **Traveler Personas** — Solo, Couple, Family, Group — AI adapts pacing, dining, and activity types accordingly
- **Season & Weather Awareness** — OpenWeatherMap forecast injected into prompts; weather badges on day cards
- **Avoid Tourist Traps** — Toggle to bias AI toward local, authentic experiences
- **Dietary Restrictions** — Vegetarian, vegan, halal, gluten-free, etc. carried into food recommendations
- **Activity Swap** — Hover any activity → Swap button → GPT-4o suggests 3 alternatives for that time slot
- **AI Chat Refinement** — Floating chat to refine any part of the itinerary in natural language
- **Diff View** — After every chat refinement, a "What changed" bullet list shows exactly what was updated
- **PDF Export** — Download a clean, branded PDF of the full itinerary with one click

### Trip Dashboard Tabs
- **Timeline** — Expandable day cards with drag-to-reorder activities via Framer Motion
- **Transport** — AI-generated transit guide (metro/bus/taxi/walk/ferry) between activities with costs & Google Maps directions
- **Weather** — 5-day forecast with AI packing suggestions based on conditions
- **Map** — Full interactive map with 4 layer toggles: Itinerary pins, Restaurants, Hotels, Attractions
- **Nearby** — Find POIs (attractions, restaurants, cafés) near any activity using Google Places
- **Phrasebook** — AI-generated local phrases by category (greetings, food, transport, emergency)
- **Mood Board** — Per-day photo collages via Pexels API
- **Packing** — Smart packing list

### Dashboard Sidebar
- **Live Map** — Real-time activity pins for the active day
- **Visa Panel** — Visa type, stay limit, cost, processing time for 10 passport nationalities
- **Emergency Contacts** — Police / ambulance / embassy numbers with tap-to-call links
- **Currency Converter** — Live exchange rates via frankfurter.app, budget in local currency
- **Similar Destinations** — AI suggests 3 destinations you'd also love based on your vibe & budget
- **Budget Tracker** — Per-day spend breakdown with progress bar

### Booking & Discovery
- **Booking Links** — Viator, GetYourGuide, TripAdvisor deeplinks on every activity card
- **Real-time Flights** — Amadeus API search with Skyscanner booking links
- **Hotel Search** — Amadeus hotel search by city code
- **Real Restaurants** — Google Places Nearby Search with photos, ratings, Google Maps links
- **Destination Guide** — `/guide/[destination]` — overview, must-see, local cuisine, getting around, safety, cultural tips

### Social & Sharing
- **Trip Card Generator** — Downloadable 800×420 PNG card for sharing on Instagram / Twitter
- **Trip Sharing** — Shareable public link (`/share/[token]`) — read-only, no account required
- **Explore Gallery** — `/explore` page with public trips filterable by vibe, destination, duration
- **Collaborative Editing** — Invite collaborators by email; Supabase Realtime syncs changes live

### Navigation
- **Smart Navbar** — Fixed glass navbar with animated active pill, icons on all links
- **Home Button** — Dedicated home icon button visible on every inner page
- **Auth-aware Profile Dropdown** — Avatar, username, My Trips / Profile / Sign out when logged in

### Auth & Profile
- **Supabase Auth** — Email sign-up / sign-in with RLS-protected data
- **User Profile** — Home city, preferred currency, dietary restrictions, default travel style
- **Saved Trips** — Full trip gallery with delete

### PWA
- **Installable** — Web app manifest + service worker; installable on iOS/Android
- **Offline-friendly** — Cached images and weather responses

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
OPENAI_API_KEY=                  # platform.openai.com
NEXT_PUBLIC_SUPABASE_URL=        # Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Settings → API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY= # Google Cloud Console (Places + Geocoding + Maps JS)
AMADEUS_CLIENT_ID=               # developers.amadeus.com (free)
AMADEUS_CLIENT_SECRET=           # developers.amadeus.com (free)
OPENWEATHERMAP_API_KEY=          # openweathermap.org (free tier)
PEXELS_API_KEY=                  # pexels.com/api (free) — mood board images
```

### Database Setup

Run `supabase-schema.sql` in your Supabase SQL Editor. Creates:

| Table | Purpose |
|---|---|
| `trips` | Itineraries with JSONB storage, `is_public`, `share_token` |
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
│   ├── trip/[id]/page.tsx             # Trip dashboard (8 tabs + sidebar panels)
│   ├── share/[token]/page.tsx         # Public read-only shared trip view
│   ├── explore/page.tsx               # Public trip gallery with filters
│   ├── guide/[destination]/page.tsx   # Destination guide page
│   ├── flights/page.tsx               # Flight search + price tracker
│   ├── hotels/page.tsx                # Hotel search
│   ├── restaurants/page.tsx           # Real restaurant discovery
│   ├── saved/page.tsx                 # Saved trips gallery
│   ├── profile/page.tsx               # User travel preferences
│   ├── auth/login/page.tsx            # Sign in / sign up
│   ├── actions/generate-itinerary.ts  # Server Actions (generate, refine, parse NL, swap)
│   └── api/
│       ├── flights/route.ts           # Amadeus flight search
│       ├── hotels/route.ts            # Amadeus hotel search
│       ├── restaurants/route.ts       # GPT-4o-mini restaurant recommendations
│       ├── images/route.ts            # Pexels image proxy
│       ├── weather/route.ts           # OpenWeatherMap forecast proxy
│       ├── weather-advisory/route.ts  # AI weather tips + packing suggestions
│       ├── transport/route.ts         # AI transit guide per day
│       ├── visa/route.ts              # AI visa requirements by passport
│       ├── emergency/route.ts         # AI emergency contacts by destination
│       ├── phrasebook/route.ts        # AI travel phrasebook by destination
│       ├── similar-destinations/route.ts  # AI destination suggestions
│       ├── places/route.ts            # Google Places nearby search
│       └── places/detail/route.ts     # Google Places detail
├── components/
│   ├── Navbar.tsx                     # Fixed nav with home button, profile dropdown, animated pill
│   ├── TripForm.tsx                   # Generator form (NL input, persona, vibe selector)
│   ├── InteractiveTimeline.tsx        # Day accordion with drag-to-reorder (Framer Motion Reorder)
│   ├── ItineraryCard.tsx              # Activity card with booking links (Viator, GYG, TripAdvisor)
│   ├── TripCardGenerator.tsx          # Canvas 800×420 PNG trip card for social sharing
│   ├── VisaPanel.tsx                  # Visa requirements collapsible panel
│   ├── EmergencyPanel.tsx             # Emergency contacts with tap-to-call
│   ├── CurrencyConverter.tsx          # Live currency converter (frankfurter.app)
│   ├── SimilarDestinations.tsx        # AI destination suggestions sidebar widget
│   ├── TransportTab.tsx               # AI transit guide with mode icons and Maps links
│   ├── WeatherTab.tsx                 # 5-day forecast + AI advisory
│   ├── FullMapTab.tsx                 # Interactive map with layer toggles
│   ├── NearbyPlaces.tsx               # Google Places POI search near activities
│   ├── AIChatAssistant.tsx            # Floating chat with diff view
│   ├── MoodBoard.tsx                  # Day image collage via Pexels
│   ├── BudgetTracker.tsx              # Floating budget widget
│   └── WeatherWidget.tsx              # Inline weather badge on day cards
├── lib/
│   ├── ai-agent.ts                    # generateItinerary, refineItinerary, parseNaturalLanguage,
│   │                                  # getActivityAlternatives (all powered by GPT-4o)
│   ├── guide.ts                       # getDestinationGuide (GPT-4o-mini)
│   ├── geocode.ts                     # geocodeAddress, haversineDistance
│   ├── weather.ts                     # OpenWeatherMap forecast + geocoding
│   ├── amadeus.ts                     # Amadeus API client
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

- Navy `#0f172a` + teal `#00f5d4` / `#00a896` brand palette
- Glassmorphism navbar, cinematic hero gradients
- Framer Motion 12 animations throughout (parallax, entrance, drag-to-reorder, animated nav pill)
- Mobile-first, fully responsive, PWA-installable

---

Built with [Claude Code](https://claude.ai/code)
