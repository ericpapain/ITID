"use client";

import { motion } from "framer-motion";
import {
  Box,
  MessageSquare,
  Palette,
  Zap,
  Database,
  Cloud,
  Puzzle,
  Sparkles,
} from "lucide-react";

interface OrbitIcon {
  Icon: typeof Box;
  radius: number;
  duration: number;
  startAngle: number;
  reverse?: boolean;
  color: string;
}

const ICONS: OrbitIcon[] = [
  { Icon: Box, radius: 70, duration: 14, startAngle: 20, color: "text-[#2a9d8f]" },
  { Icon: MessageSquare, radius: 70, duration: 14, startAngle: 200, color: "text-[#2a9d8f]" },
  { Icon: Palette, radius: 110, duration: 20, startAngle: 90, reverse: true, color: "text-[#3bb5a6]" },
  { Icon: Database, radius: 110, duration: 20, startAngle: 270, reverse: true, color: "text-[#3bb5a6]" },
  { Icon: Zap, radius: 150, duration: 26, startAngle: 0, color: "text-[#2a9d8f]" },
  { Icon: Cloud, radius: 150, duration: 26, startAngle: 145, color: "text-[#2a9d8f]" },
  { Icon: Puzzle, radius: 150, duration: 26, startAngle: 250, color: "text-[#2a9d8f]" },
];

function OrbitItem({ item }: { item: OrbitIcon }) {
  const { Icon, radius, duration, startAngle, reverse, color } = item;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ marginLeft: -radius, marginTop: -radius, width: radius * 2, height: radius * 2 }}
      animate={{ rotate: reverse ? [startAngle, startAngle - 360] : [startAngle, startAngle + 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-[#2a9d8f]/20 bg-white/90 shadow-sm backdrop-blur-md"
        style={{ left: radius * 2 - 20, top: radius - 20 }}
      >
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    </motion.div>
  );
}

export function OrbitingLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ minHeight: '350px' }}>
      {[70, 110, 150].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-[#2a9d8f]/20"
          style={{ width: r * 2, height: r * 2 }}
        />
      ))}

      {ICONS.map((item, i) => (
        <OrbitItem key={i} item={item} />
      ))}

      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#2a9d8f] to-[#48d1c2] shadow-[0_0_30px_rgba(42,157,143,0.4)]">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
    </div>
  );
}
