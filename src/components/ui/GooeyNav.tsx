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
import { useTransitionStore } from "../../store/transitionStore";

export type GooeyNavItem = { 
  id?: string;
  label: string; 
  href?: string; 
  onClick?: () => void;
  width?: number;
};

const DEFAULT_ITEM_WIDTHS: Record<string, number> = {
  "nav.home": 82,
  "/": 82,
  "nav.pathologies": 112,
  "/pathologies": 112,
  "nav.treatments": 112,
  "/traitements": 112,
  "nav.training": 104,
  "/formations": 104,
  "nav.ai": 204,
  "/ia": 204,
  "nav.about": 134,
  "/a-propos": 134,
  "nav.contact": 128,
  "contact": 128,
  "nav.news": 98,
  "/actualites": 98,
};

type Pos = { x: number; width: number };

const LEAD_SPRING = { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.22 } as const;
const TRAIL_SPRING = { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.28 } as const;

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
  
  const location = useLocation();
  const navigate = useNavigate();

  // Instant effective path
  const currentPath = location.pathname;

  // Active index state: ONLY updates when target index changes to prevent double-animation / back-and-forth jumps
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const initialPath = location.pathname;
    const idx = items.findIndex((l) => {
      if (!l.href) return false;
      const targetPath = l.href.split('#')[0];
      return targetPath === initialPath || (targetPath === '/' && initialPath === '/');
    });
    return idx !== -1 ? idx : 0;
  });

  useEffect(() => {
    const idx = items.findIndex((l) => {
      if (!l.href) return false;
      const targetPath = l.href.split('#')[0];
      return targetPath === currentPath || (targetPath === '/' && currentPath === '/');
    });
    if (idx !== -1 && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }, [currentPath, items, activeIndex]);

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

  const pos = positions[activeIndex] ?? { x: 0, width: 0 };

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
            const isActive = i === activeIndex;
            const itemWidth = item.width || (item.id && DEFAULT_ITEM_WIDTHS[item.id]) || (item.href && DEFAULT_ITEM_WIDTHS[item.href]);
            const itemKey = item.id || item.href || i;

            return (
              <li 
                key={itemKey}
                style={itemWidth ? { width: `${itemWidth}px` } : undefined}
                className="flex-shrink-0 flex items-stretch justify-center"
              >
                <button
                  type="button"
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.href) {
                      const targetPath = item.href.split('#')[0];
                      if (location.pathname !== targetPath) {
                        navigate(item.href);
                        window.scrollTo(0, 0);
                      } else {
                        window.scrollTo(0, 0);
                      }
                    }
                  }}
                  aria-current={isActive ? "page" : undefined}
                  style={itemWidth ? { width: `${itemWidth}px` } : undefined}
                  className={`relative w-full whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] font-semibold transition-colors duration-300 outline-none flex items-center justify-center text-center focus-visible:ring-2 focus-visible:ring-white/40 ${isActive ? "text-white" : "text-[#8fb3d0] hover:text-white"}`}
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
