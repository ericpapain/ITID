import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate, PanInfo, useAnimationFrame, AnimatePresence } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import { PATHOLOGIES } from "../../data";
import { MedicalCard } from "../Cards";
import { ContentNavigator } from "../ui/ContentNavigator";
import spineImg from "../../images/spine_isolated.png";
import bgVideo from "../../images/pathologie-2.mp4";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../hooks/useIsMobile";

export function PathologiesPremium() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { stiffness: 50, damping: 20 });
  const items = PATHOLOGIES.map(item => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc)
  }));
  const angleStep = 360 / items.length;
  const radius = isMobile ? 240 : 500; // Distance from center

  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isMobile]);

  // Update active index based on rotation (only when index actually changes)
  useEffect(() => {
    return smoothRotation.on("change", (v) => {
      let normalized = ((v % 360) + 360) % 360;
      let idx = Math.round((360 - normalized) / angleStep) % items.length;
      if (idx < 0) idx += items.length;
      setActiveIdx(prev => (prev !== idx ? idx : prev));
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

  const handleSelect = (item: any, index: number) => {
    const currentRot = rotation.get();
    const targetAngle = -index * angleStep;
    const diff = ((targetAngle - currentRot) % 360 + 360 + 180) % 360 - 180;
    rotation.set(currentRot + diff);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen text-[#1a3a5c] relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#0c1a2e]">
        <video 
          ref={videoRef}
          src={bgVideo} 
          autoPlay={!isMobile}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1a2e]/90 via-[#0c1a2e]/60 to-[#0c1a2e]/90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#48cae4]/10 rounded-full blur-[150px]" />
      </div>

      {/* Barre supérieure unifiée : Retour (gauche), Titre (centre), Sélecteur (droite) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-50 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Gauche : Bouton retour */}
          <div className="w-full lg:w-auto flex justify-start">
            <ShimmerButton
              as="Link"
              to="/"
            >
              ← {t('common.backHome', "Retour à l'accueil")}
            </ShimmerButton>
          </div>

          {/* Centre : Titre Cartographie des Pathologies */}
          <div className="text-center flex-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {t('pathologies.mappingTitle', 'Cartographie des')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48cae4]">
                {t('pathologies.mappingHighlight', 'Pathologies')}
              </span>
            </h2>
          </div>

          {/* Droite : Menu déroulant de choix */}
          <div className="w-full lg:w-72 xl:w-80 text-left">
            <ContentNavigator 
              items={items} 
              placeholder={t('common.chooseCondition', 'Choisir une pathologie')} 
              onSelect={handleSelect} 
              theme="dark" 
            />
          </div>
        </div>
      </div>

      {/* 3D Carousel Scene avec z-20 pour que les cartes soient toujours au premier plan */}
      <div 
        className="relative z-20 flex-1 w-full flex items-center justify-center mt-6 perspective-[2000px]"
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
              className="h-[1200px] w-auto object-contain opacity-70 drop-shadow-[0_0_50px_rgba(72,209,194,0.3)]"
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
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="w-[900px] h-[85vh] max-w-[95vw] pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <MedicalCard 
                {...selectedItem} 
                isDetail={true} 
                onClose={() => setSelectedItem(null)} 
              />
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
    return 1 - (diff / 180) * 0.4; // 1 at front, 0.6 at back
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
      className={`w-[240px] sm:w-[280px] pointer-events-auto transition-all duration-500 ${isActive ? 'scale-105 drop-shadow-[0_0_30px_rgba(72,209,194,0.4)]' : ''}`}
    >
      <motion.div style={{ rotateY, scale, opacity }} className="relative h-full">
        <MedicalCard {...item} color="#4ade80" />
      </motion.div>
    </motion.div>
  );
}

