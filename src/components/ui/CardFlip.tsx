import React, { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Face: one glossy side of the card. backface-hidden so only the      */
/* forward-facing side is ever visible during the flip.                */
/* ------------------------------------------------------------------ */
export function Face({
  children,
  back = false,
  className,
}: {
  children: React.ReactNode;
  back?: boolean;
  className?: string;
}) {
  return (
    <div
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
      className={cn(
        "absolute inset-0 flex flex-col overflow-hidden rounded-[26px] border border-white/10",
        back ? "bg-gradient-to-br from-[#2a5080] to-[#1a3a5c]" : "bg-[#0c1a2e]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_50px_-24px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      {/* bright top edge (the glossy rim) */}
      <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      {/* soft ambient bloom behind the content */}
      <div
        className={cn(
          "pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl",
          back ? "bg-[#48cae4]/20" : "bg-blue-500/20"
        )}
      />
      {/* slow travelling sheen, keeps the surface alive at rest */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.07) 46%, transparent 62%)",
        }}
        animate={{ x: ["-130%", "130%"] }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.6,
        }}
      />
      <div className="relative z-10 flex h-full flex-col p-6">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CardFlip: reusable 3D flip primitive. Flips on hover; an optional    */
/* `flipped` prop lets a parent drive it (used by the demo loop). A     */
/* gentle pointer-tracked tilt gives it a tactile, physical feel.       */
/* ------------------------------------------------------------------ */
export function CardFlip({
  front,
  back,
  flipped,
  className,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);
  const active = clicked || Boolean(flipped);

  const tiltX = useSpring(0, { stiffness: 140, damping: 16 });
  const tiltY = useSpring(0, { stiffness: 140, damping: 16 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 9);
    tiltX.set(-py * 9);
  }

  function onMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <div
      ref={ref}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("a, button, input, textarea, select, [role='button']")) {
          return;
        }
        setClicked(!clicked);
      }}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      className={cn("group relative cursor-pointer card-hover-highlight", className)}
      style={{ perspective: 1600 }}
    >
      {/* ambient glow that lifts when the card is engaged */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[34px] bg-[#48cae4]/10 blur-2xl"
        animate={{ opacity: active ? 0.85 : 0.35 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      {/* tilt layer */}
      <motion.div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          rotateX: tiltX,
          rotateY: tiltY,
        }}
      >
        {/* flip layer */}
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: active ? 180 : 0 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <Face>{front}</Face>
          <Face back>{back}</Face>
        </motion.div>
      </motion.div>
    </div>
  );
}
