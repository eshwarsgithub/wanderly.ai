"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, ChevronDown, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";

const PASSPORTS = [
  { code: "US", label: "🇺🇸 USA" },
  { code: "GB", label: "🇬🇧 UK" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "FR", label: "🇫🇷 France" },
  { code: "JP", label: "🇯🇵 Japan" },
  { code: "SG", label: "🇸🇬 Singapore" },
  { code: "BR", label: "🇧🇷 Brazil" },
];

const VISA_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  "visa-free":        { bg: "#f0fdfb", text: "#065f46", border: "#99f6e4", label: "Visa Free" },
  "visa-on-arrival":  { bg: "#fefce8", text: "#854d0e", border: "#fde68a", label: "Visa on Arrival" },
  "e-visa":           { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", label: "e-Visa Required" },
  "visa-required":    { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", label: "Visa Required" },
};

const WARNING_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  safe:    { bg: "#f0fdfb", text: "#065f46", icon: "✅" },
  caution: { bg: "#fefce8", text: "#854d0e", icon: "⚠️" },
  high:    { bg: "#fef2f2", text: "#991b1b", icon: "🚨" },
};

interface VisaData {
  destination: string;
  passport: string;
  visaType: string;
  stayLimit: string;
  cost: string;
  processingTime: string;
  requirements: string[];
  healthRequirements: string[];
  entryNotes: string;
  applyAt: string | null;
  warningLevel: "safe" | "caution" | "high";
  travelAdvisory: string;
}

export default function VisaPanel({ destination }: { destination: string }) {
  const [open, setOpen] = useState(false);
  const [passport, setPassport] = useState("US");
  const [data, setData] = useState<VisaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState("");

  useEffect(() => {
    if (!open) return;
    const key = `${destination}__${passport}`;
    if (key === lastFetched) return;

    setLoading(true);
    setData(null);
    fetch(`/api/visa?destination=${encodeURIComponent(destination)}&passport=${passport}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLastFetched(key); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, passport, destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const visaStyle = data ? (VISA_STYLES[data.visaType] ?? VISA_STYLES["visa-required"]) : null;
  const warnStyle = data ? (WARNING_STYLES[data.warningLevel] ?? WARNING_STYLES.safe) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#00a896]" />
          Visa & Entry
        </h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {/* Passport selector */}
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Your passport</label>
                <select
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0f172a] focus:outline-none focus:border-[#00a896] bg-white transition-colors"
                >
                  {PASSPORTS.map((p) => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking requirements…
                </div>
              )}

              {data && !loading && (
                <div className="space-y-3">
                  {/* Visa type badge */}
                  {visaStyle && (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: visaStyle.bg, color: visaStyle.text, border: `1px solid ${visaStyle.border}` }}
                    >
                      {data.visaType === "visa-free" ? "✓" : data.visaType === "visa-on-arrival" ? "📋" : "📝"}
                      {visaStyle.label}
                    </div>
                  )}

                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Stay limit", value: data.stayLimit },
                      { label: "Cost", value: data.cost },
                      { label: "Processing", value: data.processingTime },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-slate-400 text-[10px] uppercase tracking-wide">{label}</p>
                        <p className="text-[#0f172a] text-xs font-semibold mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Requirements */}
                  {data.requirements?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-1.5">Required documents</p>
                      <ul className="space-y-1">
                        {data.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                            <span className="text-[#00a896] mt-0.5">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Health reqs */}
                  {data.healthRequirements?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-1.5">Health requirements</p>
                      <ul className="space-y-1">
                        {data.healthRequirements.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 text-xs">
                            <span className="text-amber-500 mt-0.5">•</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Entry notes */}
                  {data.entryNotes && (
                    <div
                      className="rounded-xl p-3 text-xs leading-relaxed"
                      style={{ background: "#f0fdfb", color: "#065f46" }}
                    >
                      {data.entryNotes}
                    </div>
                  )}

                  {/* Travel advisory */}
                  {warnStyle && (
                    <div
                      className="rounded-xl p-3 flex items-start gap-2 text-xs"
                      style={{ background: warnStyle.bg, color: warnStyle.text }}
                    >
                      <span>{warnStyle.icon}</span>
                      <span className="leading-relaxed">{data.travelAdvisory}</span>
                    </div>
                  )}

                  {/* Apply link */}
                  {data.applyAt && (
                    <a
                      href={data.applyAt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#00a896] hover:underline font-medium"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Apply for visa
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
