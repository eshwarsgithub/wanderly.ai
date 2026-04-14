"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, Home, DollarSign, Leaf, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import VibeSelector from "@/components/VibeSelector";
import { getUser, loadProfile, saveProfile, type UserProfile } from "@/lib/supabase";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "INR"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Halal", "Gluten-free", "Nut-free", "Dairy-free"];

export default function ProfilePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<UserProfile, "created_at" | "updated_at">>({
    id: "",
    home_city: "",
    currency: "USD",
    dietary: [],
    travel_style: null,
  });

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const profile = await loadProfile(user.id);
      if (profile) {
        setForm({
          id: user.id,
          home_city: profile.home_city ?? "",
          currency: profile.currency,
          dietary: profile.dietary ?? [],
          travel_style: profile.travel_style,
        });
      } else {
        setForm((f) => ({ ...f, id: user.id }));
      }
    })();
  }, [router]);

  function toggleDietary(item: string) {
    setForm((f) => ({
      ...f,
      dietary: f.dietary.includes(item)
        ? f.dietary.filter((d) => d !== item)
        : [...f.dietary, item],
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    startTransition(async () => {
      try {
        await saveProfile({ ...form, id: userId });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <UserCircle2 className="w-6 h-6 text-[#00f5d4]" />
            <h1 className="text-3xl font-bold text-white">Travel Profile</h1>
          </div>
          <p className="text-white/50 mb-8">Your preferences auto-fill the trip generator.</p>

          <form onSubmit={handleSave} className="glass rounded-3xl p-8 space-y-8">
            {/* Home City */}
            <div className="space-y-2">
              <Label className="text-white/80 font-medium flex items-center gap-2">
                <Home className="w-4 h-4 text-[#00f5d4]" />
                Home city
              </Label>
              <Input
                placeholder="London, New York, Tokyo..."
                value={form.home_city ?? ""}
                onChange={(e) => setForm({ ...form, home_city: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-12 rounded-xl"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-white/80 font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00f5d4]" />
                Preferred currency
              </Label>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <motion.button
                    key={c}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm({ ...form, currency: c })}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: form.currency === c ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "rgba(255,255,255,0.05)",
                      color: form.currency === c ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                      border: form.currency === c ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <Label className="text-white/80 font-medium flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#00f5d4]" />
                Dietary restrictions
              </Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((item) => {
                  const checked = form.dietary.includes(item);
                  return (
                    <motion.button
                      key={item}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleDietary(item)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: checked ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.05)",
                        color: checked ? "#00f5d4" : "rgba(255,255,255,0.6)",
                        border: checked ? "1px solid rgba(0,245,212,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {checked && <Check className="w-3 h-3" />}
                      {item}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Default Travel Style */}
            <div className="space-y-4">
              <Label className="text-white/80 font-medium">Default travel style</Label>
              <VibeSelector
                selected={form.travel_style ?? ""}
                onSelect={(v) => setForm({ ...form, travel_style: v })}
              />
            </div>

            {/* Save */}
            <motion.button
              type="submit"
              disabled={isPending || !userId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)", color: "#0a0a0a" }}
            >
              {isPending ? "Saving..." : "Save Profile"}
            </motion.button>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center text-[#00f5d4] text-sm"
                >
                  <Check className="w-4 h-4" /> Profile saved successfully
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
