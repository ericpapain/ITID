import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type BeamConfig = {
  side: "left" | "right";
  color: string;
  core: string;
  rotate: number;
  delay: number;
};

function Beam({ side, color, core, rotate, delay }: BeamConfig) {
  const isLeft = side === "left";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 h-[170%] w-[48%]"
      style={{
        [isLeft ? "left" : "right"]: "-14%",
        transformOrigin: "top center",
        transform: `rotate(${isLeft ? rotate : -Math.abs(rotate)}deg)`,
      }}
    >
      {/* soft ambient halo of the beam */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${color} 0%, ${color.replace(
            /[\d.]+\)$/,
            "0.08)"
          )} 42%, transparent 74%)`,
          filter: "blur(58px)",
        }}
        animate={{ opacity: [0.45, 0.9, 0.45], scaleX: [1, 1.16, 1] }}
        transition={{
          duration: 9,
          delay,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      {/* bright inner core */}
      <motion.div
        className="absolute inset-x-[34%] top-0 bottom-[18%]"
        style={{
          background: `linear-gradient(to bottom, ${core} 0%, transparent 68%)`,
          filter: "blur(26px)",
        }}
        animate={{ opacity: [0.55, 1, 0.55], scaleX: [0.9, 1.05, 0.9] }}
        transition={{
          duration: 9,
          delay,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
}

export function SpotlightNew({
  children,
  className,
  beams = [
    {
      side: "left",
      color: "rgba(124, 108, 255, 0.15)",
      core: "rgba(169, 157, 255, 0.25)",
      rotate: 24,
      delay: 0,
    },
    {
      side: "right",
      color: "rgba(91, 140, 255, 0.12)",
      core: "rgba(147, 190, 255, 0.2)",
      rotate: -24,
      delay: 1.6,
    },
  ]
}: {
  children?: ReactNode;
  className?: string;
  beams?: BeamConfig[];
}) {
  // Deterministic, seeded dust motes so a static preview still feels alive.
  const motes = useMemo(() => {
    const seeded = (i: number, n: number) => Math.abs(Math.sin((i + 1) * n));
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.round(seeded(i, 12.9898) * 96) + 2,
      top: Math.round(seeded(i, 78.233) * 62) + 4,
      size: Math.round((1 + seeded(i, 3.17) * 2) * 10) / 10,
      drift: Math.round(6 + seeded(i, 5.41) * 14),
      delay: Math.round(seeded(i, 9.7) * 60) / 10,
      duration: Math.round(7 + seeded(i, 2.13) * 6),
      opacity: Math.round((0.1 + seeded(i, 4.02) * 0.3) * 100) / 100, // Reduced opacity for light theme
    }));
  }, []);

  return (
    <div
      className={cn(
        "relative isolate h-full w-full overflow-hidden",
        className
      )}
    >
      {/* fine grid, faded toward the center top like a real hero backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(ellipse 78% 62% at 50% 0%, black 32%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 78% 62% at 50% 0%, black 32%, transparent 82%)",
        }}
      />

      {/* the two sweeping beams */}
      {beams.map((b) => (
        <Beam key={b.side} {...b} />
      ))}

      {/* warm bloom where the beams cross near the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[70%] -translate-x-1/2"
        style={{
          background:
            `radial-gradient(ellipse at center, ${beams[0].color}, transparent 68%)`,
          filter: "blur(24px)",
        }}
      />

      {/* drifting dust motes */}
      {motes.map((m) => (
        <motion.span
          key={m.id}
          aria-hidden
          className="absolute rounded-full bg-[#1a3a5c]" // Dark dots for light theme
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
          }}
          animate={{
            y: [0, m.drift, 0],
            opacity: [0, m.opacity, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}

      {/* bottom fade so the scene melts into the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.8), transparent)",
        }}
      />

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
