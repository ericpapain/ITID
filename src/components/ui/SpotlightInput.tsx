"use client";

import { useId, useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useTime,
} from "framer-motion";
import { type LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function SpotlightInput({
  label,
  type = "text",
  icon: Icon,
  className = "",
  value,
  onChange,
  required = false
}: {
  label: string;
  type?: string;
  icon?: LucideIcon;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [focused, setFocused] = useState(false);
  const [hovering, setHovering] = useState(false);

  const active = focused || hovering;

  const time = useTime();
  const beamRotate = useTransform(time, (t) => (t / 30) % 360);

  const driftX = useTransform(time, (t) => Math.round(50 + 26 * Math.sin(t / 2600)));
  const driftY = useTransform(time, (t) =>
    Math.round(50 + 19 * Math.sin(t / 1900 + 1.3))
  );
  // Adjusted for ITID branding (teal/blue)
  const idleGlow = useMotionTemplate`radial-gradient(150px circle at ${driftX}% ${driftY}%, rgba(42,157,143,0.15), transparent 72%)`;

  const springX = useSpring(mouseX, { stiffness: 170, damping: 24, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 170, damping: 24, mass: 0.4 });
  const cursorX = useTransform(springX, (v) => Math.round(v));
  const cursorY = useTransform(springY, (v) => Math.round(v));
  const cursorGlow = useMotionTemplate`radial-gradient(220px circle at ${cursorX}px ${cursorY}px, rgba(42,157,143,0.25), transparent 70%)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const floated = focused || value.length > 0;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-md p-px shadow-sm ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden rounded-xl">
        <motion.div
          style={{
            rotate: beamRotate,
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 255deg, rgba(42,157,143,0.5) 322deg, rgba(72,209,194,0.9) 350deg, transparent 360deg)",
          }}
          className="aspect-square w-[150%]"
        />
      </div>

      <div className="relative overflow-hidden rounded-[11px] bg-white/60 backdrop-blur-md">
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: idleGlow }}
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: cursorGlow }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        />

        <div className={`relative z-10 pb-2 pr-4 pt-5 ${Icon ? "pl-11" : "pl-4"}`}>
          {Icon && (
            <Icon
              aria-hidden
              className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${focused ? "text-[#48d1c2]" : "text-gray-500"}`}
            />
          )}
          <motion.label
            htmlFor={id}
            initial={false}
            animate={{
              y: floated ? -9 : 6,
              scale: floated ? 0.78 : 1,
              color: focused ? "#2a9d8f" : "#6b7280",
            }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ originX: 0 }}
            className={`pointer-events-none absolute top-0 text-sm ${Icon ? "left-11" : "left-4"}`}
          >
            {label}
          </motion.label>
          <input
            id={id}
            type={type}
            value={value}
            required={required}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent pt-2 text-sm text-[#1a3a5c] caret-[#48d1c2] outline-none placeholder:text-transparent"
          />
        </div>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl border border-[#2a9d8f]/50"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      />
    </div>
  );
}
