"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function AuroraBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#060d18]",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-[10%] opacity-40 blur-3xl"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, rgba(42,157,143,0.4) 0%, rgba(91,140,255,0.35) 12%, transparent 22%, rgba(124,108,255,0.35) 32%, transparent 44%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(42,157,143,0.18), transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
