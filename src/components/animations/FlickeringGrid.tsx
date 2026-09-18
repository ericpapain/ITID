"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 42, g: 157, b: 143 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function FlickeringGrid({
  squareSize = 3,
  gridGap = 6,
  colors = ["#2a9d8f", "#48cae4"],
  maxOpacity = 0.65,
  className,
}: {
  squareSize?: number;
  gridGap?: number;
  colors?: string[];
  maxOpacity?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorKey = colors.join("|");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = colorKey.split("|").map(hexToRgb);
    const c0 = palette[0];
    const c1 = palette[palette.length - 1];

    const TAU = Math.PI * 2;
    const frac = (x: number) => x - Math.floor(x);
    const hash = (n: number) => frac(Math.sin(n) * 43758.5453123);

    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cells = new Float32Array(0);
    const pitch = squareSize + gridGap;

    const setup = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      cols = Math.ceil(w / pitch) + 1;
      rows = Math.ceil(h / pitch) + 1;
      const count = cols * rows;
      cells = new Float32Array(count * 5);
      for (let i = 0; i < count; i++) {
        const a = hash(i * 12.9898 + 4.13);
        const b = hash(i * 78.233 + 2.71);
        const c = hash(i * 39.425 + 9.31);
        const d = hash(i * 15.147 + 1.37);
        const e = hash(i * 51.617 + 6.19);
        const o = i * 5;
        cells[o] = Math.pow(a, 2.0); // Slightly brighter ceiling
        cells[o + 1] = b * TAU;
        cells[o + 2] = 0.22 + c * 0.7;
        cells[o + 3] = d * TAU;
        cells[o + 4] = e;
      }
    };

    let raf = 0;
    const start = typeof performance !== "undefined" ? performance.now() : 0;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sq = Math.max(1, Math.round(squareSize * dpr));
      const step = pitch * dpr;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const o = (y * cols + x) * 5;
          const ceiling = cells[o];
          const breathe = 0.5 + 0.5 * Math.sin(t * cells[o + 2] + cells[o + 1]);
          const spark = Math.pow(
            0.5 + 0.5 * Math.sin(t * 1.9 + cells[o + 3]),
            8
          );
          const op = ceiling * maxOpacity * (0.2 + 0.5 * breathe + 0.5 * spark);
          if (op < 0.01) continue;

          const mix = cells[o + 4];
          const r = Math.round(c0.r + (c1.r - c0.r) * mix);
          const g = Math.round(c0.g + (c1.g - c0.g) * mix);
          const b = Math.round(c0.b + (c1.b - c0.b) * mix);
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(op, 1).toFixed(3)})`;
          ctx.fillRect(Math.round(x * step), Math.round(y * step), sq, sq);
        }
      }
      if (isVisible) {
        raf = requestAnimationFrame(draw);
      }
    };

    let isVisible = true;
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.05 });
    io.observe(canvas);

    setup();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => setup());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [squareSize, gridGap, maxOpacity, colorKey]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 85% at 50% 46%, #000 0%, #000 40%, rgba(0,0,0,0.5) 75%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 85% at 50% 46%, #000 0%, #000 40%, rgba(0,0,0,0.5) 75%, transparent 95%)",
        }}
      />
    </div>
  );
}
