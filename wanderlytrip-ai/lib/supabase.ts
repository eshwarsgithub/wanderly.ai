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

// Types matching the `trips` table in Supabase
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
  share_token?: string;
  is_public?: boolean;
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
  try {
    const { data: { user } } = await getSupabase().auth.getUser();
    return user;
  } catch {
    return null;
  }
}

// Trip CRUD — uses `any` cast to work around strict generic inference on untyped schema
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

// User Profile CRUD (extended preferences stored in profiles table)
export interface UserProfile {
  id: string;
  home_city: string;
  currency: string;
  dietary: string[];
  travel_style: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function loadProfile(userId: string): Promise<UserProfile | null> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("profiles") as any)
    .select("id, home_city, currency, dietary, travel_style, created_at, updated_at")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as UserProfile;
}

export async function saveProfile(profile: Omit<UserProfile, "created_at" | "updated_at">) {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("profiles") as any)
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

// Public trips feed (explore page)
export interface PublicTripsFilter {
  vibe?: string;
  destination?: string;
  minDays?: number;
  maxDays?: number;
}

export async function loadPublicTrips(filter: PublicTripsFilter = {}): Promise<TripRecord[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db.from("trips") as any)
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter.vibe) query = query.eq("vibe", filter.vibe);
  if (filter.destination) query = query.ilike("destination", `%${filter.destination}%`);
  if (filter.minDays !== undefined) query = query.gte("total_days", filter.minDays);
  if (filter.maxDays !== undefined) query = query.lte("total_days", filter.maxDays);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as TripRecord[];
}

// Load a shared trip by its slug/share_token
export async function loadTripBySlug(slug: string): Promise<TripRecord | null> {
  return loadTripByToken(slug);
}

// Collaborators (trip_collaborators table)
export interface CollaboratorRecord {
  id: string;
  trip_id: string;
  email: string;
  role: "editor" | "viewer";
  created_at: string;
}

export async function loadCollaborators(tripId: string): Promise<CollaboratorRecord[]> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trip_collaborators") as any)
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as CollaboratorRecord[];
}

export async function inviteCollaborator(
  tripId: string,
  email: string,
  role: "editor" | "viewer"
): Promise<CollaboratorRecord> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trip_collaborators") as any)
    .insert({ trip_id: tripId, email, role })
    .select()
    .single();
  if (error) throw error;
  return data as CollaboratorRecord;
}

export async function removeCollaborator(collaboratorId: string) {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trip_collaborators") as any).delete().eq("id", collaboratorId);
  if (error) throw error;
}

// Generate a unique share token and make the trip public
export async function shareTrip(tripId: string): Promise<string> {
  const { nanoid } = await import("nanoid");
  const token = nanoid(12);
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("trips") as any)
    .update({ share_token: token, is_public: true })
    .eq("id", tripId);
  if (error) throw error;
  return token;
}

// Load a trip by its public share token (no auth required — RLS allows public reads)
export async function loadTripByToken(token: string): Promise<TripRecord | null> {
  const db = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("trips") as any)
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();
  if (error) return null;
  return data as TripRecord;
}
