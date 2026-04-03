-- WanderlyTrip.ai — Supabase Schema
-- Best practices applied per supabase/agent-skills v1.1.0
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─────────────────────────────────────────────────────────
-- TRIPS TABLE
-- ─────────────────────────────────────────────────────────
create table if not exists public.trips (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  vibe        text not null,
  budget      integer not null check (budget > 0),
  travelers   integer not null default 1 check (travelers >= 1),
  start_date  text not null,
  end_date    text not null,
  itinerary   jsonb not null default '{}'::jsonb,
  is_public   boolean not null default false,
  share_slug  text unique,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────
-- INDEXES (TRIPS)
-- ─────────────────────────────────────────────────────────
create index if not exists trips_user_id_idx
  on public.trips (user_id);

create index if not exists trips_created_at_idx
  on public.trips (created_at desc);

create index if not exists trips_itinerary_gin
  on public.trips using gin (itinerary jsonb_path_ops);

create index if not exists trips_destination_lower_idx
  on public.trips (lower(destination));

create unique index if not exists trips_share_slug_idx
  on public.trips (share_slug);

-- ─────────────────────────────────────────────────────────
-- RLS (TRIPS)
-- ─────────────────────────────────────────────────────────
alter table public.trips enable row level security;

create policy "Users can view own trips"
  on public.trips for select
  using ((select auth.uid()) = user_id);

create policy "Public trips are viewable by all"
  on public.trips for select
  using (is_public = true);

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
-- USER PROFILES TABLE (9.8)
-- ─────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  home_city    text,
  currency     text not null default 'USD',
  dietary      text[] not null default '{}',
  travel_style text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table public.user_profiles enable row level security;

create policy "Users can manage own profile"
  on public.user_profiles for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────
-- PRICE ALERTS TABLE (10.2)
-- ─────────────────────────────────────────────────────────
create table if not exists public.price_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  origin       text not null,
  destination  text not null,
  travel_date  text not null,
  adults       integer not null default 1,
  last_price   numeric,
  created_at   timestamptz default now() not null
);

alter table public.price_alerts enable row level security;

create policy "Users manage own alerts"
  on public.price_alerts for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists price_alerts_user_id_idx
  on public.price_alerts (user_id);

-- ─────────────────────────────────────────────────────────
-- TRIP COLLABORATORS TABLE (11.3)
-- ─────────────────────────────────────────────────────────
create table if not exists public.trip_collaborators (
  id         uuid primary key default gen_random_uuid(),
  trip_id    text not null references public.trips(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  email      text not null,
  role       text not null default 'editor' check (role in ('viewer', 'editor')),
  accepted   boolean not null default false,
  created_at timestamptz default now() not null
);

alter table public.trip_collaborators enable row level security;

create policy "Trip owner can manage collaborators"
  on public.trip_collaborators for all
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
        and t.user_id = (select auth.uid())
    )
  );

create policy "Collaborators can view their invites"
  on public.trip_collaborators for select
  using (user_id = (select auth.uid()));

create index if not exists collab_trip_id_idx on public.trip_collaborators (trip_id);
create index if not exists collab_user_id_idx on public.trip_collaborators (user_id);

-- ─────────────────────────────────────────────────────────
-- REALTIME (11.3)
-- Enable Supabase Realtime on the trips table so collaborators
-- receive live updates when the itinerary is saved.
-- ─────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.trips;

-- ─────────────────────────────────────────────────────────
-- VERIFY (run after applying)
-- ─────────────────────────────────────────────────────────
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select indexname from pg_indexes where tablename = 'trips';
-- select policyname from pg_policies where tablename = 'trips';
