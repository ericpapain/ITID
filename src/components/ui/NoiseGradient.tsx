import { useId } from "react";

export function NoiseGradient({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const filterId = useId();

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 0%, rgba(255,255,255,0.85), transparent 70%), radial-gradient(ellipse 80% 80% at 50% 100%, rgba(240,247,246,0.6), transparent 70%), #e2eaec",
        }}
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25] mix-blend-overlay">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div className="relative z-10 flex h-full w-full flex-col">
        {children}
      </div>
    </div>
  );
}
