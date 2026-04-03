# WanderlyTrip.ai — Build Tasks

## Phase 0 — Bootstrap ✅
- [x] Scaffold Next.js 15 project (actual: Next.js 16.2.2)
- [x] Install all dependencies
- [x] Init shadcn/ui + components
- [x] Create .env.local

## Phase 1 — Theme & Layout ✅
- [x] tailwind.config.ts → Tailwind v4: CSS-based config in globals.css
- [x] globals.css (CSS vars, glassmorphism utils, keyframes)
- [x] app/layout.tsx (Inter font, dark body, metadata)

## Phase 2 — Landing Page ✅
- [x] components/HeroSection.tsx
- [x] components/VibeSelector.tsx
- [x] components/FeaturesSection.tsx
- [x] components/CTASection.tsx
- [x] components/Navbar.tsx
- [x] app/page.tsx (assembled)

## Phase 3 — Generator Page ✅
- [x] components/TripForm.tsx
- [x] components/LoadingAnimation.tsx
- [x] app/actions/generate-itinerary.ts (Server Action)
- [x] app/generate/page.tsx

## Phase 4 — AI Agent ✅
- [x] lib/ai-agent.ts (LangChain + Claude claude-sonnet-4-6)
- [x] lib/amadeus.ts
- [x] app/api/flights/route.ts
- [x] app/api/hotels/route.ts
- [x] app/api/restaurants/route.ts

## Phase 5 — Trip Dashboard ✅
- [x] components/InteractiveTimeline.tsx
- [x] components/ItineraryCard.tsx
- [x] components/MoodBoard.tsx
- [x] components/BudgetTracker.tsx
- [x] components/AIChatAssistant.tsx
- [x] app/trip/[id]/page.tsx

## Phase 6 — Tab Pages ✅
- [x] app/flights/page.tsx
- [x] app/hotels/page.tsx
- [x] app/restaurants/page.tsx
- [x] app/saved/page.tsx

## Phase 7 — Supabase ✅
- [x] lib/supabase.ts (lazy singleton)
- [x] app/auth/login/page.tsx
- [x] supabase-schema.sql

## Build verification ✅
- [x] npm run build → 0 errors, 13 routes
- [x] npm run dev → http://localhost:3000

---

# "Super Cool" Roadmap

## Phase 8 — Critical Fixes (Data Integrity & Core Flow) ✅
> Nothing breaks, nothing gets lost. Rock-solid foundation.

- [x] **8.1 Fix trip persistence on reload** [S]
  - `trip/[id]/page.tsx` only reads sessionStorage. Refresh = redirect to /generate.
  - Fix: fallback to `loadTrip(id)` from Supabase when sessionStorage misses.
  - Also auto-save immediately after generation for logged-in users.
  - Files: `app/trip/[id]/page.tsx`, `app/actions/generate-itinerary.ts`

- [x] **8.2 Fix travelers hardcoded to 1** [S]
  - `persistTrip()` at line 57 of trip/[id]/page.tsx hardcodes `travelers: 1`.
  - Fix: thread `travelers` from form → Server Action → sessionStorage → dashboard.
  - Files: `app/actions/generate-itinerary.ts`, `app/trip/[id]/page.tsx`

- [x] **8.3 Replace loremflickr with Pexels API** [M]
  - loremflickr is a placeholder service that can go down or return irrelevant images.
  - Fix: Pexels free API (`api.pexels.com/v1/search`). Use `Activity.imageQuery` as search.
  - Files: `lib/images.ts`, `app/api/images/route.ts` (new), add `PEXELS_API_KEY` to env

- [x] **8.4 Add empty states for all pages** [S]
  - /saved, /flights, /hotels, /restaurants are blank for new users.
  - Fix: Illustrated empty state with CTA for each page.
  - Files: `app/saved/page.tsx`, `app/flights/page.tsx`, `app/hotels/page.tsx`, `app/restaurants/page.tsx`

## Phase 9 — Core Product Polish
> Every step of the trip creation flow feels delightful.

- [ ] **9.1 Richer AI prompting** [M]
  - System prompt is generic. No weather context, no traveler persona, no season awareness.
  - Fix: Add traveler persona (solo/couple/family), season context, per-person budget hints, "avoid tourist traps" flag.
  - Files: `lib/ai-agent.ts`, `app/actions/generate-itinerary.ts`, `app/generate/page.tsx`

- [ ] **9.2 Natural language trip input** [M]
  - Users must fill a structured form. "2 weeks eating through SE Asia" isn't supported.
  - Fix: NLP input field → Claude parses it → pre-fills form fields.
  - Files: `app/generate/page.tsx`, `app/actions/generate-itinerary.ts`, `lib/ai-agent.ts`

- [ ] **9.3 Activity swap with AI alternatives** [M]
  - Each activity is fixed. No way to swap for an alternative.
  - Fix: "Swap" button on ItineraryCard → Claude returns 3 alternatives for that time slot.
  - Files: `components/ItineraryCard.tsx`, `components/InteractiveTimeline.tsx`, `app/actions/generate-itinerary.ts`

- [ ] **9.4 Trip diff view after AI chat refinement** [M]
  - After chat refine, itinerary just swaps silently. No feedback on what changed.
  - Fix: Compute diff, show "What changed" summary in chat thread.
  - Files: `components/AIChatAssistant.tsx`, `lib/ai-agent.ts`

- [ ] **9.5 Weather-aware itineraries** [M]
  - AI doesn't know actual weather at destination during travel dates.
  - Fix: OpenWeatherMap API → fetch forecast → inject into Claude prompt → weather badges on day cards.
  - Files: `lib/weather.ts` (new), `app/api/weather/route.ts` (new), `lib/ai-agent.ts`, `components/InteractiveTimeline.tsx`

- [ ] **9.6 PDF itinerary export** [M]
  - Users can't take their trip offline or share outside the app.
  - Fix: `react-to-print` or `@react-pdf/renderer` → clean printable PDF with days, costs, packing list.
  - Files: `components/ExportButton.tsx` (new), `app/trip/[id]/page.tsx`

- [ ] **9.7 Auto-save & sync indicator** [S]
  - No visual feedback that changes are being saved after AI chat refinement.
  - Fix: Auto-save on every refinement for auth users. Subtle "Saved" / "Saving..." in header.
  - Files: `app/trip/[id]/page.tsx`, `components/Navbar.tsx`

- [ ] **9.8 User profile & travel preferences** [M]
  - No profile page. Users re-enter preferences every time.
  - Fix: /profile page with currency, home city, dietary restrictions, travel style. Pre-populate TripForm.
  - Files: `app/profile/page.tsx` (new), `lib/supabase.ts`, `supabase-schema.sql`

## Phase 10 — AI Superpowers
> The AI feels like a real travel expert.

- [ ] **10.1 Google Places for real restaurants** [L]
  - /api/restaurants returns AI-generated fake restaurant names.
  - Fix: Google Places API nearbysearch → real names, ratings, photos, price level, hours.
  - Files: `app/api/restaurants/route.ts`, `app/restaurants/page.tsx`

- [ ] **10.2 Amadeus production + flight price tracker** [L]
  - Amadeus test env has dummy data. No real-time pricing.
  - Fix: Switch to production Amadeus. Add "Track this route" button → price alert saved to DB.
  - Files: `lib/amadeus.ts`, `app/flights/page.tsx`, `app/api/flights/route.ts`

## Phase 11 — Social Layer
> Trips spread virally. WanderlyTrip becomes a community.

- [ ] **11.1 Trip sharing via public link** [M]
  - No way to share a trip with someone without an account.
  - Fix: `is_public` + `share_slug` columns on trips. "Share" button → `/trip/share/[slug]` read-only page.
  - Files: `lib/supabase.ts`, `supabase-schema.sql`, `app/trip/[id]/page.tsx`, `app/trip/share/[slug]/page.tsx` (new)

- [ ] **11.2 Public trip inspiration gallery** [L]
  - No discovery. Users can't browse what other travelers planned.
  - Fix: /explore page with public trips as cards. Filter by vibe/destination/duration. "Use as template" forks it.
  - Files: `app/explore/page.tsx` (new), `lib/supabase.ts`, `components/Navbar.tsx`

- [ ] **11.3 Collaborative trip editing** [L]
  - Can't plan a trip with a friend in real-time.
  - Fix: `trip_collaborators` table. Invite by email. Supabase Realtime to sync edits.
  - Files: `lib/supabase.ts`, `supabase-schema.sql`, `app/trip/[id]/page.tsx`, `components/CollaboratorPanel.tsx` (new)

- [ ] **11.4 Mobile PWA** [M]
  - No offline support or installable mobile experience.
  - Fix: `manifest.json` + `next-pwa` service worker. Cache saved trips for offline viewing.
  - Files: `public/manifest.json` (new), `app/layout.tsx`, install `next-pwa`

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Google Places API costs per request | Cache results in Supabase alongside trip data |
| Amadeus prod quota limits | Graceful fallback UI, cache responses |
| Pexels 200 req/hr free limit | Cache image URLs in trip record |
| Supabase Realtime complexity for collab | Phase 11.3 is optional — skip if not priority |

## Recommended Weekly Sprint

```
Week 1: Phase 8 (all 4 tasks) — solid foundation
Week 2: 9.1, 9.2, 9.7 — better AI + auto-save
Week 3: 9.3, 9.4, 9.5 — activity swap + weather + diff
Week 4: 9.6, 9.8, 10.1 — export + profile + real restaurants
Week 5: 11.1, 11.2 — share + explore gallery
Week 6: 10.2, 11.3, 11.4 — flights, collab, PWA
```
