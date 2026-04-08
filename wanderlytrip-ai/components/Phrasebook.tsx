"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Languages, Volume2 } from "lucide-react";

interface Phrase {
  english: string;
  local: string;
  phonetic: string;
}

interface Category {
  name: string;
  phrases: Phrase[];
}

interface PhrasebookData {
  language: string;
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, string> = {
  "Greetings": "👋",
  "Food & Dining": "🍜",
  "Transport": "🚌",
  "Shopping": "🛍️",
  "Emergency": "🆘",
};

export default function Phrasebook({ destination }: { destination: string }) {
  const [data, setData] = useState<PhrasebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/phrasebook?destination=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [destination]);

  function speak(text: string, lang: string) {
    if (!("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.85;
    speechSynthesis.speak(utt);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-2xl animate-pulse w-48" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Languages className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-400 text-sm">Could not load phrasebook — check your API key.</p>
      </div>
    );
  }

  const category = data.categories[activeCategory];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#f0fdfb] flex items-center justify-center">
            <Languages className="w-4.5 h-4.5 text-[#00a896]" />
          </div>
          <div>
            <h3 className="text-[#0f172a] font-semibold text-sm">Travel Phrasebook</h3>
            <p className="text-slate-400 text-xs">Language: {data.language}</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: activeCategory === i ? "#0f172a" : "#f1f5f9",
              color: activeCategory === i ? "#ffffff" : "#64748b",
            }}
          >
            <span>{CATEGORY_ICONS[cat.name] ?? "💬"}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Phrases */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {CATEGORY_ICONS[category.name] ?? "💬"} {category.name}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {category.phrases.map((phrase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <p className="text-[#0f172a] text-sm font-medium">{phrase.english}</p>
                <p
                  className="text-[#00a896] text-sm font-semibold"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {phrase.local}
                </p>
                <p className="text-slate-400 text-xs italic mt-0.5 sm:mt-0">{phrase.phonetic}</p>
              </div>
              <button
                onClick={() => speak(phrase.local, data.language.toLowerCase().slice(0, 2))}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100"
                title="Hear pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-slate-400 text-xs text-center px-4">
        Tap <Volume2 className="inline w-3 h-3" /> to hear pronunciation (uses device speech synthesis)
      </p>
    </div>
  );
}
