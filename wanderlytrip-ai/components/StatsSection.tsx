"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Globe, Route, Star, Users } from "lucide-react";

const STATS = [
  { icon: Route, value: 12400, suffix: "+", label: "Trips planned", color: "#00f5d4" },
  { icon: Globe, value: 140, suffix: "+", label: "Destinations covered", color: "#f472b6" },
  { icon: Star, value: 4.9, suffix: "★", label: "Average rating", color: "#fbbf24", decimal: true },
  { icon: Users, value: 8200, suffix: "+", label: "Happy travelers", color: "#60a5fa" },
];

function Counter({
  target,
  suffix,
  decimal = false,
  started,
}: {
  target: number;
  suffix: string;
  decimal?: boolean;
  started: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const frames = 60;
    const step = target / frames;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / frames);
    return () => clearInterval(timer);
  }, [started, target]);

  const display = decimal
    ? count.toFixed(1)
    : Math.round(count).toLocaleString();

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-16 px-4"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #0a0a0a 100%)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p
                  className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight mb-1"
                  style={{ color: stat.color }}
                >
                  <Counter
                    target={stat.value}
                    suffix={stat.suffix}
                    decimal={stat.decimal}
                    started={inView}
                  />
                </p>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
