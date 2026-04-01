# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Project: WanderlyTrip.ai

**Location**: `wanderlytrip-ai/` subdirectory
**Stack**: Next.js 16 (App Router) · Tailwind v4 · shadcn/ui (base-ui) · Framer Motion 12 · Supabase · Anthropic claude-sonnet-4-6 · LangChain.js · Amadeus API

### Dev Commands
```bash
cd wanderlytrip-ai
npm run dev       # http://localhost:3000
npm run build     # production build + type check
npm run lint      # eslint
```

### Key Architecture

**Tailwind v4** — no `tailwind.config.ts`. All theme config lives in `app/globals.css` under `@theme inline`. Brand tokens: `--color-teal: #00f5d4`, `--color-dark-base: #0a0a0a`. Custom utils: `.glass`, `.teal-glow`, `.cinematic-overlay`, `.mountain-gradient`.

**AI Agent** (`lib/ai-agent.ts`) — LangChain `ChatAnthropic` with `claude-sonnet-4-6`. `generateItinerary()` returns `GeneratedItinerary` JSON. `refineItinerary()` takes existing JSON + user message. Called from Server Actions in `app/actions/generate-itinerary.ts`.

**Supabase** (`lib/supabase.ts`) — lazy singleton via `getSupabase()`. Never called at module load to avoid build-time failures. Run `supabase-schema.sql` in Supabase SQL Editor to create the `trips` table.

**Route pattern**: Generator form → Server Action → `sessionStorage.setItem('trip-{id}')` → redirect to `/trip/[id]` → `TripDashboard` reads from sessionStorage. For persistence, call `saveTrip()` from `lib/supabase.ts`.

**Amadeus** (`lib/amadeus.ts`) — test environment (`test.api.amadeus.com`). Exposed via `/api/flights` and `/api/hotels` route handlers.

### Env Vars Required (`.env.local`)
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
```

### Critical Files
```
wanderlytrip-ai/
  app/
    page.tsx                      ← landing (Navbar + Hero + Features + CTA)
    generate/page.tsx             ← trip generator form
    trip/[id]/page.tsx            ← trip dashboard (client, reads sessionStorage)
    actions/generate-itinerary.ts ← Server Actions wrapping AI agent
    api/flights/route.ts          ← GET /api/flights?origin=JFK&destination=NRT&...
    api/hotels/route.ts           ← GET /api/hotels?cityCode=TYO&...
    api/restaurants/route.ts      ← GET /api/restaurants?destination=Tokyo
    auth/login/page.tsx           ← sign in / sign up
    flights/page.tsx
    hotels/page.tsx
    restaurants/page.tsx
    saved/page.tsx                ← requires Supabase auth
  components/
    Navbar.tsx                    ← fixed, glass on scroll
    HeroSection.tsx               ← parallax, Framer Motion
    VibeSelector.tsx              ← pill pills with color per vibe
    TripForm.tsx                  ← destination/dates/budget/travelers/vibe
    LoadingAnimation.tsx          ← AI loading overlay
    InteractiveTimeline.tsx       ← accordion day cards
    ItineraryCard.tsx             ← single activity card with timeline stem
    MoodBoard.tsx                 ← Unsplash image grid per day
    BudgetTracker.tsx             ← floating right sidebar
    AIChatAssistant.tsx           ← floating chat, calls refineTripAction
  lib/
    ai-agent.ts                   ← LangChain + Claude (generateItinerary, refineItinerary)
    amadeus.ts                    ← AmadeusClient singleton
    supabase.ts                   ← lazy getSupabase(), auth helpers, CRUD
  supabase-schema.sql             ← run in Supabase SQL Editor
```

### Next Steps to Complete
1. Add your real API keys to `.env.local`
2. Run `supabase-schema.sql` in Supabase SQL Editor
3. Replace Unsplash `source.unsplash.com` with a proper image API (Pexels/Unsplash official)
4. Add Google Maps integration to the trip dashboard sidebar
5. Add "Save Trip" button on the dashboard that calls `saveTrip()` after user is authenticated
