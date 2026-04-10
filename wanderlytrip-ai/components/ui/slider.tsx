"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  className?: string
}

/**
 * Slider — native <input type="range"> wrapper.
 * Replaces @base-ui/react/slider which renders <script> tags
 * incompatible with React 19 / Next.js 16 Turbopack.
 * Exposes the same onValueChange(number[]) API used throughout the app.
 */
function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
}: SliderProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<number>(
    value?.[0] ?? defaultValue?.[0] ?? min
  )
  const current = isControlled ? (value![0] ?? min) : internal
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value)
    if (!isControlled) setInternal(next)
    onValueChange?.([next])
  }

  return (
    <div
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center py-1",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Track */}
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full bg-[#0f172a] transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Thumb (decorative — pointer events handled by native input below) */}
      <div
        aria-hidden="true"
        className="absolute size-3 shrink-0 rounded-full border-2 border-[#0f172a] bg-white shadow-sm pointer-events-none"
        style={{ left: `calc(${pct}% - ${(pct / 100) * 12}px)` }}
      />

      {/* Native range input — handles all drag/touch/keyboard events + carries ARIA */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  )
}

export { Slider }
