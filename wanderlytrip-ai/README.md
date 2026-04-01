# WanderlyTrip.ai

> **Plan your entire trip in minutes with AI.**

A premium AI-powered travel planning platform built with Next.js 16, Claude AI, and Supabase. Generates complete, beautiful itineraries tailored to your vibe — flights, hotels, restaurants, and activities — in seconds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, RSC) |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| AI | Claude claude-sonnet-4-6 via Anthropic API + LangChain.js |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Travel Data | Amadeus Self-Service API (flights & hotels) |
| Maps | Google Maps / Places API |
| Icons | Lucide React |

## Features

- **AI Itinerary Generator** — Destination, dates, budget, travelers, vibe → full day-by-day itinerary in ~15 seconds
- **7 Travel Vibes** — Adventure, Culture, Food, Relaxation, Romantic, Luxury, Chill
- **Interactive Timeline** — Accordion day cards with activity details, costs, tips
- **Mood Board** — Per-day image collages
- **Real-time Budget Tracker** — Floating sidebar with per-day spend breakdown
- **AI Chat Assistant** — Refine any part of the trip via natural language ("make Day 2 more foodie")
- **Flights & Hotels** — Real-time Amadeus API search
- **Restaurant Picks** — AI-curated dining recommendations per destination
- **Saved Trips** — Supabase-backed trip gallery with auth

## Getting Started

```bash
cd wanderlytrip-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Copy `.env.local` and fill in your keys:

```env
ANTHROPIC_API_KEY=               # claude.ai/settings
NEXT_PUBLIC_SUPABASE_URL=        # Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Settings → API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY= # Google Cloud Console
AMADEUS_CLIENT_ID=               # developers.amadeus.com (free)
AMADEUS_CLIENT_SECRET=           # developers.amadeus.com (free)
```

### Database Setup

Run `supabase-schema.sql` in your Supabase SQL Editor. The schema includes:
- `trips` table with JSONB itinerary storage
- Row Level Security (RLS) with performance-optimized policies
- GIN index on JSONB column, expression index for destination search
- Auto-maintained `updated_at` trigger

## Project Structure

```
wanderlytrip-ai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── generate/page.tsx           # Trip generator form
│   ├── trip/[id]/page.tsx          # Trip dashboard
│   ├── flights/page.tsx            # Flight search
│   ├── hotels/page.tsx             # Hotel search
│   ├── restaurants/page.tsx        # AI restaurant picks
│   ├── saved/page.tsx              # Saved trips gallery
│   ├── auth/login/page.tsx         # Auth (sign in / sign up)
│   └── actions/generate-itinerary.ts  # Server Actions
├── components/
│   ├── HeroSection.tsx             # Cinematic landing hero
│   ├── VibeSelector.tsx            # Vibe pill selector
│   ├── TripForm.tsx                # Generator form
│   ├── InteractiveTimeline.tsx     # Day-by-day accordion
│   ├── ItineraryCard.tsx           # Single activity card
│   ├── MoodBoard.tsx               # Day image collage
│   ├── BudgetTracker.tsx           # Floating budget sidebar
│   └── AIChatAssistant.tsx         # Floating AI chat
├── lib/
│   ├── ai-agent.ts                 # LangChain + Claude agent
│   ├── amadeus.ts                  # Amadeus API client
│   └── supabase.ts                 # Supabase client + helpers
└── supabase-schema.sql             # Production-ready DB schema
```

## Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build + type check
npm run lint     # ESLint
```

## Design

- Dark background `#0a0a0a` with teal accents `#00f5d4`
- Glassmorphism cards, cinematic gradients, mountain overlays
- Framer Motion animations throughout (parallax hero, entrance animations, hover effects)
- Mobile-first, fully responsive

---

Built with Claude Code · Iteration 1
