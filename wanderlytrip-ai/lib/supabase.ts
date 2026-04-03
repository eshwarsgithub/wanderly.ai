import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedItinerary } from "./ai-agent";

// Lazy singleton — created only at runtime, not during Next.js static builds
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not set. Add them to .env.local");
    _client = createClient(url, key);
  }
  return _client;
}

// ─────────────────────────────────────────────────────────
// TRIPS
// ─────────────────────────────────────────────────────────

export interface TripRecord {
  id: string;
  user_id: string;
  destination: string;
  vibe: string;
  budget: number;
  travelers: number;
  start_date: string;
  end_date: string;
  itinerary: GeneratedItinerary;
  created_at: string;
  is_public: boolean;
  share_slug: string | null;
}

// Auth helpers
export async function signUp(email: string, password: string) {
  return getSupabase().auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return getSupabase().auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return getSupabase().auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await getSupabase().auth.getUser();
  return user;
}

// Trip CRUD
export async function saveTrip(trip: Omit<TripRecord, "created_at">) {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trips") as any)
    .upsert(trip, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data as TripRecord;
}

export async function loadTrips(userId: string): Promise<TripRecord[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trips") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TripRecord[];
}

export async function loadTrip(tripId: string): Promise<TripRecord | null> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trips") as any)
    .select("*")
    .eq("id", tripId)
    .single();

  if (error) return null;
  return data as TripRecord;
}

export async function deleteTrip(tripId: string) {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trips") as any).delete().eq("id", tripId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────
// SHARING (11.1)
// ─────────────────────────────────────────────────────────

export function generateSlug(destination: string): string {
  const base = destination
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function publishTrip(tripId: string, slug: string): Promise<void> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trips") as any)
    .update({ is_public: true, share_slug: slug })
    .eq("id", tripId);
  if (error) throw error;
}

export async function loadTripBySlug(slug: string): Promise<TripRecord | null> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trips") as any)
    .select("*")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();
  if (error) return null;
  return data as TripRecord;
}

// ─────────────────────────────────────────────────────────
// PUBLIC TRIPS / EXPLORE (11.2)
// ─────────────────────────────────────────────────────────

export interface PublicTripsFilter {
  vibe?: string;
  destination?: string;
  minDays?: number;
  maxDays?: number;
}

export async function loadPublicTrips(filters?: PublicTripsFilter): Promise<TripRecord[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db.from("trips") as any)
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  if (filters?.vibe) query = query.eq("vibe", filters.vibe);
  if (filters?.destination) query = query.ilike("destination", `%${filters.destination}%`);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as TripRecord[];
}

// ─────────────────────────────────────────────────────────
// USER PROFILE (9.8)
// ─────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  home_city: string | null;
  currency: string;
  dietary: string[];
  travel_style: string | null;
  created_at: string;
  updated_at: string;
}

export async function loadProfile(userId: string): Promise<UserProfile | null> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("user_profiles") as any)
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as UserProfile;
}

export async function saveProfile(
  profile: Omit<UserProfile, "created_at" | "updated_at">
): Promise<UserProfile> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("user_profiles") as any)
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

// ─────────────────────────────────────────────────────────
// PRICE ALERTS (10.2)
// ─────────────────────────────────────────────────────────

export interface PriceAlert {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  travel_date: string;
  adults: number;
  last_price: number | null;
  created_at: string;
}

export async function createPriceAlert(
  alert: Omit<PriceAlert, "id" | "created_at">
): Promise<PriceAlert> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("price_alerts") as any)
    .insert(alert)
    .select()
    .single();
  if (error) throw error;
  return data as PriceAlert;
}

export async function loadPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("price_alerts") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as PriceAlert[];
}

export async function deletePriceAlert(alertId: string): Promise<void> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("price_alerts") as any).delete().eq("id", alertId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────
// COLLABORATORS (11.3)
// ─────────────────────────────────────────────────────────

export interface CollaboratorRecord {
  id: string;
  trip_id: string;
  user_id: string | null;
  email: string;
  role: "viewer" | "editor";
  accepted: boolean;
  created_at: string;
}

export async function inviteCollaborator(
  tripId: string,
  email: string,
  role: "viewer" | "editor"
): Promise<void> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trip_collaborators") as any).insert({ trip_id: tripId, email, role });
  if (error) throw error;
}

export async function loadCollaborators(tripId: string): Promise<CollaboratorRecord[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trip_collaborators") as any)
    .select("*")
    .eq("trip_id", tripId);
  if (error) return [];
  return (data ?? []) as CollaboratorRecord[];
}

export async function removeCollaborator(collaboratorId: string): Promise<void> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trip_collaborators") as any).delete().eq("id", collaboratorId);
  if (error) throw error;
}

export function subscribeToTrip(
  tripId: string,
  callback: (itinerary: GeneratedItinerary) => void
): () => void {
  const channel = getSupabase()
    .channel(`trip:${tripId}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on("postgres_changes" as any, {
      event: "UPDATE",
      schema: "public",
      table: "trips",
      filter: `id=eq.${tripId}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, (payload: any) => {
      const record = payload.new as TripRecord;
      if (record.itinerary) callback(record.itinerary);
    })
    .subscribe();

  return () => { channel.unsubscribe(); };
}
