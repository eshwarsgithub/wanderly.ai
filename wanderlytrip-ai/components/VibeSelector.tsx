"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Mountain, Landmark, UtensilsCrossed, Waves, Heart, Crown, Coffee,
} from "lucide-react";

const VIBES = [
  { id: "adventure", label: "Adventure", icon: Mountain, color: "#ff6b35" },
  { id: "culture", label: "Culture", icon: Landmark, color: "#a78bfa" },
  { id: "food", label: "Food", icon: UtensilsCrossed, color: "#fbbf24" },
  { id: "relaxation", label: "Relaxation", icon: Waves, color: "#38bdf8" },
  { id: "romantic", label: "Romantic", icon: Heart, color: "#f472b6" },
  { id: "luxury", label: "Luxury", icon: Crown, color: "#00f5d4" },
  { id: "chill", label: "Chill", icon: Coffee, color: "#86efac" },
];

interface VibeSelectorProps {
  selected?: string;
  onSelect?: (vibe: string) => void;
  className?: string;
}

export default function VibeSelector({ selected, onSelect, className = "" }: VibeSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {VIBES.map((vibe, index) => {
        const Icon = vibe.icon;
        const isSelected = selected === vibe.id;
        const isHovered = hovered === vibe.id;

        return (
          <motion.button
            key={vibe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHovered(vibe.id)}
            onHoverEnd={() => setHovered(null)}
            onClick={() => onSelect?.(vibe.id)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-medium text-sm"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${vibe.color}22, ${vibe.color}11)`
                : isHovered
                ? `linear-gradient(135deg, ${vibe.color}15, transparent)`
                : "rgba(255,255,255,0.05)",
              border: isSelected
                ? `1.5px solid ${vibe.color}80`
                : isHovered
                ? `1.5px solid ${vibe.color}40`
                : "1.5px solid rgba(255,255,255,0.1)",
              color: isSelected ? vibe.color : isHovered ? vibe.color : "rgba(255,255,255,0.6)",
              boxShadow: isSelected ? `0 0 16px ${vibe.color}30` : "none",
            }}
          >
            {/* Glow dot for selected */}
            {isSelected && (
              <motion.div
                layoutId="vibe-glow"
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 24px ${vibe.color}40` }}
              />
            )}
            <Icon className="w-4 h-4 relative" />
            <span className="relative">{vibe.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export { VIBES };
