# WanderlyTrip.ai — Complete Application Documentation

> Stack: Next.js 16 · React 19 · Tailwind v4 · Framer Motion 12 · Supabase · Claude/Gemini/DeepSeek via OpenRouter · Amadeus API · Google Maps · OpenWeatherMap

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Pages & Routes](#3-pages--routes)
4. [Components](#4-components)
5. [Server Actions](#5-server-actions)
6. [API Routes](#6-api-routes)
7. [Library Modules](#7-library-modules)
8. [Database Schema](#8-database-schema)
9. [AI System](#9-ai-system)
10. [Design System](#10-design-system)
11. [Environment Variables](#11-environment-variables)
12. [User Flows & Workflows](#12-user-flows--workflows)
13. [Feature Inventory](#13-feature-inventory)
14. [Pending Enhancements](#14-pending-enhancements)

---

## 1. Project Overview

WanderlyTrip.ai is an AI-powered travel planning application. Users describe a trip, and the app generates a complete day-by-day itinerary with activities, budgets, weather, flights, hotels, restaurants, maps, and more. Trips can be saved, shared publicly, and collaboratively edited.

### Core Value Propositions
- **AI itinerary generation** — full trip plans in seconds via Claude/Gemini
- **Real-time data** — live weather, flights (Amadeus), hotels, currency rates
- **Social layer** — share trips publicly, fork others' plans, collaborate
- **Rich trip dashboard** — timelines, maps, mood boards, packing lists, phrasebooks

---

## 2. Architecture

```
wanderlytrip-ai/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── generate/page.tsx        # Trip generator form
│   ├── trip/[id]/page.tsx       # Full trip dashboard
│   ├── trip/share/[slug]/       # Public share view (slug)
│   ├── share/[token]/           # Legacy share view (token)
│   ├── guide/[destination]/     # AI destination guide
│   ├── explore/page.tsx         # Browse public trips
│   ├── flights/page.tsx         # Flight search
│   ├── hotels/page.tsx          # Hotel search
│   ├── restaurants/page.tsx     # Restaurant recommendations
│   ├── saved/page.tsx           # User's saved trips
│   ├── profile/page.tsx         # User preferences
│   ├── auth/login/page.tsx      # Login / signup
│   ├── error.tsx                # Global error boundary
│   ├── actions/                 # Server Actions
│   └── api/                     # API Route Handlers
├── components/                  # React components
├── lib/                         # Business logic & integrations
├── supabase-schema.sql          # Database schema
└── globals.css                  # Tailwind v4 theme
```

### Data Flow Summary

```
User Input
    ↓
TripForm (client)
    ↓
generateTripAction (Server Action)
    ↓
generateItinerary() → OpenRouter → Gemini 2.5 Pro
    ↓ JSON itinerary
sessionStorage.setItem('trip-{id}')
    ↓
redirect /trip/[id]
    ↓
TripDashboard reads sessionStorage
    ↓ (optional)
saveTrip() → Supabase DB
```

---

## 3. Pages & Routes

### `/` — Landing Page
**File**: `app/page.tsx`

Sections rendered (top → bottom):
| Section | Description |
|---|---|
| `Navbar` | Fixed header with navigation |
| `HeroSection` | Parallax hero with CTA to `/generate` |
| `StatsSection` | Key metrics (trips generated, destinations, users) |
| `HowItWorks` | 3-step explainer with icons |
| `FeaturesSection` | Feature grid cards |
| `PopularDestinations` | Destination cards linking to `/generate?destination=X` |
| `CTASection` | Final call-to-action banner |

---

### `/generate` — Trip Generator
**File**: `app/generate/page.tsx`  
**Query param**: `?destination=<pre-fill>`

- Renders `TripForm` with all planning inputs
- Shows `LoadingAnimation` overlay while AI generates
- On success: stores itinerary in `sessionStorage('trip-{id}')` → redirects to `/trip/[id]`

---

### `/trip/[id]` — Trip Dashboard
**File**: `app/trip/[id]/page.tsx`  
**Data source**: `sessionStorage` (fast) or Supabase (persisted)

This is the core feature page. It has a **tab-based layout** plus a **floating sidebar**:

#### Tab System
| Tab | Component | Description |
|---|---|---|
| Timeline | `InteractiveTimeline` | Day-by-day accordion with activities |
| Transport | `TransportTab` | Inter-city/day travel suggestions |
| Weather | `WeatherTab` | 5-day weather forecast |
| Full Map | `FullMapTab` | Google Maps with all activity pins |
| Mood Board | `MoodBoard` | Photo grid per day |
| Packing | inline | Packing list from AI |
| Nearby Places | `NearbyPlaces` | Google Places search near activities |
| Phrasebook | `Phrasebook` | Language guide for destination |

#### Floating Widgets
| Widget | Position | Description |
|---|---|---|
| `BudgetTracker` | Bottom-right | Spend vs budget with per-day bars |
| `AIChatAssistant` | Bottom-left | Floating chat for trip refinement |
| `TripMap` | Sidebar/tab | Google Maps day view |

#### Sidebar Panels (collapsible)
- **Visa Panel** — visa requirements by passport
- **Emergency Panel** — emergency contacts for destination
- **Currency Converter** — live exchange rates
- **Similar Destinations** — 3 AI-recommended alternatives
- **Trip Card Generator** — shareable image card

#### Action Bar
- Save to Supabase (requires auth)
- Share (generates `share_slug`, copies link)
- Export PDF (calls `/api/export-pdf`)

---

### `/guide/[destination]` — Destination Guide
**File**: `app/guide/[destination]/page.tsx`  
**Rendering**: Server-side

AI-generated guide with sections:
- Overview · Best Time to Visit · Must-See Attractions
- Local Cuisine · Getting Around · Safety · Cultural Tips · Budget Estimate

CTA links to `/generate?destination=<destination>`.

---

### `/explore` — Browse Public Trips
**File**: `app/explore/page.tsx`

- Displays public trips from Supabase (`is_public = true`)
- **Filters**: destination search, vibe pill, duration (weekend/week/long)
- **Actions per card**: Fork as template, copy share link
- Lazy-loaded cards with skeleton states

---

### `/flights` — Flight Search
**File**: `app/flights/page.tsx`

- Search form: origin/destination (IATA codes), departure date, passengers
- Calls `GET /api/flights`
- Shows flight cards with airline, duration, stops, price
- Demo mode banner when Amadeus not configured
- "Book on Skyscanner" external links

---

### `/hotels` — Hotel Search
**File**: `app/hotels/page.tsx`

- Search form: city code (IATA), check-in/out dates, guests
- Popular city presets: Tokyo, Paris, NYC, Dubai, Bali, London, Bangkok, Singapore
- Calls `GET /api/hotels`
- Shows hotel cards with name, room type, price per stay
- "Book on Booking.com" external links

---

### `/restaurants` — Restaurant Recommendations
**File**: `app/restaurants/page.tsx`

- Destination input → calls `GET /api/restaurants`
- Cards show: name, cuisine type, price range ($–$$$$), rating, neighborhood, must-try dish, vibe, local tip
- Price range color-coded (green → red)
- "View on TripAdvisor" links

---

### `/saved` — Saved Trips
**File**: `app/saved/page.tsx`

- Requires Supabase auth (redirects to login if unauthenticated)
- Grid of user's saved trip cards
- Delete with confirmation modal
- Empty state illustration

---

### `/profile` — User Preferences
**File**: `app/profile/page.tsx`

Fields saved to `user_profiles` table:
- Home city · Default currency · Dietary restrictions (multi-select) · Travel style

---

### `/auth/login` — Authentication
**File**: `app/auth/login/page.tsx`

- Toggle between Login / Sign Up
- Email + password fields
- Supabase auth on submit
- Reads `returnUrl` from sessionStorage to redirect after login

---

### `/trip/share/[slug]` — Public Trip View (current)
**File**: `app/trip/share/[slug]/page.tsx`

- Server-rendered, dark cinematic theme
- Shows: highlights strip, full day-by-day itinerary, mood board, packing tips, local customs
- CTA banner: "Plan your own trip"
- Loaded via `loadTripBySlug(slug)` from Supabase

---

### `/share/[token]` — Public Trip View (legacy)
**File**: `app/share/[token]/page.tsx`

- Legacy token-based share format
- Loaded via `loadTripByToken(token)` from Supabase

---

## 4. Components

### Layout / Navigation

#### `Navbar`
**File**: `components/Navbar.tsx`
- Fixed at top, transparent → glass on scroll (backdrop-blur)
- Desktop nav: Explore · Flights · Hotels · Restaurants · Saved
- Mobile: hamburger menu with slide-down panel
- Auth state: avatar with dropdown (Profile, Settings, Logout)
- Listens to `supabase.auth.onAuthStateChange`

---

### Trip Generation

#### `TripForm`
**File**: `components/TripForm.tsx`

| Field | Type | Notes |
|---|---|---|
| Destination | Text input with autocomplete | Pre-filled from query param |
| Start Date | Date picker | Min: today |
| End Date | Date picker | Min: start date |
| Budget (USD) | Slider + input | Range: $200–$20,000 |
| Travelers | Number input | 1–20 |
| Vibe | `VibeSelector` | 7 options |
| Multi-city toggle | Switch | Reveals stop manager |
| Additional stops | Dynamic list | 2–4 cities with day counts |

On submit → calls `generateTripAction` → `LoadingAnimation` → `sessionStorage` → navigate.

#### `VibeSelector`
**File**: `components/VibeSelector.tsx`

| Vibe | Icon | Color |
|---|---|---|
| Adventure | 🏔️ Mountain | Orange |
| Culture | 🏛️ Museum | Purple |
| Food | 🍜 Bowl | Red |
| Relaxation | 🧘 Person | Blue |
| Romantic | 💑 Couple | Pink |
| Luxury | 💎 Diamond | Gold |
| Chill | 🌊 Wave | Teal |

#### `LoadingAnimation`
**File**: `components/LoadingAnimation.tsx`

Progress steps shown every 3.5 seconds:
1. Analyzing your preferences…
2. Planning your itinerary…
3. Pricing activities…
4. Finalizing schedule…
5. Polishing details…

---

### Trip Dashboard

#### `InteractiveTimeline`
**File**: `components/InteractiveTimeline.tsx`

- Accordion day cards (expand/collapse)
- Each day shows: date, theme/mood, activity list
- **Multi-city**: groups days by city with city header cards
- **Drag-to-reorder** activities within a day
- Weather data overlay per day (if loaded)
- `DayCard` sub-component handles individual day rendering

#### `MoodBoard`
**File**: `components/MoodBoard.tsx`

- 2×2 image grid per day
- Images from Pexels API (query = activity name + destination)
- Hover overlay with activity name
- Stats strip: activity count + daily cost

#### `BudgetTracker`
**File**: `components/BudgetTracker.tsx`

- Collapsible floating widget (bottom-right)
- Total spend vs budget with color progress bar (green → yellow → red)
- Per-day breakdown with proportional bars
- Shows remaining / overspent amount

#### `AIChatAssistant`
**File**: `components/AIChatAssistant.tsx`

- Floating button (bottom-left) opens chat panel
- Suggestion chips: "Make Day 2 more foodie", "Add a spa day", "Find cheaper options", "Add adventure activities"
- Free-text input → calls `refineTripAction`
- Response streamed to chat + itinerary updated in-place
- Auto-scroll to latest message

#### `TripMap`
**File**: `components/TripMap.tsx`

- Google Maps via `@vis.gl/react-google-maps`
- Pins for each activity of the active day
- Highlights selected activity
- Shows nearby places when `NearbyPlaces` tab is active

#### `FullMapTab`
**File**: `components/FullMapTab.tsx`

- Full-width Google Maps view
- Pins for all activities across all days
- Color-coded by day
- Info windows on pin click

#### `WeatherTab`
**File**: `components/WeatherTab.tsx`

- Calls `GET /api/weather?destination=X&startDate=Y&days=N`
- Day cards: high/low temps, description, humidity, precipitation chance
- Weather icons from OpenWeatherMap icon CDN
- Handles loading/error/empty states

#### `TransportTab`
**File**: `components/TransportTab.tsx`

- Transit options between days/cities
- Suggestions: flight, train, bus, ferry
- Links to Google Maps routing for each segment

#### `NearbyPlaces`
**File**: `components/NearbyPlaces.tsx`

- Calls `GET /api/places?lat=X&lng=Y&type=Z`
- Place cards: name, address, rating (stars), distance
- Category filters: restaurants, attractions, accommodation, transit

---

### Info Panels

#### `VisaPanel`
**File**: `components/VisaPanel.tsx`

- Calls `GET /api/visa?destination=X&passport=Y`
- Displays: visa type, max stay, fee, processing time, document requirements
- Health requirements list
- Travel advisory level (safe / advisory / warning)

#### `EmergencyPanel`
**File**: `components/EmergencyPanel.tsx`

- Calls `GET /api/emergency?destination=X`
- Emergency numbers: police, ambulance, fire, tourist police
- Nearest hospitals and embassy contacts
- Common scam warnings + safety tips

#### `CurrencyConverter`
**File**: `components/CurrencyConverter.tsx`

- Calls `GET /api/exchange-rate?from=USD&to=X`
- Shows trip budget in home currency
- Rates cached for 1 hour (server-side)
- Side-by-side USD vs local currency

#### `Phrasebook`
**File**: `components/Phrasebook.tsx`

- Calls `GET /api/phrasebook?destination=X`
- 5 categories: Greetings · Food · Transport · Shopping · Emergency
- Each entry: English → local script → phonetic pronunciation
- Skeleton loading states

#### `SimilarDestinations`
**File**: `components/SimilarDestinations.tsx`

- Calls `GET /api/similar-destinations?destination=X&vibe=Y&budget=Z`
- 3 destination cards with: flag emoji, name, 2-sentence pitch, vibe badge, budget range
- Links to `/explore` or pre-fills `/generate`

---

### Export / Share

#### `TripCardGenerator`
**File**: `components/TripCardGenerator.tsx`

- Modal dialog
- Generates Instagram-style visual trip card
- Options: download PNG or copy image

#### `TripPDF`
**File**: `components/TripPDF.tsx`

- Built with `@react-pdf/renderer`
- Sections: cover, day-by-day activities, packing list, customs
- Triggered by `ExportButton` → `POST /api/export-pdf`

#### `ExportButton`
**File**: `components/ExportButton.tsx`

- Triggers PDF export
- Shows spinner during generation
- Auto-downloads on complete

---

### Landing Page Sections

| Component | Description |
|---|---|
| `HeroSection` | Full-screen parallax hero with animated tagline |
| `StatsSection` | Animated counter stats |
| `HowItWorks` | 3-step flow with icons |
| `FeaturesSection` | Feature cards grid |
| `PopularDestinations` | Destination cards with images |
| `CTASection` | Final conversion banner |

---

### UI Primitives (`components/ui/`)

| Component | Purpose |
|---|---|
| `badge.tsx` | Vibe/tag badges |
| `button.tsx` | Base button with variants |
| `card.tsx` | Card container |
| `dialog.tsx` | Modal dialog |
| `input.tsx` | Form text input |
| `label.tsx` | Form label |
| `select.tsx` | Dropdown select |
| `sheet.tsx` | Side drawer/panel |
| `slider.tsx` | Budget range slider |
| `tabs.tsx` | Tab navigation |

---

## 5. Server Actions

**File**: `app/actions/generate-itinerary.ts`  
All functions are `"use server"` and called directly from client components.

### `generateTripAction(input: TripInput)`
```typescript
TripInput → GeneratedItinerary | { error: string }
```
- Validates `OPENROUTER_API_KEY` is set
- Calls `generateItinerary(input)` from `lib/ai-agent.ts`
- Returns full itinerary JSON or error object

### `refineTripAction(itinerary: GeneratedItinerary, userRequest: string)`
```typescript
(itinerary, message) → GeneratedItinerary | { error: string }
```
- Calls `refineItinerary()` — applies user's chat request to existing itinerary
- Returns updated itinerary (diff applied, not full regeneration)

### `parseNLAction(text: string)`
```typescript
string → Partial<TripInput>
```
- Extracts structured trip details from free-text (e.g. "5 days in Tokyo in June for 2 people under $3000")
- Used for natural language form fill

### `swapActivityAction(itinerary, dayIndex, activityId)`
```typescript
(itinerary, number, string) → Activity[]
```
- Returns 3 alternative activities for the specified slot
- Respects day theme, budget, and location context

---

## 6. API Routes

All under `app/api/`.

### `GET /api/flights`
| Param | Type | Description |
|---|---|---|
| `origin` | string | IATA code (e.g. JFK) |
| `destination` | string | IATA code (e.g. NRT) |
| `date` | string | ISO date YYYY-MM-DD |
| `adults` | number | Passenger count |

**Response**: `FlightOffer[]`  
**Fallback**: AI-generated demo data if Amadeus not configured  
**Header**: `X-Demo-Mode: 1` when using fallback

```typescript
FlightOffer {
  price: { total: string, currency: string },
  itineraries: [{
    segments: [{
      departure: { iataCode, at },
      arrival: { iataCode, at },
      carrierCode,
      duration,
      numberOfStops
    }]
  }]
}
```

---

### `GET /api/hotels`
| Param | Type | Description |
|---|---|---|
| `cityCode` | string | IATA city code (e.g. TYO) |
| `checkIn` | string | ISO date |
| `checkOut` | string | ISO date |
| `adults` | number | Guest count |

**Response**: `HotelOffer[]`  
**Two-step**: hotel IDs by city → fetch offers  
**Fallback**: AI-generated demo data

```typescript
HotelOffer {
  hotel: { name, cityCode, latitude, longitude },
  offers: [{ checkInDate, checkOutDate, room: { description }, price: { total, currency } }]
}
```

---

### `GET /api/weather`
| Param | Type | Description |
|---|---|---|
| `destination` | string | City name or place |
| `startDate` | string | ISO date |
| `days` | number | Forecast days (max 5) |

**Response**: `{ weather: WeatherDay[] }`

```typescript
WeatherDay {
  date: string,
  tempHighC: number,
  tempLowC: number,
  description: string,
  icon: string,   // OpenWeatherMap icon code
  humidity: number,
  precipitationChance: number
}
```

---

### `GET /api/places`
| Param | Type | Description |
|---|---|---|
| `lat` | number | Latitude |
| `lng` | number | Longitude |
| `type` | string | Place type (tourist_attraction, restaurant, etc.) |
| `radius` | number | Search radius in meters (default 1500) |

**Response**: `PlaceResult[]` (max 12)

---

### `GET /api/places/detail`
| Param | Type | Description |
|---|---|---|
| `placeId` | string | Google Place ID |

**Response**: Full place details object

---

### `GET /api/visa`
| Param | Type | Description |
|---|---|---|
| `destination` | string | Destination country |
| `passport` | string | Passport country code |

**Response**: Visa info object  
**Rate limited**: 10 req/min/IP  
**Source**: AI-generated

```typescript
{
  visaType: string,      // "Visa Free" | "Visa on Arrival" | "e-Visa" | "Visa Required"
  maxStay: string,       // "90 days", etc.
  cost: string,
  processingTime: string,
  requirements: string[],
  healthRequirements: string[],
  travelAdvisory: "safe" | "advisory" | "warning"
}
```

---

### `GET /api/emergency`
| Param | Type | Description |
|---|---|---|
| `destination` | string | Destination city/country |

**Response**: Emergency contacts object  
**Rate limited**: 10 req/min/IP

```typescript
{
  police: string,
  ambulance: string,
  fire: string,
  touristPolice: string,
  embassies: { country, phone }[],
  hospitals: string[],
  scamWarnings: string[],
  safetyTips: string[]
}
```

---

### `GET /api/exchange-rate`
| Param | Type | Description |
|---|---|---|
| `from` | string | Source currency (e.g. USD) |
| `to` | string | Target currency (e.g. JPY) |

**Response**: `{ rate: number, date: string }`  
**Source**: Frankfurter API  
**Cache**: 1 hour server-side

---

### `GET /api/phrasebook`
| Param | Type | Description |
|---|---|---|
| `destination` | string | Destination city/country |

**Response**: Phrasebook object  
**Rate limited**: 10 req/min/IP

```typescript
{
  language: string,
  categories: {
    name: string,  // "Greetings", "Food", "Transport", "Shopping", "Emergency"
    phrases: {
      english: string,
      local: string,
      phonetic: string
    }[]
  }[]
}
```

---

### `GET /api/similar-destinations`
| Param | Type | Description |
|---|---|---|
| `destination` | string | Current destination |
| `vibe` | string | Current trip vibe |
| `budget` | number | Trip budget in USD |

**Response**: `Destination[]` (3 items)  
**Rate limited**: 10 req/min/IP

---

### `GET /api/restaurants`
| Param | Type | Description |
|---|---|---|
| `destination` | string | City/destination |

**Response**: `Restaurant[]`

```typescript
Restaurant {
  name: string,
  cuisine: string,
  priceRange: "$" | "$$" | "$$$" | "$$$$",
  rating: number,
  neighborhood: string,
  mustTry: string,
  vibe: string,
  localTip: string
}
```

---

### `GET /api/images`
| Param | Type | Description |
|---|---|---|
| `query` | string | Search term |
| `seed` | number | Deterministic selection seed |

**Response**: Redirect to image URL  
**Source**: Pexels API → fallback LoremFlickr

---

### `POST /api/export-pdf`
**Body**: `{ itinerary: GeneratedItinerary }`  
**Response**: PDF file download  
**Filename**: `{destination}-itinerary.pdf`  
**Library**: `@react-pdf/renderer`

---

### `GET /api/transport`
| Param | Type | Description |
|---|---|---|
| `destination` | string | City/destination |
| `days` | number | Trip duration |

**Response**: Transport suggestions array (AI-generated)

---

### `GET /api/weather-advisory`
| Param | Type | Description |
|---|---|---|
| `destination` | string | Destination |

**Response**: Current travel advisories and weather warnings (AI-generated)

---

## 7. Library Modules

### `lib/ai-agent.ts`

**Core Interfaces**:
```typescript
Activity {
  id: string
  time: string            // "09:00"
  name: string
  location: string
  category: "food" | "activity" | "transport" | "accommodation" | "sightseeing"
  cost: number            // USD
  duration: string        // "2 hours"
  tips: string
  city?: string           // for multi-city trips
}

ItineraryDay {
  date: string
  theme: string           // "Art & Culture"
  mood: string            // "Energetic"
  city?: string
  activities: Activity[]
  dailyCost: number
}

GeneratedItinerary {
  destination: string
  summary: string
  highlights: string[]
  days: ItineraryDay[]
  totalCost: number
  packingTips: string[]
  localCustoms: string[]
  bestTimeToVisit: string
}

TripInput {
  destination: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  vibe: string
  stops?: DestinationStop[]  // multi-city
}
```

**Functions**:
- `generateItinerary(input)` → full itinerary via AI
- `refineItinerary(itinerary, request)` → partial update
- `parseNaturalLanguage(text)` → extract TripInput from string
- `getActivityAlternatives(itinerary, dayIndex, activityId)` → 3 alternatives

**System Prompt Strategy**:
- Instructs AI to output strict JSON (no markdown fences in JSON)
- 4–6 activities per day
- Realistic costs summing to budget
- Local, authentic recommendations over tourist traps
- Zod validation on response with graceful fallback

---

### `lib/model-router.ts`

Routes tasks to cost-appropriate AI models via OpenRouter:

| Task | Model | Estimated Cost |
|---|---|---|
| `main-itinerary` | Gemini 2.5 Pro | ~$0.04–$0.10/call |
| `refinement` | Gemini 2.0 Flash | ~$0.01–$0.02/call |
| `helper` | DeepSeek Chat | <$0.008/call |

Returns configured `ChatOpenAI` instance (OpenRouter base URL).

---

### `lib/supabase.ts`

**Auth Functions**:
```typescript
getSupabase()          // lazy singleton — never called at module load
signUp(email, password)
signIn(email, password)
signOut()
getUser()
```

**Trip CRUD**:
```typescript
saveTrip(trip: TripRecord)          // upsert
loadTrips(userId: string)           // all user trips
loadTrip(tripId: string)            // single trip
deleteTrip(tripId: string)
loadTripByToken(token: string)      // legacy share
loadTripBySlug(slug: string)        // current share
shareTrip(tripId: string)           // set is_public=true, generate slug → return URL
```

**Profile**:
```typescript
loadProfile(userId: string)
saveProfile(profile: UserProfile)
```

**Browse**:
```typescript
loadPublicTrips(filter: { vibe?, destination?, duration? })
```

---

### `lib/amadeus.ts`

`AmadeusClient` class (singleton):
- OAuth2 token management with auto-refresh
- `searchFlights(params)` → `FlightOffer[]`
- `searchHotels(params)` → `HotelOffer[]` (two-step: city list → offers)
- Test environment: `test.api.amadeus.com`

---

### `lib/weather.ts`

`getWeatherForecast(destination, startDate, days)`:
1. Geocode destination via OpenWeatherMap Geo API
2. Fetch 5-day / 3-hour forecast
3. Aggregate to daily high/low/description
4. Return `WeatherDay[]` (max 5 days, free tier)

---

### `lib/images.ts`

`getTravelImages(query, count)`:
- Primary: Pexels API search
- Fallback: `loremflickr.com/{w}/{h}/{query}` (no key needed)

---

### `lib/geocode.ts`

`geocodeAddress(address)` → `{ lat: number, lng: number }`:
- Google Geocoding API
- Used to place activity pins on maps

---

### `lib/guide.ts`

`getDestinationGuide(destination)` → `DestinationGuide`:
- AI-generated via `helper` model (DeepSeek)
- Returns: overview, best time, must-see, cuisine, getting around, safety, cultural tips, budget estimate

---

### `lib/parse-ai-json.ts`

Utilities for extracting JSON from AI responses:
- `normalizeContent()` — handles LangChain response types
- `extractJSON()` — strips markdown fences, `<thinking>` tags, finds outermost `{}`
- `parseAIObject()` / `parseAIArray()` — parse with fallback

---

### `lib/rate-limit.ts`

`rateLimit(clientIp)`:
- In-memory store (resets on server restart)
- 10 requests/minute per IP
- Applied to AI-heavy endpoints: `/visa`, `/emergency`, `/phrasebook`, `/similar-destinations`

---

### `lib/pexels.ts`

Pexels API client:
- `searchPhotos(query, perPage)` → photo array
- Response caching (server memory)

---

## 8. Database Schema

### `trips` table

```sql
CREATE TABLE trips (
  id           TEXT PRIMARY KEY,            -- nanoid
  user_id      UUID NOT NULL REFERENCES auth.users,
  destination  TEXT NOT NULL,
  vibe         TEXT NOT NULL,
  budget       INTEGER NOT NULL,
  travelers    INTEGER DEFAULT 1,
  start_date   TEXT NOT NULL,
  end_date     TEXT NOT NULL,
  itinerary    JSONB NOT NULL,              -- full GeneratedItinerary JSON
  is_public    BOOLEAN DEFAULT false,
  share_slug   TEXT UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
```

**Indexes**:
- `idx_trips_user_id` on `user_id`
- `idx_trips_created_at` on `created_at DESC`
- `idx_trips_itinerary_gin` on `itinerary` (GIN — full JSONB search)
- `idx_trips_destination` on `lower(destination)`
- `idx_trips_share_slug` on `share_slug`

**RLS Policies**:
- Users read/write own trips
- Public trips (`is_public = true`) visible to all (anon included)

---

### `user_profiles` table

```sql
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users,
  home_city     TEXT,
  currency      TEXT DEFAULT 'USD',
  dietary       TEXT[] DEFAULT '{}',    -- ["vegetarian", "halal", ...]
  travel_style  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

**Trigger**: auto-update `updated_at` on row update

---

### `price_alerts` table

```sql
CREATE TABLE price_alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users,
  origin       TEXT NOT NULL,
  destination  TEXT NOT NULL,
  travel_date  TEXT NOT NULL,
  adults       INTEGER DEFAULT 1,
  last_price   NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

### `trip_collaborators` table

```sql
CREATE TABLE trip_collaborators (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    TEXT NOT NULL REFERENCES trips,
  user_id    UUID REFERENCES auth.users,
  email      TEXT NOT NULL,
  role       TEXT DEFAULT 'editor' CHECK (role IN ('viewer', 'editor')),
  accepted   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Trip owner manages collaborators
- Collaborators see own invite rows
- Editors can read/update trip; viewers can only read

---

## 9. AI System

### Model Selection Strategy

```
Task: Main itinerary generation
  → Gemini 2.5 Pro via OpenRouter
  → Temperature: 0.7 (creative but structured)
  → Max tokens: 4096
  → Why: Best structured JSON output, handles complex multi-day plans

Task: Trip refinement (chat)
  → Gemini 2.0 Flash via OpenRouter
  → Temperature: 0.5
  → Max tokens: 2048
  → Why: Fast, cheap, sufficient for incremental changes

Task: Helper tasks (guides, phrasebooks, visa info, etc.)
  → DeepSeek Chat via OpenRouter
  → Temperature: 0.3
  → Max tokens: 1024
  → Why: Lowest cost for factual/structured responses
```

### Itinerary Generation Prompt Design

The system prompt instructs the model to:
1. Output **strict JSON only** — no prose, no markdown fences
2. Generate **4–6 activities per day** with realistic timing
3. Ensure **costs sum to budget** across all days
4. Include **local/authentic** recommendations, not generic tourist traps
5. Add `tips` field with insider knowledge for each activity
6. Use `category` enum: `food | activity | transport | accommodation | sightseeing`
7. For multi-city trips: add `city` field on each `ItineraryDay`

### Response Parsing Pipeline

```
AI Raw Output
    ↓
normalizeContent()          → extract string from LangChain response
    ↓
extractJSON()               → strip <thinking> tags, markdown, find outermost {}
    ↓
JSON.parse()
    ↓
Zod schema validation       → runtime type safety
    ↓
Category normalization      → map typos/variants to enum values
    ↓
Cost validation             → ensure costs are numbers, not strings
    ↓
GeneratedItinerary
```

### Refinement Strategy

The `refineItinerary()` function:
- Sends existing itinerary as context
- User request as instruction
- Instructs model to **only change what's needed** (minimal diff)
- Returns full updated itinerary (same shape as generated)
- Preserves budget constraints and existing structure

---

## 10. Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary | `#7c3aed` (violet-700) | Buttons, active states |
| Primary light | `#8b5cf6` (violet-500) | Hover states |
| Secondary | `#0ea5e9` (sky-500) | Gradient pair, accents |
| Teal accent | `#00a896` / `#00f5d4` | Dark page highlights |
| Background | `#faf8ff` | Light page bg |
| Surface | `#ffffff` | Card bg |
| Dark base | `#0a0a0a` | Trip page bg |
| Dark surface | `#0f172a` | Dark cards |
| Text dark | `#1e1b4b` | Headings |
| Text muted | `#64748b` | Secondary text |

### Typography

- **Font**: Inter (Google Fonts via `next/font`)
- **Headings**: `font-bold`, sizes `text-4xl` → `text-7xl` for heroes
- **Body**: Regular weight, `text-base` / `text-sm`
- **Code**: Monospace fallback

### Custom CSS Utilities

```css
.glass              /* backdrop-blur + semi-transparent bg */
.teal-glow          /* box-shadow with teal color */
.cinematic-overlay  /* dark gradient overlay for trip pages */
.mountain-gradient  /* bottom dark gradient for hero images */
.gradient-text      /* violet→sky gradient text fill */
.btn-primary        /* violet→sky gradient button */
.btn-outline        /* bordered button */
.btn-ghost          /* text-only button */
.card               /* white card with shadow */
.card-muted         /* subtle bg card */
.input-clean        /* styled form input */
.skeleton           /* shimmer loading animation */
```

### Animation System

| Animation | CSS Keyframe | Usage |
|---|---|---|
| `float` | Y-axis oscillation | Hero floating elements |
| `fade-up` | opacity 0→1 + translateY | Section reveals |
| `shimmer` | gradient sweep | Skeleton loaders |
| Framer Motion | `initial/animate/exit` | Component-level transitions |

### Spacing & Layout

- 8px baseline grid
- Card border-radius: `0.75rem` (rounded-xl)
- Modal border-radius: `1rem` (rounded-2xl)
- Page max-width: `1280px` (max-w-7xl)
- Content gutter: `px-4` → `px-8` at md+

---

## 11. Environment Variables

```bash
# AI (required)
OPENROUTER_API_KEY=sk-or-v1-...        # OpenRouter — Gemini, DeepSeek

# Supabase (required for auth/persistence)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # server-only, never expose to client

# Google (required for maps/places)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Amadeus (optional — AI fallback if missing)
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...

# Pexels (optional — LoremFlickr fallback if missing)
PEXELS_API_KEY=...

# OpenWeatherMap (optional — weather tab silently fails if missing)
OPENWEATHERMAP_API_KEY=...
```

---

## 12. User Flows & Workflows

### Flow 1: Trip Generation (Core)

```
1. User visits /generate (optionally via PopularDestinations card)
2. TripForm renders (destination pre-filled if query param present)
3. User fills: destination, dates, budget, travelers, vibe
4. (Optional) Toggle multi-city, add stops
5. Click "Plan My Trip" → generateTripAction called
6. LoadingAnimation shown (5 rotating progress messages)
7. AI generates itinerary JSON (Gemini 2.5 Pro, ~5–15 seconds)
8. itinerary stored: sessionStorage.setItem('trip-{nanoid}', JSON.stringify(itinerary))
9. Router.push('/trip/{id}')
10. TripDashboard reads sessionStorage, renders full UI
```

### Flow 2: Trip Refinement (AI Chat)

```
1. User on /trip/[id], clicks floating chat button (bottom-left)
2. AIChatAssistant panel opens
3. User types request or taps suggestion chip
4. refineTripAction(currentItinerary, userRequest) called
5. Gemini 2.0 Flash returns updated itinerary
6. React state updated → InteractiveTimeline re-renders with changes
7. BudgetTracker recalculates totals
8. Success message shown in chat
```

### Flow 3: Save & Share

```
Save:
1. User clicks "Save" button in trip action bar
2. getUser() checks auth → redirect to /auth/login if not logged in
3. After login, returnUrl set → redirected back to trip
4. saveTrip(tripRecord) → Supabase upsert
5. Success toast shown

Share:
1. User clicks "Share" button
2. shareTrip(tripId) called → sets is_public=true, generates share_slug (nanoid)
3. Returns URL: /trip/share/{slug}
4. URL copied to clipboard
5. Anyone with URL sees read-only share view
```

### Flow 4: Browse & Fork

```
1. User visits /explore
2. loadPublicTrips() called with active filters
3. Trip cards rendered (destination, vibe, duration, day count)
4. Click "Fork" → copy trip data → navigate to /generate with pre-filled form
5. Click share link → copy URL to clipboard
```

### Flow 5: Flight/Hotel Search

```
Flights:
1. User visits /flights (or clicks Quick Action in trip sidebar)
2. Fill origin, destination, date, passengers
3. GET /api/flights called
4. If Amadeus configured: real data from Amadeus test API
5. If not: AI-generated demo data (marked with banner)
6. Click "Book on Skyscanner" → opens external booking link

Hotels: same pattern with /hotels → Booking.com external link
```

### Flow 6: Authentication

```
1. Protected action (save trip, view /saved, edit profile) triggered
2. sessionStorage.setItem('returnUrl', currentPath)
3. Router.push('/auth/login')
4. User fills email + password → signIn() or signUp()
5. On success: Router.push(sessionStorage.getItem('returnUrl') || '/')
```

---

## 13. Feature Inventory

### Implemented & Working

| Feature | Status | Location |
|---|---|---|
| AI itinerary generation | ✅ | `/generate` + `lib/ai-agent.ts` |
| Multi-city trips | ✅ | `TripForm` + `InteractiveTimeline` |
| AI chat refinement | ✅ | `AIChatAssistant` |
| Activity drag-reorder | ✅ | `InteractiveTimeline` |
| Weather forecast | ✅ | `WeatherTab` + `/api/weather` |
| Budget tracker | ✅ | `BudgetTracker` |
| Mood board | ✅ | `MoodBoard` |
| Google Maps integration | ✅ | `TripMap` + `FullMapTab` |
| Nearby places | ✅ | `NearbyPlaces` + `/api/places` |
| Visa requirements | ✅ | `VisaPanel` + `/api/visa` |
| Emergency contacts | ✅ | `EmergencyPanel` + `/api/emergency` |
| Currency converter | ✅ | `CurrencyConverter` + `/api/exchange-rate` |
| Phrasebook | ✅ | `Phrasebook` + `/api/phrasebook` |
| Similar destinations | ✅ | `SimilarDestinations` |
| PDF export | ✅ | `ExportButton` + `/api/export-pdf` |
| Trip sharing (slug) | ✅ | `/trip/share/[slug]` |
| Public trip browser | ✅ | `/explore` |
| Trip fork | ✅ | `/explore` |
| Destination guides | ✅ | `/guide/[destination]` |
| Restaurant recommendations | ✅ | `/restaurants` + `/api/restaurants` |
| Flight search | ✅ | `/flights` + Amadeus |
| Hotel search | ✅ | `/hotels` + Amadeus |
| Supabase auth | ✅ | `lib/supabase.ts` |
| Save trips | ✅ | `lib/supabase.ts` |
| User profile | ✅ | `/profile` |
| Trip collaborators | ✅ (schema) | `trip_collaborators` table |
| Price alerts | ✅ (schema) | `price_alerts` table |
| Rate limiting | ✅ | `lib/rate-limit.ts` |
| AI model routing | ✅ | `lib/model-router.ts` |
| Pexels image integration | ✅ | `lib/images.ts` |
| Trip card generator | ✅ | `TripCardGenerator` |
| Natural language input | ✅ | `parseNLAction` |
| Activity swap | ✅ | `swapActivityAction` |
| Transport info | ✅ | `TransportTab` + `/api/transport` |
| Packing list | ✅ | In itinerary JSON + PDF |
| Local customs | ✅ | In itinerary JSON + share view |

---

## 14. Pending Enhancements

These are identified gaps and improvement opportunities:

### High Priority
1. **Price alerts UI** — backend schema exists (`price_alerts` table), frontend UI on `/flights` not built
2. **Collaborator invite UI** — schema (`trip_collaborators`) exists, no UI to invite/accept collaborators
3. **Official image API** — replace `source.unsplash.com` with Pexels/Unsplash official API key (avoid hotlinking)
4. **Google Maps API key** — set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in production; maps currently fail silently
5. **Supabase schema deployment** — `supabase-schema.sql` must be run manually in Supabase SQL Editor

### Medium Priority
6. **Natural language form fill** — `parseNLAction` built but not wired to any UI input field
7. **Activity swap UI** — `swapActivityAction` built but no "swap" button in `InteractiveTimeline`
8. **Weather advisory UI** — `/api/weather-advisory` endpoint exists, not surfaced in trip dashboard
9. **Real-time collaboration** — Supabase Realtime enabled in schema, no client subscription implemented
10. **PWA manifest** — `@ducanh2912/next-pwa` installed, not yet configured in `next.config.js`

### Enhancement Opportunities
11. **Offline support** — cache itinerary in IndexedDB for offline access
12. **Trip versioning** — track itinerary edit history via Supabase
13. **Email notifications** — price alert emails when flight prices drop
14. **Trip templates** — pre-built itineraries for popular routes
15. **Dark/light mode toggle** — currently dark mode hardcoded on trip pages
16. **Social auth** — Google/Apple sign-in via Supabase providers
17. **AI image generation** — generate custom destination imagery for mood boards
18. **Booking integrations** — direct Skyscanner/Booking.com affiliate deep links with pre-filled params

---

*Generated: 2026-04-17 | Project: WanderlyTrip.ai | Branch: main*
