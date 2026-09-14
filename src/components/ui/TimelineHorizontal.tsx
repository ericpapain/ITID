"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

export interface Milestone {
  date: string;
  title: string;
  description: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    date: "Étape 1",
    title: "Orientation médicale",
    description: "Votre médecin traitant, un spécialiste ou un service hospitalier adresse une demande de prise en charge à l’ITID.",
  },
  {
    date: "Étape 2",
    title: "Consultation d’évaluation",
    description: "Un médecin algologue analyse votre situation, retrace l’histoire de votre douleur et étudie les examens déjà réalisés.",
  },
  {
    date: "Étape 3",
    title: "Plan de traitement personnalisé",
    description: "Une stratégie thérapeutique adaptée est construite avec vous : infiltrations, perfusions, neuromodulation, cryoneurolyse et approches complémentaires.",
  },
  {
    date: "Étape 4",
    title: "Suivi et réévaluation",
    description: "Les résultats sont régulièrement évalués afin d’adapter les traitements et maintenir la coordination avec vos différents médecins.",
  },
];

// Layout constants (percent along the track).
const PAD_START = 14;
const PAD_END = 86;
const HEAD_START = 6;
const HEAD_END = 94;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const r2 = (n: number) => Math.round(n * 100) / 100;
const smoothstep = (x: number) => x * x * (3 - 2 * x);

export function TimelineHorizontal({
  milestones = DEFAULT_MILESTONES,
  className,
}: {
  milestones?: Milestone[];
  className?: string;
}) {
  const count = milestones.length;

  const positions = useMemo(() => {
    if (count <= 1) return milestones.map(() => (PAD_START + PAD_END) / 2);
    return milestones.map((_, i) =>
      r2(PAD_START + (PAD_END - PAD_START) * (i / (count - 1)))
    );
  }, [milestones, count]);

  // head: 0..1 progress along the travel range. lit: 0..1 opacity of the sweep.
  const head = useMotionValue(0);
  const lit = useMotionValue(0);
  const headPct = useTransform(head, (v) =>
    r2(HEAD_START + (HEAD_END - HEAD_START) * v)
  );
  const headStr = useTransform(headPct, (p) => `${p}%`);

  const [activeCount, setActiveCount] = useState(0);
  const lastActive = useRef(-1);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const SWEEP = 6000;
    const HOLD = 1500;
    const FADE = 850;
    const GAP = 550;
    const TOTAL = SWEEP + HOLD + FADE + GAP;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) % TOTAL;

      let p: number;
      let l: number;
      if (t < SWEEP) {
        p = smoothstep(t / SWEEP);
        l = Math.min(1, t / 450);
      } else if (t < SWEEP + HOLD) {
        p = 1;
        l = 1;
      } else if (t < SWEEP + HOLD + FADE) {
        p = 1;
        l = 1 - (t - SWEEP - HOLD) / FADE;
      } else {
        p = 0;
        l = 0;
      }

      head.set(p);
      lit.set(l);

      const reach = HEAD_START + (HEAD_END - HEAD_START) * p;
      let c = 0;
      for (const pos of positions) if (pos <= reach) c++;
      if (c !== lastActive.current) {
        lastActive.current = c;
        setActiveCount(c);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positions, head, lit]);

  return (
    <div className={cn("relative h-[550px] md:h-[400px] w-full", className)}>
          {/* Track + progress fill (masked at the ends) */}
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            }}
          >
            <div className="absolute inset-0 bg-gray-200" />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: headStr,
                opacity: lit,
                background:
                  "linear-gradient(to right, rgba(42,157,143,0.15), #2a9d8f 60%, #48d1c2)",
                boxShadow: "0 0 12px rgba(72,209,194,0.55)",
              }}
            />
          </div>

          {/* Comet head */}
          <motion.div
            className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: headStr, opacity: lit }}
          >
            <motion.span
              className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(72,209,194,0.55), transparent 70%)",
              }}
              animate={{ scale: [1, 2.1], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span
              className="block h-3 w-3 rounded-full bg-white"
              style={{ boxShadow: "0 0 10px 2px rgba(42,157,143,0.6)" }}
            />
          </motion.div>

          {/* Milestones */}
          {milestones.map((m, i) => {
            const side: "top" | "bottom" = i % 2 === 0 ? "top" : "bottom";
            const active = i < activeCount;
            return (
              <Node
                key={m.date + m.title}
                milestone={m}
                left={positions[i]}
                side={side}
                active={active}
              />
            );
          })}
    </div>
  );
}

function Node({
  milestone,
  left,
  side,
  active,
}: {
  milestone: Milestone;
  left: number;
  side: "top" | "bottom";
  active: boolean;
}) {
  const isTop = side === "top";
  return (
    <>
      {/* Card */}
      <div
        className="absolute z-10 w-[200px] md:w-[220px] -translate-x-1/2"
        style={
          isTop
            ? { left: `${left}%`, bottom: "calc(50% + 28px)" }
            : { left: `${left}%`, top: "calc(50% + 28px)" }
        }
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 p-4 backdrop-blur-md"
          initial={false}
          animate={{
            y: active ? (isTop ? -10 : 10) : 0,
            borderColor: active
              ? "rgba(42,157,143,0.5)"
              : "rgba(0,0,0,0.05)",
            backgroundColor: active
              ? "rgba(255,255,255,1)"
              : "rgba(255,255,255,0.65)",
            boxShadow: active
              ? "0 25px 50px -12px rgba(42,157,143,0.4), 0 0 30px rgba(42,157,143,0.2)"
              : "0 4px 12px rgba(0,0,0,0.02)",
          }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <motion.span
            className="absolute inset-x-3 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#2a9d8f] to-transparent"
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
          <span
            className={cn(
              "block text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-500",
              active ? "text-[#2a9d8f]" : "text-gray-400"
            )}
          >
            {milestone.date}
          </span>
          <span
            className={cn(
              "mt-1.5 block text-[14px] font-semibold leading-tight transition-colors duration-500",
              active ? "text-[#1a3a5c]" : "text-gray-500"
            )}
          >
            {milestone.title}
          </span>
          <span
            className={cn(
              "mt-2 block text-[12px] leading-relaxed transition-colors duration-500",
              active ? "text-gray-600" : "text-gray-400"
            )}
          >
            {milestone.description}
          </span>
        </motion.div>
      </div>

      {/* Connector */}
      <motion.div
        className="absolute z-0 w-px -translate-x-1/2"
        style={
          isTop
            ? { left: `${left}%`, bottom: "50%", height: "28px" }
            : { left: `${left}%`, top: "50%", height: "28px" }
        }
        initial={false}
        animate={{
          backgroundColor: active
            ? "rgba(42,157,143,0.4)"
            : "rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      />

      {/* Dot */}
      <div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${left}%` }}
      >
        {active && (
          <motion.span
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "rgba(72,209,194,0.35)" }}
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.div
          className="relative flex h-4 w-4 items-center justify-center rounded-full border-2"
          initial={false}
          animate={{
            borderColor: active
              ? "rgba(42,157,143,0.9)"
              : "rgba(226,224,218,1)",
            backgroundColor: active ? "#2a9d8f" : "#fdfdfc",
            boxShadow: active
              ? "0 0 10px 1px rgba(72,209,194,0.4)"
              : "0 0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-white"
            initial={false}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          />
        </motion.div>
      </div>
    </>
  );
}
