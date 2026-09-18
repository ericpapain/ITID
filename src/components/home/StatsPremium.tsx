import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function AnimatedCounter({ from = 0, to, duration = 2, suffix = "" }: { from?: number; to: number; duration?: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsPremium() {
  const { t } = useTranslation();
  const stats = [
    { value: 5000, suffix: "+", label: t('stats.patients') },
    { value: 15, suffix: "", label: t('stats.specialists') },
    { value: 98, suffix: "%", label: t('stats.satisfaction') },
    { value: 10, suffix: "+", label: t('stats.protocols') },
  ];

  return (
    <section className="py-24 bg-[#f7f4ef] relative border-y border-[#d8d2c8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 md:gap-8 md:divide-x md:divide-[#d8d2c8]/50">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center px-4 group"
            >
              <div className="text-5xl md:text-6xl font-bold text-[#1a3a5c] mb-2 font-display group-hover:scale-110 transition-transform duration-300 transform-gpu" style={{ fontFamily: "var(--font-display)" }}>
                <AnimatedCounter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold text-[#6b7c93] uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
