import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const orbs = [
  { color: "#7c6cff", size: 220, x: "10%", y: "20%", duration: 16 },
  { color: "#5b8cff", size: 260, x: "70%", y: "50%", duration: 20 },
  { color: "#a78bfa", size: 180, x: "40%", y: "75%", duration: 18 },
];

export function GlowOrbs({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-[#060d18]",
        className
      )}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              backgroundColor: orb.color,
              opacity: 0.15,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 25, 0],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full flex-col">
        {children}
      </div>
    </div>
  );
}
