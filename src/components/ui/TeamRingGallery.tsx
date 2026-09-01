import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightNew } from "./SpotlightNew";
import { CardFlip } from "./CardFlip";
import { ArrowRight } from "lucide-react";

function TeamFrontFace({ role, category, icon, img }: any) {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <img src={img} alt={role} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] via-[#0c1a2e]/60 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl backdrop-blur-md">
              {icon}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/90 drop-shadow-md">
              {category}
            </span>
          </div>
        </div>

        <div className="mt-auto mb-6">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
            {role}
          </h3>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm font-medium text-[#48cae4] bg-[#48cae4]/10 px-4 py-2 rounded-full backdrop-blur-sm border border-[#48cae4]/30">
            Cliquer pour les détails
            <ArrowRight size={15} strokeWidth={2} />
          </div>
        </div>
      </div>
    </>
  );
}

function TeamBackFace({ detail }: any) {
  return (
    <>
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-[#48cae4]">
          Informations
        </h3>
        <p className="mt-3 text-[15px] text-gray-300 leading-relaxed">
          {detail}
        </p>
      </div>

      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#48cae4]/20 border border-[#48cae4]/50 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(72,202,228,0.3)] transition-colors duration-200 hover:bg-[#48cae4]/40"
      >
        Prendre rendez-vous
        <ArrowRight size={15} strokeWidth={2.25} />
      </button>
    </>
  );
}

interface Role {
  category?: string;
  role: string;
  detail: string;
  icon: string;
  img: string;
}

export function TeamRingGallery({ roles, categoryTitle }: { roles: Role[], categoryTitle: string }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const angleStep = 360 / Math.max(roles.length, 1);
  // Dynamically calculate radius so cards don't overlap too much
  const radius = Math.max(400, (roles.length * 400) / (2 * Math.PI));

  const rotate = (direction: number) => {
    const next = rotation + direction * angleStep;

    gsap.to(ringRef.current, {
      rotateY: next,
      duration: 1,
      ease: "power3.out",
      overwrite: true // Stops the infinite rotation if user clicks
    });

    setRotation(next);
  };

  useEffect(() => {
    if (!ringRef.current) return;

    // Auto-rotation
    const tween = gsap.to(ringRef.current, {
      rotateY: "+=360",
      duration: 40,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, []);

  if (roles.length === 0) return null;

  let beams = [];
  if (categoryTitle.includes("Médicale")) {
    beams = [
      { side: "left", color: "rgba(42, 157, 143, 0.2)", core: "rgba(42, 157, 143, 0.4)", rotate: 24, delay: 0 },
      { side: "right", color: "rgba(38, 70, 83, 0.15)", core: "rgba(38, 70, 83, 0.3)", rotate: -24, delay: 1.6 },
    ];
  } else if (categoryTitle.includes("Paramédicale")) {
    beams = [
      { side: "left", color: "rgba(233, 196, 106, 0.2)", core: "rgba(233, 196, 106, 0.4)", rotate: 24, delay: 0 },
      { side: "right", color: "rgba(244, 162, 97, 0.15)", core: "rgba(244, 162, 97, 0.3)", rotate: -24, delay: 1.6 },
    ];
  } else {
    beams = [
      { side: "left", color: "rgba(231, 111, 81, 0.15)", core: "rgba(231, 111, 81, 0.3)", rotate: 24, delay: 0 },
      { side: "right", color: "rgba(42, 157, 143, 0.15)", core: "rgba(42, 157, 143, 0.3)", rotate: -24, delay: 1.6 },
    ];
  }

  return (
    <>
      <SpotlightNew beams={beams as any} className="relative w-full flex flex-col items-center justify-center my-12 py-10">
        <div className="w-full flex flex-col items-center justify-center" style={{ perspective: "1400px" }}>
          <div className="mb-12 text-center z-20 relative">
            <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
              {categoryTitle}
            </h3>
            <p className="text-[#6b7c93] text-sm uppercase tracking-widest font-bold">Faites glisser ou utilisez les flèches</p>
          </div>

          <div
            className="relative w-full max-w-[900px] h-[500px] mt-8"
          >
            <div
              ref={ringRef}
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {roles.map((item, index) => {
                const angle = index * angleStep;
                const bgGradient = index % 2 === 0 
                  ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" 
                  : "linear-gradient(135deg, #0b1120 0%, #1c2438 100%)";

                return (
                  <div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px) translate(-50%, -50%)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      onClick={() => setSelectedRole(item)}
                      className={`
                    w-[320px] h-[480px] rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-2 border-white/20 hover:border-[#48cae4]
                    flex flex-col items-center justify-end relative overflow-hidden group transition-all duration-500 hover:shadow-[#48cae4]/30 cursor-pointer
                  `}
                      style={{
                        background: bgGradient,
                        WebkitBoxReflect: "below 10px linear-gradient(transparent 60%, rgba(0,0,0,0.2))"
                      }}
                    >
                      <div className="absolute left-0 bottom-0 w-[120%] h-[110%] opacity-90 group-hover:opacity-100 transition-all duration-700 -ml-4 group-hover:scale-105" style={{ transformOrigin: "bottom left" }}>
                        <img src={item.img} alt="Doctor" className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                      </div>
                      
                      {/* Decorative glowing orb behind the doctor */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#48cae4]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                      <div className="relative z-10 flex flex-col items-center py-5 px-6 text-center w-full bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                        <h4 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide" style={{ fontFamily: "var(--font-display)" }}>{item.role}</h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-6 mt-12 z-20 relative">
            <button
              onClick={() => rotate(1)}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg text-[#f8fafc] hover:text-[#2a9d8f] hover:scale-110 transition-all text-xl"
            >
              ←
            </button>
            <button
              onClick={() => rotate(-1)}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg text-[#f8fafc] hover:text-[#2a9d8f] hover:scale-110 transition-all text-xl"
            >
              →
            </button>
          </div>
        </div>
      </SpotlightNew>

      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f2440]/80 backdrop-blur-sm"
              onClick={() => setSelectedRole(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedRole(null)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-colors backdrop-blur-md border border-white/20"
              >
                ✕
              </button>
              <CardFlip 
                className="w-full h-[500px] sm:w-[400px]" 
                front={<TeamFrontFace role={selectedRole.role} category={categoryTitle} icon={selectedRole.icon} img={selectedRole.img} />} 
                back={<TeamBackFace detail={selectedRole.detail} />} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

