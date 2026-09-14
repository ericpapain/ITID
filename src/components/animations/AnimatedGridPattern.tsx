"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const seededRand = (i: number) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;

export function AnimatedGridPattern({
  className,
  cols = 18,
  rows = 10,
  litCount = 16,
}: {
  className?: string;
  cols?: number;
  rows?: number;
  litCount?: number;
}) {
  const cells = useMemo(() => {
    const total = cols * rows;
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      x: i % cols,
      y: Math.floor(i / cols),
    }));
  }, [cols, rows]);

  const litCells = useMemo(() => {
    const total = cols * rows;
    const picks: { id: number; delay: number; duration: number }[] = [];
    for (let i = 0; i < litCount; i++) {
      const id = Math.floor(seededRand(i * 7 + 3) * total);
      picks.push({
        id,
        delay: seededRand(i * 13 + 1) * 3,
        duration: 1.8 + seededRand(i * 17 + 5) * 2,
      });
    }
    return picks;
  }, [cols, rows, litCount]);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0",
        className
      )}
    >
      {/* Background ambient light overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(42, 157, 143, 0.18) 0%, rgba(12, 26, 46, 0.92) 80%)"
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)",
        }}
      >
        <svg className="h-full w-full" preserveAspectRatio="none">
          {cells.map((c) => (
            <rect
              key={c.id}
              x={`${(c.x / cols) * 100}%`}
              y={`${(c.y / rows) * 100}%`}
              width={`${100 / cols}%`}
              height={`${100 / rows}%`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={1}
            />
          ))}
          {litCells.map((lc, i) => {
            const c = cells[lc.id];
            if (!c) return null;
            return (
              <motion.rect
                key={`lit-${i}`}
                x={`${(c.x / cols) * 100}%`}
                y={`${(c.y / rows) * 100}%`}
                width={`${100 / cols}%`}
                height={`${100 / rows}%`}
                fill="rgba(72, 202, 228, 0.55)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0] }}
                transition={{
                  duration: lc.duration,
                  delay: lc.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
