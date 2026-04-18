"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  destination: string;
  country: string;
  flag: string;
  pitch: string;
  bestFor: string;
  budgetRange: string;
}

export default function SimilarDestinations({
  destination,
  vibe,
  budget,
}: {
  destination: string;
  vibe: string;
  budget: number;
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/similar-destinations?destination=${encodeURIComponent(destination)}&vibe=${encodeURIComponent(vibe)}&budget=${budget}`
    )
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [destination, vibe, budget]);

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="text-[#0f172a] font-semibold text-sm mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-slate-500" />
        You might also love
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.destination}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() =>
                router.push(`/generate?destination=${encodeURIComponent(s.destination)}`)
              }
              className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group"
              style={{ border: "1px solid #f1f5f9" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#f1f5f9")}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{s.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[#0f172a] text-sm font-semibold truncate">{s.destination}</p>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{ background: "#f8fafc", color: "#64748b" }}
                  >
                    {s.bestFor}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">{s.pitch}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-slate-400 text-[10px]">{s.budgetRange}</span>
                  <span className="text-slate-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Plan trip <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
