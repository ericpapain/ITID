import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { NoiseGradient } from "../ui/NoiseGradient";

const PROJECTS = [
  {
    title: "Cas Clinique #1",
    category: "Infiltration lombaire",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Cas Clinique #2",
    category: "Radiofréquence",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Cas Clinique #3",
    category: "Douleur pelvienne",
    image: "https://images.unsplash.com/photo-1584308666744-24d5e4b6c8eb?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Cas Clinique #4",
    category: "Bloc nerveux",
    image: "https://images.unsplash.com/photo-1576091160550-2173ff9e5953?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Innovation #5",
    category: "Réalité Virtuelle",
    image: "https://images.unsplash.com/photo-1614064641913-a5509971bc39?q=80&w=800&auto=format&fit=crop"
  }
];

function ActiveSliderCard({ item, scrollX, index }: { item: any, scrollX: any, index: number }) {
  // Parallax effect on the background image
  const parallax = useTransform(scrollX, (value: number) => {
    return (value + index * 400) * 0.15;
  });

  return (
    <div className="relative w-[300px] h-[450px] md:w-[400px] md:h-[600px] rounded-2xl overflow-hidden shrink-0 group pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] card-hover-highlight hover:shadow-[0_0_40px_rgba(72,209,194,0.5)] transition-all duration-500">
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
        <motion.img 
          src={item.image} 
          alt={item.title} 
          style={{ x: parallax }}
          className="absolute inset-0 w-[130%] h-full max-w-none object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1628]/20 to-[#0a1628]/90 group-hover:to-[#0a1628]/70 transition-colors duration-500"></div>
      </div>
      
      <div className="absolute bottom-8 left-8 right-8 z-10 pointer-events-none">
        <span className="inline-block py-1 px-3 rounded-full border border-white/20 glass text-xs font-semibold text-[#48cae4] tracking-widest uppercase mb-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {item.category}
        </span>
        <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {item.title}
        </h3>
      </div>
    </div>
  );
}

export function ProjectsMasonry() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollX = useMotionValue(0);
  const springScroll = useSpring(scrollX, { stiffness: 100, damping: 20 });
  
  // Velocity-based skew effect
  const skewX = useTransform(springScroll, (v) => {
    const vel = springScroll.getVelocity();
    return Math.max(-15, Math.min(15, vel * -0.005)) + "deg";
  });
  
  const scale = useTransform(springScroll, (v) => {
    const vel = Math.abs(springScroll.getVelocity());
    return Math.max(0.9, 1 - vel * 0.0001);
  });

  const handleDrag = (e: any, info: PanInfo) => {
    scrollX.set(scrollX.get() + info.delta.x);
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    const current = scrollX.get();
    const velocity = info.velocity.x;
    
    let target = current + velocity * 0.2; // Inertia
    // Bounds
    if (target > 0) target = 0;
    if (target < -1600) target = -1600;
    
    scrollX.set(target);
  };

  return (
    <section className="relative overflow-hidden" id="projets">
      <NoiseGradient className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9] opacity-80" />
      </NoiseGradient>
      
      <div className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10 pointer-events-none">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 glass border border-[#2a9d8f]/30 text-[#1a3a5c] pointer-events-auto shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#48cae4]"></span>
              <span className="text-xs font-bold tracking-widest uppercase">Galerie Interactive</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
              Cas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48cae4]">Cliniques</span>
            </h2>
          </div>
          <TransitionLink 
            to="/pathologies" 
            className="text-[#2a9d8f] hover:text-[#1a3a5c] transition-colors font-medium text-lg interactive inline-flex items-center gap-2 pointer-events-auto"
          >
            Découvrir plus <span className="text-2xl">→</span>
          </TransitionLink>
        </div>

        <div className="relative w-full h-[500px] md:h-[650px]" ref={containerRef}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03] pointer-events-none text-[10rem] md:text-[15rem] font-bold text-[#1a3a5c] tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
            DRAG
          </div>

          <motion.div
            drag="x"
            dragElastic={0.1}
            dragConstraints={{ left: -1600, right: 0 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: springScroll }}
            className="absolute left-[10%] top-0 flex gap-8 cursor-grab active:cursor-grabbing z-10 px-10"
          >
            {PROJECTS.map((item, idx) => (
              <motion.div key={idx} style={{ skewX, scale }} className="pointer-events-none">
                <ActiveSliderCard item={item} scrollX={springScroll} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
