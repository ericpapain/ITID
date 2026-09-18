"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export type FocusCardItem = {
  title: string;
  meta: string;
  tag: string;
  gradient?: string;
  img?: string;
  orbA?: string;
  orbB?: string;
};

function FocusCard({
  item,
  index,
  isFocused,
  onFocus,
  onClick,
  className,
}: {
  item: FocusCardItem;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
  onClick?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const orbAColor = item.orbA || "rgba(42,157,143,0.6)";
  const orbBColor = item.orbB || "rgba(72,209,194,0.45)";
  const bgStyle = item.img
    ? undefined
    : item.gradient ||
      "radial-gradient(130% 130% at 22% 12%, #1a3a5c 0%, #0c1a2e 50%, #060d18 100%)";

  return (
    <motion.button
      type="button"
      aria-label={item.title}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onClick}
      initial={false}
      animate={{
        scale: isFocused ? 1 : 0.965,
        opacity: isFocused ? 1 : 0.65,
        boxShadow: isFocused
          ? "0 24px 60px -24px rgba(42,157,143,0.55)"
          : "0 0px 0px 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "group relative h-[360px] md:h-[420px] w-full overflow-hidden rounded-3xl border border-white/15 text-left outline-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-[#2a9d8f]/70",
        className
      )}
    >
      {/* Blurred imagery layer, sharp only when focused */}
      <motion.span
        aria-hidden
        className="absolute inset-0 block overflow-hidden rounded-3xl"
        style={{ background: bgStyle }}
        initial={false}
        animate={{ filter: isFocused ? "blur(0px)" : "blur(4px)" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {item.img && (
          <img
            src={item.img}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <motion.span
          className="absolute -left-8 -top-10 h-44 w-44 rounded-full blur-2xl pointer-events-none"
          style={{ background: orbAColor }}
          animate={{ x: [0, 20, 0], y: [0, 16, 0] }}
          transition={{
            duration: 9 + index,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className="absolute -right-10 bottom-8 h-40 w-40 rounded-full blur-2xl pointer-events-none"
          style={{ background: orbBColor }}
          animate={{ x: [0, -16, 0], y: [0, -20, 0] }}
          transition={{
            duration: 11 + index,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#060d18] via-[#0c1a2e]/60 to-transparent" />
        <span
          className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
      </motion.span>

      {/* Highlight ring for focused card */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        initial={false}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{ boxShadow: "inset 0 0 0 2px rgba(72,209,194,0.4)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
        <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#48cae4] backdrop-blur-md">
          {item.tag}
        </span>

        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md leading-snug mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {item.title}
          </h3>
          <motion.div
            initial={false}
            animate={{
              opacity: isFocused ? 1 : 0,
              y: isFocused ? 0 : 8,
            }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-3 flex flex-col gap-4"
          >
            <p className="text-sm text-gray-200 leading-relaxed font-light">{item.meta}</p>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#2a9d8f] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all group-hover:bg-[#21867a] group-hover:translate-x-1">
              {t('common.learnMore')}
              <ArrowRight className="h-4 w-4" />
            </span>
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}

export function FocusCards({
  items,
  autoCycleMs = 2800,
  onItemClick,
  className,
}: {
  items: FocusCardItem[];
  autoCycleMs?: number;
  onItemClick?: (item: FocusCardItem, index: number) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);

  useEffect(() => {
    if (hovered !== null || items.length <= 1) return;
    const id = window.setInterval(() => {
      setAuto((i) => (i + 1) % items.length);
    }, autoCycleMs);
    return () => window.clearInterval(id);
  }, [hovered, items.length, autoCycleMs]);

  const focused = hovered ?? auto;

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
        className
      )}
    >
      {items.map((item, i) => (
        <FocusCard
          key={item.title}
          item={item}
          index={i}
          isFocused={i === focused}
          onFocus={() => setHovered(i)}
          onClick={() => onItemClick?.(item, i)}
        />
      ))}
    </div>
  );
}
