"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, X, CreditCard, Check } from "lucide-react";
import type { GeneratedItinerary } from "@/lib/ai-agent";

interface TripCardGeneratorProps {
  itinerary: GeneratedItinerary;
  onClose: () => void;
}

const VIBE_COLORS: Record<string, string> = {
  adventure: "#f472b6",
  culture: "#a78bfa",
  food: "#fb923c",
  relaxation: "#34d399",
  romantic: "#f472b6",
  luxury: "#fbbf24",
  chill: "#60a5fa",
  urban: "#94a3b8",
};

function drawCard(canvas: HTMLCanvasElement, itinerary: GeneratedItinerary) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 800, H = 420;
  canvas.width = W;
  canvas.height = H;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#0a1628");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Left accent bar
  ctx.fillStyle = "#00f5d4";
  ctx.fillRect(0, 0, 5, H);

  // Noise texture overlay (subtle dots)
  ctx.fillStyle = "rgba(255,255,255,0.012)";
  for (let i = 0; i < 1200; i++) {
    ctx.fillRect(
      Math.random() * W,
      Math.random() * H,
      Math.random() * 2,
      Math.random() * 2
    );
  }

  // Vibe accent glow (top right)
  const vibeColor = VIBE_COLORS[itinerary.vibe] ?? "#00f5d4";
  const glow = ctx.createRadialGradient(W - 100, 80, 0, W - 100, 80, 180);
  glow.addColorStop(0, vibeColor + "28");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top label: "WanderlyTrip.ai"
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "500 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("WanderlyTrip.ai", 32, 38);

  // Vibe pill
  ctx.fillStyle = vibeColor + "25";
  const vibePillX = W - 32 - ctx.measureText(itinerary.vibe.toUpperCase()).width - 24;
  const vibePillW = ctx.measureText(itinerary.vibe.toUpperCase()).width + 24;
  roundRect(ctx, vibePillX, 22, vibePillW, 24, 12, vibeColor + "25");
  ctx.strokeStyle = vibeColor + "50";
  ctx.lineWidth = 1;
  roundRectStroke(ctx, vibePillX, 22, vibePillW, 24, 12);
  ctx.fillStyle = vibeColor;
  ctx.font = "600 11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(itinerary.vibe.toUpperCase(), W - 32 - 8, 38);
  ctx.textAlign = "left";

  // Destination name
  const destFont = itinerary.destination.length > 14 ? "bold 44px" : "bold 56px";
  ctx.fillStyle = "#ffffff";
  ctx.font = `${destFont} system-ui, -apple-system, sans-serif`;
  ctx.fillText(itinerary.destination, 32, 120);

  // Country sub-label
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 18px system-ui, -apple-system, sans-serif";
  ctx.fillText(itinerary.country, 32, 148);

  // Separator line
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 172);
  ctx.lineTo(W - 32, 172);
  ctx.stroke();

  // Stats row
  const stats = [
    { label: "DURATION", value: `${itinerary.totalDays} days` },
    { label: "BUDGET", value: `${itinerary.currency} ${itinerary.totalBudget.toLocaleString()}` },
    { label: "BEST TIME", value: itinerary.bestTimeToVisit.split(" ").slice(0, 3).join(" ") },
  ];
  stats.forEach((s, i) => {
    const x = 32 + i * 240;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "500 11px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "0.08em";
    ctx.fillText(s.label, x, 200);
    ctx.letterSpacing = "0";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(s.value, x, 222);
  });

  // Highlights section
  ctx.fillStyle = "#00f5d4";
  ctx.font = "600 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("✦  HIGHLIGHTS", 32, 264);

  // Separator
  ctx.strokeStyle = "rgba(0,245,212,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 274);
  ctx.lineTo(W - 32, 274);
  ctx.stroke();

  // Activity bullets (top 3 from day 1)
  const allActivities = itinerary.days.flatMap((d) => d.activities);
  const highlights = itinerary.highlights.slice(0, 3);
  highlights.forEach((h, i) => {
    const y = 304 + i * 30;
    // Bullet dot
    ctx.fillStyle = "#00f5d4";
    ctx.beginPath();
    ctx.arc(40, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Text (truncate long names)
    const text = h.length > 70 ? h.slice(0, 70) + "…" : h;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "400 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(text, 56, y);
  });

  // Bottom branding
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "400 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Plan yours free at wanderlytrip.ai", W - 32, H - 24);
  ctx.textAlign = "left";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function roundRectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

export default function TripCardGenerator({ itinerary, onClose }: TripCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCanvasMount = useCallback((node: HTMLCanvasElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
    if (node) {
      drawCard(node, itinerary);
      setRendered(true);
    }
  }, [itinerary]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${itinerary.destination.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-trip-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopy() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("No blob")); return; }
          navigator.clipboard
            .write([new ClipboardItem({ "image/png": blob })])
            .then(resolve)
            .catch(reject);
        }, "image/png");
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: just download
      handleDownload();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span className="text-[#0f172a] font-semibold text-sm">Trip Card</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="p-4 bg-slate-50">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <canvas
              ref={handleCanvasMount}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100">
          <p className="text-slate-400 text-xs flex-1">
            Share on Instagram Stories, Twitter, or anywhere you like.
          </p>
          <button
            onClick={handleCopy}
            disabled={!rendered}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? "Copied!" : "Copy image"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!rendered}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: "#0f172a" }}
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
