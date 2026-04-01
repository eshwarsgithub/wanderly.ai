"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const action = mode === "login" ? signIn : signUp;
      const { error: authError } = await action(email, password);

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/saved");
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00f5d4, transparent 70%)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center teal-glow"
            style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
            <Globe className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <span className="font-bold text-white text-xl">
            Wanderly<span className="text-[#00f5d4]">Trip</span>
            <span className="text-white/40">.ai</span>
          </span>
        </Link>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {/* Toggle */}
          <div className="flex gap-1 glass rounded-2xl p-1 mb-8">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: mode === m ? "linear-gradient(135deg, #00f5d4, #00c4aa)" : "transparent",
                  color: mode === m ? "#0a0a0a" : "rgba(255,255,255,0.5)",
                }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00f5d4]" /> Email
              </Label>
              <Input required type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#00f5d4]" /> Password
              </Label>
              <div className="relative">
                <Input required type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/50 h-12 rounded-xl pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </motion.div>
            )}

            <motion.button type="submit" disabled={isPending} whileHover={isPending ? {} : { scale: 1.02 }}
              whileTap={isPending ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[#0a0a0a] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}>
              {isPending ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
