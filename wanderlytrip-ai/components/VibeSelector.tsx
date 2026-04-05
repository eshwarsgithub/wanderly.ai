"use client";

import { motion } from "framer-motion";
import {
  Mountain, Landmark, UtensilsCrossed, Waves,
  Heart, Gem, Coffee
} from "lucide-react";

export const VIBES = [
  { id: "adventure",  label: "Adventure",  icon: Mountain,        color: "#f97316" },
  { id: "culture",    label: "Culture",    icon: Landmark,        color: "#8b5cf6" },
  { id: "food",       label: "Food",       icon: UtensilsCrossed, color: "#ec4899" },
  { id: "relaxation", label: "Relaxation", icon: Waves,           color: "#0ea5e9" },
  { id: "romantic",   label: "Romantic",   icon: Heart,           color: "#f43f5e" },
  { id: "luxury",     label: "Luxury",     icon: Gem,             color: "#eab308" },
  { id: "chill",      label: "Chill",      icon: Coffee,          color: "#14b8a6" },
];

interface VibeSelectorProps {
  selected: string;
  onSelect: (vibe: string) => void;
}

export default function VibeSelector({ selected, onSelect }: VibeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {VIBES.map((vibe, i) => {
        const isSelected = selected === vibe.id;
        return (
          <motion.button
            key={vibe.id}
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(vibe.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border"
            style={
              isSelected
                ? {
                    background: `${vibe.color}10`,
                    borderColor: `${vibe.color}40`,
                    color: vibe.color,
                    boxShadow: `0 0 0 3px ${vibe.color}12`,
                  }
                : {
                    background: "#ffffff",
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }
            }
          >
            <vibe.icon
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: isSelected ? vibe.color : "#94a3b8" }}
            />
            {vibe.label}
          </motion.button>
        );
      })}
    </div>
  );
}
