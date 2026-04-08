"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ChevronDown, Phone, AlertOctagon, Loader2 } from "lucide-react";

interface EmergencyData {
  destination: string;
  police: string;
  ambulance: string;
  fire: string;
  touristPolice: string | null;
  emergencySMS: string | null;
  usEmbassy: string | null;
  ukEmbassy: string | null;
  hospitalTip: string;
  localEmergencyApp: string | null;
  scamWarnings: string[];
  safetyTips: string[];
}

function CallButton({ number, label }: { number: string | null; label: string }) {
  if (!number) return null;
  return (
    <a
      href={`tel:${number}`}
      className="flex items-center justify-between p-2.5 rounded-xl border transition-all hover:border-slate-300 group"
      style={{ borderColor: "#f1f5f9" }}
    >
      <div>
        <p className="text-slate-400 text-[10px] uppercase tracking-wide">{label}</p>
        <p className="text-[#0f172a] text-sm font-bold tracking-wider">{number}</p>
      </div>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform"
        style={{ background: "#f0fdfb" }}
      >
        <Phone className="w-3.5 h-3.5 text-[#00a896]" />
      </div>
    </a>
  );
}

export default function EmergencyPanel({ destination }: { destination: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EmergencyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    fetch(`/api/emergency?destination=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setFetched(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, destination, fetched]);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "#fecaca", background: "#fff" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors"
      >
        <h3 className="text-[#991b1b] font-semibold text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          Emergency Contacts
        </h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-red-300" />
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
            <div className="px-5 pb-5 border-t pt-4 space-y-4" style={{ borderColor: "#fecaca" }}>
              {loading && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading emergency info…
                </div>
              )}

              {data && !loading && (
                <>
                  {/* Core numbers */}
                  <div className="space-y-2">
                    <CallButton number={data.police} label="Police" />
                    <CallButton number={data.ambulance} label="Ambulance" />
                    <CallButton number={data.fire} label="Fire" />
                    {data.touristPolice && <CallButton number={data.touristPolice} label="Tourist Police" />}
                    {data.usEmbassy && <CallButton number={data.usEmbassy} label="US Embassy" />}
                    {data.ukEmbassy && <CallButton number={data.ukEmbassy} label="UK Embassy" />}
                  </div>

                  {/* Hospital tip */}
                  {data.hospitalTip && (
                    <div className="rounded-xl p-3 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                      🏥 {data.hospitalTip}
                    </div>
                  )}

                  {/* Scam warnings */}
                  {data.scamWarnings?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                        <AlertOctagon className="w-3 h-3 text-amber-500" /> Common scams
                      </p>
                      <ul className="space-y-1">
                        {data.scamWarnings.map((w, i) => (
                          <li key={i} className="text-slate-600 text-xs flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safety tips */}
                  {data.safetyTips?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-1.5">Safety tips</p>
                      <ul className="space-y-1">
                        {data.safetyTips.map((t, i) => (
                          <li key={i} className="text-slate-600 text-xs flex items-start gap-2">
                            <span className="text-[#00a896] mt-0.5 flex-shrink-0">✓</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.localEmergencyApp && (
                    <p className="text-slate-400 text-xs">
                      📱 Recommended: <span className="font-medium text-slate-600">{data.localEmergencyApp}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
