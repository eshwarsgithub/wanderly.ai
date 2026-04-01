-- WanderlyTrip.ai — Supabase Schema
-- Best practices applied per supabase/agent-skills v1.1.0
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─────────────────────────────────────────────────────────
-- TRIPS TABLE
-- ─────────────────────────────────────────────────────────
create table if not exists public.trips (
  -- text PK: IDs generated client-side as "trip-{timestamp}-{random}"
  -- Compatible with sessionStorage → Supabase save flow
  id          text primary key,

  user_id     uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  vibe        text not null,
  budget      integer not null check (budget > 0),
  travelers   integer not null default 1 check (travelers >= 1),
  start_date  text not null,
  end_date    text not null,

  -- JSONB for the full AI-generated itinerary object
  itinerary   jsonb not null default '{}'::jsonb,

  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────

-- Fast user trip lookups (also satisfies FK index requirement)
create index if not exists trips_user_id_idx
  on public.trips (user_id);

-- Recent-first ordering
create index if not exists trips_created_at_idx
  on public.trips (created_at desc);

-- GIN index on itinerary JSONB for containment queries
-- Enables: WHERE itinerary @> '{"vibe": "adventure"}' etc.
-- Impact: 10-100x faster JSONB queries (per supabase best practices)
create index if not exists trips_itinerary_gin
  on public.trips using gin (itinerary jsonb_path_ops);

-- Expression index for destination search (case-insensitive)
create index if not exists trips_destination_lower_idx
  on public.trips (lower(destination));

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────
alter table public.trips enable row level security;

-- IMPORTANT: Use (select auth.uid()) not auth.uid() directly
-- This caches the function call once per query instead of per-row
-- Impact: 5-10x faster on large tables (per supabase rls-performance guide)

create policy "Users can view own trips"
  on public.trips for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────
-- VERIFY (run after applying)
-- ─────────────────────────────────────────────────────────
-- select tablename, rowsecurity from pg_tables where tablename = 'trips';
-- select indexname from pg_indexes where tablename = 'trips';
-- select policyname from pg_policies where tablename = 'trips';
