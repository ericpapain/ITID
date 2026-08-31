"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export type GooeyNavItem = { label: string; href?: string; onClick?: () => void };

type Pos = { x: number; width: number };

const LEAD_SPRING = { type: "spring", stiffness: 320, damping: 30, mass: 1 } as const;
const TRAIL_SPRING = { type: "spring", stiffness: 120, damping: 17, mass: 1.1 } as const;

export function GooeyNav({
  items,
  className,
}: {
  items: GooeyNavItem[];
  className?: string;
}) {
  const rawId = useId();
  const gooId = `goo-${rawId.replace(/:/g, "")}`;

  const gooRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [positions, setPositions] = useState<Pos[]>([]);
  const [ready, setReady] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active index based on route
  const active = Math.max(
    0,
    items.findIndex((l) => l.href && (l.href === location.pathname || (l.href === '/' && location.pathname === '/' && !location.hash)))
  );

  const measure = useCallback(() => {
    const base = gooRef.current;
    if (!base) return;
    const b = base.getBoundingClientRect();
    const next: Pos[] = itemRefs.current.map((el) => {
      if (!el) return { x: 0, width: 0 };
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left - b.left), width: Math.round(r.width) };
    });
    setPositions(next);
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, items]);

  useEffect(() => {
    measure();
    const base = gooRef.current;
    if (!base) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(base);
    window.addEventListener("resize", measure);
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const pos = positions[active] ?? { x: 0, width: 0 };

  return (
    <div className={`relative ${className || ""}`}>
      <svg
        aria-hidden
        width="0"
        height="0"
        className="absolute"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id={gooId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="relative isolate inline-flex rounded-full border border-white/10 bg-[#0f2440]/80 p-1.5 shadow-xl backdrop-blur-md"
      >
        <div
          ref={gooRef}
          className="pointer-events-none absolute inset-1.5 overflow-hidden rounded-full"
          style={{ filter: `url(#${gooId})` }}
        >
          {ready && (
            <>
              <motion.div
                className="absolute top-0 h-full rounded-full"
                initial={false}
                animate={{ x: pos.x, width: pos.width }}
                transition={TRAIL_SPRING}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(42,157,143,0.95), rgba(72,209,194,0.95))",
                }}
              />
              <motion.div
                className="absolute top-0 h-full rounded-full"
                initial={false}
                animate={{ x: pos.x, width: pos.width }}
                transition={LEAD_SPRING}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(42,157,143,0.95), rgba(72,209,194,0.95))",
                }}
              />
            </>
          )}
        </div>

        <div className="pointer-events-none absolute inset-1.5">
          {ready && (
            <motion.div
              className="absolute top-0 h-full rounded-full"
              initial={false}
              animate={{ x: pos.x, width: pos.width }}
              transition={LEAD_SPRING}
              style={{
                background:
                  "linear-gradient(135deg, #2a9d8f 0%, #48d1c2 100%)",
                borderTop: "1px solid rgba(255,255,255,0.35)",
                boxShadow:
                  "0 0 0 1px rgba(42,157,143,0.35), 0 8px 24px -6px rgba(42,157,143,0.6), 0 2px 8px -2px rgba(72,209,194,0.5)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.22), transparent 55%)",
                }}
              />
            </motion.div>
          )}
        </div>

        <ul className="relative z-10 flex items-stretch">
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.href) {
                      if (item.href === '/') { window.scrollTo(0, 0); }
                      navigate(item.href);
                    }
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${isActive ? "text-white" : "text-[#8fb3d0] hover:text-white"}`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
