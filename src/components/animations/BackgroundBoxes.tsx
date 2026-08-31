"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

function seed(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function r(n: number): number {
  return Math.round(n * 1000) / 1000;
}

const FLASH_COLORS = [
  "rgba(42, 157, 143, 0.55)", // brand teal
  "rgba(72, 209, 194, 0.50)", // glow teal
  "rgba(255, 255, 255, 0.2)", // white soft
];

type BackgroundBoxesProps = {
  className?: string;
  children?: React.ReactNode;
  rows?: number;
  cols?: number;
  cellSize?: number;
  idleSparks?: number;
};

export function BackgroundBoxes({
  className,
  children,
  rows = 12,
  cols = 20,
  cellSize = 56,
  idleSparks = 20,
}: BackgroundBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [tracking, setTracking] = useState(false);

  const width = cols * cellSize;
  const height = rows * cellSize;

  const cells = useMemo(
    () =>
      Array.from({ length: rows * cols }, (_, i) => ({
        key: i,
        flash: FLASH_COLORS[Math.floor(seed(i * 1.37 + 4.2) * FLASH_COLORS.length)],
      })),
    [rows, cols]
  );

  const sparks = useMemo(
    () =>
      Array.from({ length: idleSparks }, (_, i) => {
        const col = Math.floor(seed(i * 2.11 + 1.3) * cols);
        const row = Math.floor(seed(i * 3.07 + 5.9) * rows);
        return {
          key: i,
          left: r(col * cellSize),
          top: r(row * cellSize),
          duration: r(3.4 + seed(i * 1.9 + 0.5) * 3.6),
          delay: r(seed(i * 4.4 + 2.7) * 5),
          color: FLASH_COLORS[Math.floor(seed(i * 5.3 + 8.1) * FLASH_COLORS.length)],
        };
      }),
    [idleSparks, rows, cols, cellSize]
  );

  const spotlight = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(42, 157, 143, 0.16), transparent 72%)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setTracking(true)}
      onMouseLeave={() => {
        setTracking(false);
        mouseX.set(-1000);
        mouseY.set(-1000);
      }}
      className={`relative isolate h-full w-full overflow-hidden bg-[#0a1628] ${className || ""}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(42,157,143,0.15), transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [-40, 30, -40], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(72,209,194,0.12), transparent 70%)" }}
        animate={{ x: [0, -50, 0], y: [30, -20, 30], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: "translate(-50%, -50%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 62% at 50% 50%, #000 30%, transparent 78%)",
          maskImage:
            "radial-gradient(ellipse 62% 62% at 50% 50%, #000 30%, transparent 78%)",
        }}
      >
        <div
          className="pointer-events-auto grid h-full w-full border-l border-t border-white/[0.05]"
          style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
        >
          {cells.map((cell) => (
            <motion.div
              key={cell.key}
              className="border-b border-r border-white/[0.05]"
              style={{ height: cellSize }}
              initial={false}
              whileHover={{
                backgroundColor: cell.flash,
                transition: { duration: 0 },
              }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>

        {sparks.map((s) => (
          <motion.div
            key={s.key}
            className="pointer-events-none absolute rounded-[3px]"
            style={{
              left: s.left,
              top: s.top,
              width: cellSize,
              height: cellSize,
              backgroundColor: s.color,
              boxShadow: `0 0 24px ${s.color}`,
            }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.7, 1, 0.7] }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="absolute inset-0"
          style={{ background: spotlight, opacity: tracking ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 40%, #0a1628 100%)",
        }}
      />

      {children ? (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      ) : null}
    </div>
  );
}
