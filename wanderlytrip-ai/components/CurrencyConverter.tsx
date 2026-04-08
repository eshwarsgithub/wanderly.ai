"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, RefreshCw, ArrowLeftRight } from "lucide-react";

// Destination currency lookup by country/currency name keywords
const CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  MXN: { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  KRW: { code: "KRW", symbol: "₩", name: "Korean Won" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  MAD: { code: "MAD", symbol: "MAD", name: "Moroccan Dirham" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  COP: { code: "COP", symbol: "COP$", name: "Colombian Peso" },
  CLP: { code: "CLP", symbol: "CLP$", name: "Chilean Peso" },
  ARS: { code: "ARS", symbol: "ARS$", name: "Argentine Peso" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
};

// Try to detect currency from itinerary.currency field
function detectCurrency(currency: string): { code: string; symbol: string; name: string } {
  const upper = currency.toUpperCase().trim();
  if (CURRENCY_MAP[upper]) return CURRENCY_MAP[upper];
  // Fallback: search by partial match
  for (const [code, info] of Object.entries(CURRENCY_MAP)) {
    if (upper.includes(code) || info.name.toUpperCase().includes(upper)) return info;
  }
  return { code: "EUR", symbol: "€", name: "Euro" };
}

const QUICK_AMOUNTS = [10, 50, 100, 500];

interface CurrencyConverterProps {
  tripCurrency: string; // from itinerary.currency e.g. "JPY" or "Japanese Yen"
  totalBudget: number;
}

export default function CurrencyConverter({ tripCurrency, totalBudget }: CurrencyConverterProps) {
  const local = detectCurrency(tripCurrency);
  const home = { code: "USD", symbol: "$", name: "US Dollar" };

  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromAmount, setFromAmount] = useState("100");
  const [refreshing, setRefreshing] = useState(false);

  const isSame = local.code === home.code;

  const fetchRate = useCallback(async () => {
    if (isSame) { setRate(1); setLoading(false); return; }
    setRefreshing(true);
    try {
      const res = await fetch(`/api/exchange-rate?from=${home.code}&to=${local.code}`);
      const data = await res.json();
      if (data.rate) { setRate(data.rate); setDate(data.date); }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSame, local.code, home.code]);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const toAmount = rate && fromAmount
    ? (parseFloat(fromAmount) * rate).toLocaleString(undefined, {
        maximumFractionDigits: local.code === "JPY" || local.code === "KRW" || local.code === "IDR" || local.code === "VND" ? 0 : 2,
      })
    : "—";

  const budgetInLocal = rate ? Math.round(totalBudget * rate).toLocaleString() : "—";

  if (isSame) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#0f172a] font-semibold text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#00a896]" />
          Currency
        </h3>
        {date && (
          <span className="text-slate-400 text-xs">Rate: {date}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : rate ? (
        <>
          {/* Budget in local */}
          <div
            className="rounded-xl p-3 mb-4 text-center"
            style={{ background: "#f0fdfb" }}
          >
            <p className="text-slate-400 text-xs mb-0.5">Your ${totalBudget.toLocaleString()} budget</p>
            <p className="text-[#00a896] font-bold text-xl">
              {local.symbol}{budgetInLocal}
            </p>
            <p className="text-slate-400 text-[10px] mt-0.5">{local.name}</p>
          </div>

          {/* Converter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs w-8 flex-shrink-0 font-medium">
                {home.symbol}
              </span>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-[#0f172a] focus:outline-none focus:border-[#00a896] transition-colors"
                min="0"
              />
              <span className="text-slate-400 text-xs">{home.code}</span>
            </div>

            <div className="flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-300" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs w-8 flex-shrink-0 font-medium">
                {local.symbol}
              </span>
              <div className="flex-1 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold text-[#00a896]">
                {toAmount}
              </div>
              <span className="text-slate-400 text-xs">{local.code}</span>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setFromAmount(String(a))}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: fromAmount === String(a) ? "#0f172a" : "#f1f5f9",
                  color: fromAmount === String(a) ? "#ffffff" : "#64748b",
                }}
              >
                ${a}
              </button>
            ))}
          </div>

          {/* Rate info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-slate-400 text-xs">
              1 {home.code} = {rate?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {local.code}
            </p>
            <button
              onClick={fetchRate}
              disabled={refreshing}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </>
      ) : (
        <p className="text-slate-400 text-xs text-center py-4">Could not load exchange rates</p>
      )}
    </div>
  );
}
