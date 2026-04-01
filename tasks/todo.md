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
