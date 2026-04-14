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
      try {
        const action = mode === "login" ? signIn : signUp;
        const { error: authError } = await action(email, password);

        if (authError) {
          setError(authError.message ?? "Authentication failed");
          return;
        }

        const returnUrl = sessionStorage.getItem("returnUrl");
        sessionStorage.removeItem("returnUrl");
        router.push(returnUrl || "/saved");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  const inputClass = "h-12 rounded-xl border-slate-200 bg-white text-[#0f172a] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {/* Subtle bg blob */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-[#0f172a] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#14b8a6]" />
          </div>
          <span className="font-bold text-[#0f172a] text-xl tracking-tight">
            Wanderly<span style={{ color: "#00a896" }}>Trip</span>
            <span className="text-slate-400">.ai</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-8">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: mode === m ? "#ffffff" : "transparent",
                  color: mode === m ? "#0f172a" : "#94a3b8",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00a896]" /> Email
              </Label>
              <Input required type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#00a896]" /> Password
              </Label>
              <div className="relative">
                <Input required type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </motion.div>
            )}

            <motion.button type="submit" disabled={isPending}
              whileHover={isPending ? {} : { scale: 1.02 }}
              whileTap={isPending ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 transition-colors">
              {isPending ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
