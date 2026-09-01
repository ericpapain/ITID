import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate, PanInfo, useAnimationFrame, AnimatePresence } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { PATHOLOGIES } from "../../data";
import { MedicalCard } from "../Cards";
import spineImg from "../../images/spine_isolated.png";

export function PathologiesPremium() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { stiffness: 50, damping: 20 });
  const items = PATHOLOGIES.slice(0, 8); // Limit to 8 for a clean circle
  const angleStep = 360 / items.length;
  const radius = 500; // Distance from center

  // Update active index based on rotation
  useEffect(() => {
    return smoothRotation.onChange((v) => {
      // Normalize rotation to 0-360
      let normalized = ((v % 360) + 360) % 360;
      // Invert because dragging right (positive) rotates carousel right, meaning item on left comes to front
      // Actually, if carousel rotates Y by +deg, it spins counter-clockwise from top.
      // Easiest is just math.round
      let idx = Math.round((360 - normalized) / angleStep) % items.length;
      if (idx < 0) idx += items.length;
      setActiveIdx(idx);
    });
  }, [smoothRotation, angleStep, items.length]);

  useAnimationFrame((t, delta) => {
    if (!isDragging) {
      // Rotation très lente et continue
      rotation.set(rotation.get() - delta * 0.005);
    }
  });

  const handleDragEnd = (e: any, info: PanInfo) => {
    // Snap to nearest item
    const velocity = info.velocity.x;
    const currentRot = rotation.get();
    
    // Add velocity for inertia
    const targetRot = currentRot + velocity * 0.1;
    const snappedRot = Math.round(targetRot / angleStep) * angleStep;
    
    rotation.set(snappedRot);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#060d18] text-white relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#48cae4]/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-30 w-full text-center">
        <div className="flex justify-between items-center mb-12">
          <TransitionLink
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}
          >
            ← Retour à l'accueil
          </TransitionLink>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#48cae4]/30 text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#48cae4] animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase">Explorateur 3D</span>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          Cartographie des <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#48cae4]">
            Pathologies
          </span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-4">Glissez de gauche à droite pour explorer le système nerveux et squelettique.</p>
      </div>

      {/* 3D Carousel Scene */}
      <div 
        className="relative flex-1 w-full flex items-center justify-center mt-10 perspective-[2000px]"
        style={{ perspective: "2000px" }}
      >
        <motion.div 
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
          drag="x"
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onTap={() => setSelectedItem(items[activeIdx])}
          onDrag={(e, info) => {
            rotation.set(rotation.get() + info.delta.x * 0.5);
          }}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            handleDragEnd(e, info);
          }}
        />

        {/* Carousel Wrapper */}
        <motion.div
          style={{ 
            rotateY: smoothRotation,
            transformStyle: "preserve-3d"
          }}
          className="relative w-full h-[500px] flex items-center justify-center pointer-events-none"
        >
          {/* Central Spine inside 3D context */}
          <motion.div 
            style={{ 
              rotateY: useTransform(smoothRotation, (v) => -v),
              transformStyle: "preserve-3d",
              translateZ: 0 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
          >
             <img 
              src={spineImg} 
              alt="Spine Hologram" 
              className="h-[800px] w-auto object-contain opacity-90"
            />
          </motion.div>
          {items.map((item, i) => {
            const angle = i * angleStep;
            
            return (
              <CarouselItem 
                key={item.title} 
                item={item} 
                angle={angle} 
                radius={radius} 
                isActive={activeIdx === i} 
                carouselRotation={smoothRotation}
                index={i}
                total={items.length}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Fullscreen Modal for selected card */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              layoutId={`card-${selectedItem.title}`}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1.05, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="w-[600px] h-[850px] max-w-[95vw] max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MedicalCard {...selectedItem} color="#4ade80" imageHeight="h-96" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant enfant pour gérer l'animation de chaque carte en fonction de sa position 3D
function CarouselItem({ item, angle, radius, isActive, carouselRotation, index, total }: any) {
  // To make cards always face forward, we counter-rotate them based on the carousel's rotation AND their own angle
  const rotateY = useTransform(carouselRotation, (v: number) => -(v + angle));
  
  // Staircase effect: distribute cards vertically based on their index
  const fixedY = (index - total / 2) * 20;
  
  // Custom scale based on depth (Z position in world space)
  // When carousel rotates by v, this item's world angle is v + angle
  const scale = useTransform(carouselRotation, (v: number) => {
    const worldAngle = ((v + angle) % 360 + 360) % 360;
    // Front is 0 or 360. Back is 180.
    let diff = Math.min(worldAngle, 360 - worldAngle); // 0 to 180
    // 0 -> scale 1.2
    // 180 -> scale 0.5
    return 1.2 - (diff / 180) * 0.7;
  });

  const opacity = useTransform(carouselRotation, (v: number) => {
    const worldAngle = ((v + angle) % 360 + 360) % 360;
    let diff = Math.min(worldAngle, 360 - worldAngle); 
    return 1 - (diff / 180) * 0.8; // 1 at front, 0.2 at back
  });

  return (
    <motion.div
      style={{
        position: "absolute",
        transformOrigin: "center center",
        transform: `rotateY(${angle}deg) translateY(${fixedY}px) translateZ(${radius}px)`,
        transformStyle: "preserve-3d",
        zIndex: isActive ? 40 : 20
      }}
      className="w-[320px] pointer-events-auto"
    >
      <motion.div style={{ rotateY, scale, opacity }} className="relative">
        <MedicalCard {...item} color="#4ade80" />
      </motion.div>
    </motion.div>
  );
}

