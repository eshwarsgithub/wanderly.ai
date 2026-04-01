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
