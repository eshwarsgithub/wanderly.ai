# WanderlyTrip.ai — Product & Implementation Reference

> **Last updated:** 2026-04-10  
> **Repo:** https://github.com/eshwarsgithub/wanderly.ai  
> **App root:** `wanderlytrip-ai/`  
> **Dev:** `cd wanderlytrip-ai && npm run dev` → http://localhost:3000

---

## 1. Product Vision

AI-powered travel planning web app. A user describes their trip (destination, dates, budget, travelers, vibe) and Claude generates a complete, day-by-day itinerary with activities, costs, tips, maps, packing lists, weather, transport, phrasebooks, visa info, and more — all in one cinematic dashboard.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.2 — App Router, Turbopack |
| Styling | Tailwind v4 — NO `tailwind.config.ts`; all theme in `app/globals.css` under `@theme inline` |
| UI Components | shadcn/ui (base-ui), lucide-react |
| Animation | Framer Motion 12 |
| AI | LangChain.js + `@langchain/anthropic` → `claude-sonnet-4-6` |
| Database | Supabase (Postgres + Auth + RLS) |
| Maps | `@vis.gl/react-google-maps` |
| Flights / Hotels | Amadeus API (test env: `test.api.amadeus.com`) |
| Images | `loremflickr.com` via `lib/images.ts` (no key, topic-relevant) |

### Brand Tokens (in `app/globals.css`)
```
--color-teal: #00f5d4
--color-dark-base: #0a0a0a
```

### Custom CSS Utilities
`.glass` · `.teal-glow` · `.cinematic-overlay` · `.mountain-gradient`

---

## 3. Environment Variables

File: `wanderlytrip-ai/.env.local`

```env
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # needs Maps JS API + Geocoding API enabled
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
```

---

## 4. Database Schema (Supabase)

### `public.trips`
| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | client-generated `trip-{timestamp}-{random}` |
| `user_id` | uuid → auth.users | ON DELETE CASCADE |
| `destination` | text | |
| `vibe` | text | |
| `budget` | integer | USD |
| `travelers` | integer DEFAULT 1 | |
| `start_date` | text | ISO date |
| `end_date` | text | ISO date |
| `itinerary` | jsonb | full `GeneratedItinerary` object |
| `share_token` | text | unique token for public share link |
| `is_public` | boolean DEFAULT false | shown in /explore feed |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-stamped via trigger |

**Indexes:** `trips_user_id_idx`, `trips_created_at_idx`, `trips_itinerary_gin` (GIN), `trips_destination_lower_idx`  
**RLS:** 4 policies — select/insert/update/delete own rows via `auth.uid()`  
**Trigger:** `trips_updated_at` auto-stamps `updated_at`

---

### `public.profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK → auth.users | ON DELETE CASCADE |
| `email` | text | |
| `full_name` | text | |
| `avatar_url` | text | |
| `home_city` | text | user preference |
| `currency` | text DEFAULT 'USD' | preferred currency |
| `dietary` | text[] | e.g. ["Vegetarian", "Halal"] |
| `travel_style` | text | maps to vibe |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-stamped |

**Trigger:** `on_auth_user_created` — auto-inserts profile row on every new signup  
**RLS:** select + update own row

---

### `public.trip_collaborators`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `trip_id` | text → trips.id | |
| `email` | text | invited collaborator email |
| `role` | "editor" \| "viewer" | |
| `created_at` | timestamptz | |

---

### Migration History (applied via Supabase MCP)
1. `recreate_trips_table_correct_schema` — dropped old trips (uuid id, wrong columns), recreated
2. `create_profiles_table` — profiles + auto-create trigger

---

## 5. AI Agent (`lib/ai-agent.ts`)

**Model:** `claude-sonnet-4-6` via LangChain `ChatOpenAI` (OpenAI-compatible endpoint)

### Key TypeScript Interfaces

```ts
interface Activity {
  id: string;
  time: string;           // "09:00"
  name: string;
  description: string;
  location: string;
  category: "food" | "activity" | "transport" | "accommodation" | "sightseeing";
  estimatedCost: number;  // USD
  currency: string;
  duration: string;       // "2 hours"
  tips: string;
  imageQuery: string;
}

interface ItineraryDay {
  day: number;
  date: string;           // ISO
  theme: string;          // "Street food & Old Town"
  activities: Activity[];
  dailyCost: number;
  mood: string;
  city?: string;          // multi-destination
}

interface GeneratedItinerary {
  id: string;
  destination: string;
  country: string;
  vibe: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  summary: string;
  highlights: string[];
  days: ItineraryDay[];
  packingTips: string[];
  bestTimeToVisit: string;
  localCustoms: string[];
}

interface TripInput {
  destination: string;
  destinations?: DestinationStop[];  // multi-stop
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  vibe: string;
}
```

### Exported Functions
- `generateItinerary(input: TripInput): Promise<GeneratedItinerary>`
- `refineItinerary(existing: GeneratedItinerary, userMessage: string): Promise<GeneratedItinerary>`

---

## 6. Complete Route Map

### Pages

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Server | Landing: Navbar + HeroSection + HowItWorks + FeaturesSection + StatsSection + PopularDestinations + CTA |
| `/generate` | `app/generate/page.tsx` | Client | Trip generator form |
| `/trip/[id]` | `app/trip/[id]/page.tsx` | Client | Full trip dashboard (reads sessionStorage) |
| `/share/[token]` | `app/share/[token]/page.tsx` | Server | Public read-only shared trip view |
| `/trip/share/[slug]` | `app/trip/share/[slug]/page.tsx` | Server | Alternate share route |
| `/explore` | `app/explore/page.tsx` | Client | Public trips feed with filters |
| `/guide/[destination]` | `app/guide/[destination]/page.tsx` | Server | AI-generated destination travel guide |
| `/flights` | `app/flights/page.tsx` | Client | Amadeus flight search + Skyscanner Book links |
| `/hotels` | `app/hotels/page.tsx` | Client | Amadeus hotel search + Booking.com links |
| `/restaurants` | `app/restaurants/page.tsx` | Client | Claude AI restaurant picks + TripAdvisor links |
| `/saved` | `app/saved/page.tsx` | Client | Auth-gated trip gallery with delete |
| `/profile` | `app/profile/page.tsx` | Client | User preferences: home city, currency, dietary, travel style |
| `/auth/login` | `app/auth/login/page.tsx` | Client | Supabase sign in / sign up |

### API Routes

| Endpoint | Method | Source | Notes |
|----------|--------|--------|-------|
| `/api/flights` | GET | Amadeus | `origin, destination, date, adults` |
| `/api/hotels` | GET | Amadeus | `cityCode, checkIn, checkOut, adults` |
| `/api/restaurants` | GET | Claude AI | `destination` |
| `/api/images` | GET | loremflickr | `query, seed` |
| `/api/weather` | GET | weather lib | `destination, startDate, endDate` |
| `/api/export-pdf` | POST | Puppeteer/React-PDF | Exports trip as PDF |
| `/api/places` | GET | Google Places | `query, lat, lng` |
| `/api/places/detail` | GET | Google Places | `placeId` |
| `/api/exchange-rate` | GET | Exchange rate API | `from, to, amount` |
| `/api/phrasebook` | GET | Claude AI | `destination, language` |
| `/api/transport` | GET | Claude AI | `destination` |
| `/api/weather-advisory` | GET | Claude AI | `destination, startDate` |
| `/api/similar-destinations` | GET | Claude AI | `destination, vibe` |
| `/api/visa` | GET | Claude AI | `destination, nationality` |
| `/api/emergency` | GET | Claude AI | `destination` |

---

## 7. Complete User Flows

### Flow 1 — Trip Generation
```
/generate (TripForm)
  └─ User inputs: destination, dates, budget ($500–$20K slider), travelers, vibe (7 options)
       └─ Submit → generateTripAction() [Server Action]
            └─ lib/ai-agent.ts:generateItinerary() → Claude claude-sonnet-4-6
                 └─ Returns GeneratedItinerary JSON
                      └─ sessionStorage.setItem('trip-{id}', JSON)
                           └─ router.push('/trip/{id}')
```

### Flow 2 — Trip Dashboard
```
/trip/[id] (TripDashboard — Client Component)
  └─ Read from sessionStorage (key: trip-{id})
       └─ If missing → redirect to /generate
            └─ If found → render full dashboard

Dashboard layout:
  ├─ Hero bar: destination, dates, budget, travelers, vibe pill
  ├─ Action buttons: Save Trip · Share · Export PDF · AI Chat
  ├─ Sidebar (right): TripMap (Google Maps) + NearbyPlaces + CurrencyConverter
  └─ Tabs (8 total):
       1. Itinerary   → InteractiveTimeline (accordion day cards → ItineraryCard per activity)
       2. Transport   → TransportTab (Claude-generated transport options)
       3. Weather     → WeatherTab (forecast for trip dates)
       4. Full Map    → FullMapTab (Google Maps full width)
       5. Mood Board  → MoodBoard (2×2 loremflickr image grid per day)
       6. Packing     → packingTips[] list from itinerary
       7. Nearby      → NearbyPlaces (Google Places API)
       8. Phrasebook  → Phrasebook (lazy-loaded, Claude AI phrases)

Floating overlays:
  ├─ BudgetTracker (bottom-right) — cost breakdown by category
  └─ AIChatAssistant (bottom-left) — calls refineTripAction(), auto-re-saves if trip saved
```

### Flow 3 — Save & Share
```
Save Trip button
  └─ getUser() → if null → redirect to /auth/login
       └─ saveTrip({ ...tripRecord, user_id }) → upserts to trips table
            └─ Toast: "Trip saved!"
            └─ State: saveState = "saved"

Share Trip button
  └─ shareTrip(tripId) → sets is_public=true, generates share_token
       └─ Returns share URL: /share/{share_token}
            └─ Copy to clipboard → Toast: "Link copied!"
            └─ /share/[token] renders public read-only view (Navbar + hero + InteractiveTimeline + MoodBoard)
```

### Flow 4 — AI Chat Refinement
```
AIChatAssistant (floating)
  └─ User types message (e.g. "Add a beach day on day 3")
       └─ refineTripAction(existingItinerary, message) [Server Action]
            └─ lib/ai-agent.ts:refineItinerary() → Claude
                 └─ Returns updated GeneratedItinerary
                      └─ Update sessionStorage + UI state
                           └─ If trip was already saved → auto-call saveTrip() again
```

### Flow 5 — Auth
```
/auth/login
  └─ Sign Up: supabase.auth.signUp(email, password)
       └─ DB trigger auto-creates profiles row
            └─ Redirect to /saved

  └─ Sign In: supabase.auth.signInWithPassword(email, password)
       └─ Redirect to /saved
```

### Flow 6 — Explore (Public Feed)
```
/explore
  └─ loadPublicTrips({ vibe, destination, minDays, maxDays })
       └─ SELECT * FROM trips WHERE is_public = true
            └─ Filter chips: vibe selector + destination search + duration filter
                 └─ Click trip card → /trip/[id] (loads from Supabase, falls back to sessionStorage)
```

### Flow 7 — Destination Guide
```
/guide/[destination]
  └─ getDestinationGuide(destination) [lib/guide.ts → Claude AI]
       └─ Returns: overview, best time, cuisine, transport, safety, budget, tips
            └─ Rendered as static-looking guide page
                 └─ CTA: "Plan a trip to {destination}" → /generate?destination=...
```

### Flow 8 — Saved Trips
```
/saved (auth-gated)
  └─ getUser() → if null → redirect to /auth/login
       └─ loadTrips(user.id) → SELECT * FROM trips WHERE user_id = ?
            └─ Trip gallery cards: destination, dates, vibe, budget
                 └─ Click → /trip/[id]
                 └─ Delete → deleteTrip(tripId) → removes from DB + UI
```

### Flow 9 — User Profile
```
/profile (auth-gated)
  └─ loadProfile(user.id) → profiles table
       └─ Form: home city, preferred currency, dietary restrictions, travel style
            └─ Save → saveProfile() → upserts profiles row
```

### Flow 10 — Flights / Hotels / Restaurants Search
```
/flights  → AmadeusClient.searchFlights() → /api/flights → results with Skyscanner Book link
/hotels   → AmadeusClient.searchHotels()  → /api/hotels → results with Booking.com Book link
/restaurants → Claude AI → /api/restaurants → picks with TripAdvisor link
(All pages show animated skeleton loaders while fetching)
```

---

## 8. Component Map

### Layout & Navigation
| Component | File | Purpose |
|-----------|------|---------|
| `Navbar` | `components/Navbar.tsx` | Fixed top nav, glass effect on scroll, auth state aware |

### Landing Page
| Component | File | Purpose |
|-----------|------|---------|
| `HeroSection` | `components/HeroSection.tsx` | Parallax, Framer Motion, floating orbs, CTA |
| `HowItWorks` | `components/HowItWorks.tsx` | 3-step process explainer |
| `FeaturesSection` | `components/FeaturesSection.tsx` | Feature cards grid |
| `StatsSection` | `components/StatsSection.tsx` | Social proof numbers |
| `PopularDestinations` | `components/PopularDestinations.tsx` | Destination cards linking to /guide |
| `CTASection` | `components/CTASection.tsx` | Bottom call to action |

### Trip Generation
| Component | File | Purpose |
|-----------|------|---------|
| `TripForm` | `components/TripForm.tsx` | Full form: destination, dates, budget slider, travelers, vibe |
| `VibeSelector` | `components/VibeSelector.tsx` | 7-vibe pill selector (adventure, culture, food, relaxation, romantic, luxury, chill) |
| `LoadingAnimation` | `components/LoadingAnimation.tsx` | AI loading overlay during generation |

### Trip Dashboard
| Component | File | Purpose |
|-----------|------|---------|
| `InteractiveTimeline` | `components/InteractiveTimeline.tsx` | Accordion day cards showing activity list |
| `ItineraryCard` | `components/ItineraryCard.tsx` | Single activity: time, name, desc, location, cost, tips, timeline stem |
| `MoodBoard` | `components/MoodBoard.tsx` | 2×2 loremflickr image grid per day |
| `BudgetTracker` | `components/BudgetTracker.tsx` | Floating sidebar: cost breakdown by category |
| `AIChatAssistant` | `components/AIChatAssistant.tsx` | Floating chat, calls refineTripAction, auto-re-saves |
| `TripMap` | `components/TripMap.tsx` | Google Maps with geocoded pins, day color-coding, info popups |
| `NearbyPlaces` | `components/NearbyPlaces.tsx` | Google Places nearby search from activity location |
| `CurrencyConverter` | `components/CurrencyConverter.tsx` | Live exchange rates for trip destination currency |
| `TransportTab` | `components/TransportTab.tsx` | Claude-generated transport options for destination |
| `WeatherTab` | `components/WeatherTab.tsx` | Weather forecast for trip dates |
| `WeatherWidget` | `components/WeatherWidget.tsx` | Compact weather widget used in sidebar |
| `FullMapTab` | `components/FullMapTab.tsx` | Full-width Google Maps view with all pins |
| `VisaPanel` | `components/VisaPanel.tsx` | Visa requirements for destination |
| `EmergencyPanel` | `components/EmergencyPanel.tsx` | Emergency contacts/numbers for destination |
| `Phrasebook` | `components/Phrasebook.tsx` | Lazy-loaded; Claude-generated local phrases |
| `SimilarDestinations` | `components/SimilarDestinations.tsx` | AI-suggested similar destinations |
| `CollaboratorPanel` | `components/CollaboratorPanel.tsx` | Invite editor/viewer collaborators by email |
| `ExportButton` | `components/ExportButton.tsx` | Triggers PDF export via /api/export-pdf |
| `TripPDF` | `components/TripPDF.tsx` | PDF layout component |
| `TripCardGenerator` | `components/TripCardGenerator.tsx` | Generates shareable social card image |

---

## 9. Key Library Files

| File | Purpose |
|------|---------|
| `lib/ai-agent.ts` | `generateItinerary()`, `refineItinerary()`, all TS interfaces |
| `lib/supabase.ts` | `getSupabase()` lazy singleton, auth helpers, all CRUD functions |
| `lib/amadeus.ts` | `AmadeusClient` singleton for flights + hotels |
| `lib/images.ts` | `getImageUrl(query, seed)` → loremflickr.com |
| `lib/weather.ts` | Weather forecast fetching |
| `lib/geocode.ts` | `geocodeAddress()` → Google Geocoding API → `{ lat, lng }` |
| `lib/guide.ts` | `getDestinationGuide(destination)` → Claude AI destination guide |
| `lib/utils.ts` | shadcn `cn()` utility |

### Server Actions (`app/actions/generate-itinerary.ts`)
- `generateTripAction(input: TripInput)` — calls `generateItinerary()`, stores in sessionStorage format
- `refineTripAction(existing: GeneratedItinerary, message: string)` — calls `refineItinerary()`

---

## 10. Supabase Helper Functions

```ts
// Auth
signUp(email, password)
signIn(email, password)
signOut()
getUser()

// Trips
saveTrip(trip)                         // upsert on id conflict
loadTrips(userId)                      // all trips for user, newest first
loadTrip(tripId)                       // single trip by id
deleteTrip(tripId)
loadPublicTrips(filter)                // is_public=true feed for /explore
loadTripByToken(token)                 // for /share/[token]
loadTripBySlug(slug)                   // alias for loadTripByToken
shareTrip(tripId)                      // sets is_public=true, generates share_token

// Profiles
loadProfile(userId)
saveProfile(profile)

// Collaborators
loadCollaborators(tripId)
inviteCollaborator(tripId, email, role)
removeCollaborator(collaboratorId)
```

---

## 11. Build Iterations

### Iteration 1 — Initial Scaffold
Full scaffold: all pages, components, lib files, Supabase schema, API routes, AI agent.  
Commits: `b700a2b`

### Iteration 2 — MVP Gaps Closed (2026-04-02)
- **Save Trip button** — auth check, upsert to Supabase, success/error toast
- **AIChatAssistant** — auto-re-saves after refinement if trip was already saved
- **TripMap** — Google Maps geocoded activity pins, day color-coding, info popups, graceful fallback
- **Images** — replaced deprecated `source.unsplash.com` with `loremflickr.com` via `lib/images.ts`
- **Affiliate links** — Skyscanner (flights), Booking.com (hotels), TripAdvisor (restaurants)
- **Skeleton loaders** — animated pulse on flights/hotels/restaurants pages
- **`app/error.tsx`** — global error boundary with Try Again + Go Home
- **DB cleanup** — dropped 6 orphan tables, recreated trips + profiles with correct schema  
Commits: `38cc3d1`

### Iteration 3 — Feature Expansion
- **Share Trip** — `share_token`, `is_public`, `/share/[token]` public read-only page, copy-link flow
- **Explore page** (`/explore`) — public trips feed with vibe/destination/duration filters
- **Destination Guide** (`/guide/[destination]`) — AI-generated travel guide, linked from PopularDestinations
- **User Profile** (`/profile`) — preferences: home city, currency, dietary, travel style
- **Collaborators** — `trip_collaborators` table, `CollaboratorPanel`, invite by email with role
- **PDF Export** — `ExportButton`, `TripPDF`, `/api/export-pdf`
- **Trip dashboard tabs expanded** from 3 → 8: + Transport, Weather, Full Map, Nearby, Phrasebook
- **New API routes**: weather, places, places/detail, exchange-rate, phrasebook, transport, weather-advisory, similar-destinations, visa, emergency
- **New components**: WeatherTab, TransportTab, FullMapTab, NearbyPlaces, VisaPanel, EmergencyPanel, Phrasebook, CurrencyConverter, SimilarDestinations, TripCardGenerator, WeatherWidget, HowItWorks, StatsSection, PopularDestinations
- **Landing page expanded**: HowItWorks + StatsSection + PopularDestinations sections added  
Commits: `cbfb72e`, `420b536`, `fbebcfe`

---

## 12. Pending Work

### Must-Do (App Won't Work Without)
- [ ] Fill real API keys in `wanderlytrip-ai/.env.local`
- [ ] Enable Maps JavaScript API + Geocoding API in Google Cloud Console

### High Priority
- [ ] Test full E2E: generate → dashboard → save → saved page → share → explore
- [ ] Apply `trip_collaborators` table migration via Supabase MCP (if not yet applied)
- [ ] Add `share_token` + `is_public` columns to trips table if not yet migrated

### Medium Priority
- [ ] Replace loremflickr with Pexels or official Unsplash API for real photos (`PEXELS_API_KEY`)
- [ ] Add destination hero image on trip dashboard
- [ ] Mobile: TripMap + BudgetTracker sidebar visible on mobile (currently `lg:block` hidden)
- [ ] Trip search/filter on `/saved` page

### Post-MVP
- [ ] Stripe — premium plans (unlimited trips, PDF export paywall)
- [ ] Resend — welcome email on signup, "trip ready" notification
- [ ] Multi-destination trip builder (UI for `destinations?: DestinationStop[]` in TripInput — interface ready, needs form UI)
- [ ] Real-time collaboration via Supabase Realtime

---

## 13. API Priority Reference

| Priority | API | Purpose | Env Key |
|----------|-----|---------|---------|
| Must | Anthropic | Core trip generation + all AI routes | `ANTHROPIC_API_KEY` |
| Must | Supabase | Auth + all persistence | `NEXT_PUBLIC_SUPABASE_*` |
| Should | Google Maps | TripMap pins + Geocoding + Places | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Should | Amadeus | Real flights + hotels data | `AMADEUS_CLIENT_*` |
| Nice | Pexels / Unsplash | Real destination photos | `PEXELS_API_KEY` |
| Post-MVP | Stripe | Monetization | — |
| Post-MVP | Resend | Transactional email | — |

---

## 14. Common Issues & Rules

| Issue | Rule |
|-------|------|
| `Missing script: dev` error | Always run from `wanderlytrip-ai/`, not repo root |
| Tailwind styles not applying | No `tailwind.config.ts` — add tokens in `app/globals.css` under `@theme inline` |
| Images returning 404 | Use `lib/images.ts:getImageUrl()` → loremflickr. Never `source.unsplash.com` |
| DB schema changes | Use `mcp__supabase__apply_migration` — never manual SQL dashboard edits |
| Supabase build errors | `getSupabase()` is lazy — never call at module level, only inside functions |
| Google Maps blank | Enable Maps JavaScript API + Geocoding API in Google Cloud Console |
