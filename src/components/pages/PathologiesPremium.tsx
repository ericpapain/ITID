import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const isMobile = useIsMobile(1024);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { stiffness: 50, damping: 20 });

  useEffect(() => {
    async function fetchPathologies() {
      try {
        const res = await fetch("/api/cms/pathologies");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.pathologies) && data.pathologies.length > 0) {
            setDynamicItems(data.pathologies);
            return;
          }
        }
      } catch (e) {}
    }
    fetchPathologies();
  }, []);

  const items = dynamicItems.length > 0 
    ? dynamicItems.map((item) => ({
        ...item,
        title: lang === "en" ? (item.title_en || item.title_fr) : item.title_fr,
        desc: lang === "en" ? (item.short_desc_en || item.short_desc_fr) : item.short_desc_fr,
        img: item.card_image || item.img,
        slug: item.slug
      }))
    : PATHOLOGIES.map((item, idx) => ({
        ...item,
        title: t(item.title),
        desc: t(item.desc),
        slug: ["lombalgie-chronique", "nevralgie-arnold", "sdrc", "endometriose", "douleurs-articulaires", "fibromyalgie", "douleurs-neuropathiques", "douleurs-post-op", "migraines"][idx] || "lombalgie"
      }));

  const angleStep = 360 / Math.max(items.length, 1);
  const radius = 500; // Distance from center on desktop

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Update active index based on rotation (only on desktop when index actually changes)
  useEffect(() => {
    if (isMobile) return;
    return smoothRotation.on("change", (v) => {
      let normalized = ((v % 360) + 360) % 360;
      let idx = Math.round((360 - normalized) / angleStep) % items.length;
      if (idx < 0) idx += items.length;
      setActiveIdx(prev => (prev !== idx ? idx : prev));
    });
  }, [smoothRotation, angleStep, items.length, isMobile]);

  useAnimationFrame((t, delta) => {
    // Only spin slowly on desktop when not dragging
    if (!isMobile && !isDragging) {
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
    if (isMobile) {
      // Sur mobile : défilement doux vers la carte cliquable dans la liste
      const targetEl = document.getElementById(`pathology-card-${index}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setSelectedItem(item);
    } else {
      const currentRot = rotation.get();
      const targetAngle = -index * angleStep;
      const diff = ((targetAngle - currentRot) % 360 + 360 + 180) % 360 - 180;
      rotation.set(currentRot + diff);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen text-[#1a3a5c] relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#0c1a2e]">
        <video 
          ref={videoRef}
          src={bgVideo} 
          autoPlay
          muted
          playsInline
          preload="auto"
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

      {/* ========================================================= */}
      {/* 1. VERSION MOBILE : Cartes cliquables sur toute la longueur */}
      {/*    (Défilement naturel au fur et à mesure du scroll)      */}
      {/* ========================================================= */}
      <div className="lg:hidden w-full max-w-xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col gap-4 mt-2 mb-8">
        <div className="text-center text-xs text-cyan-200/90 mb-1 flex items-center justify-center gap-2 bg-white/5 py-1.5 px-3.5 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#48cae4] animate-pulse" />
          <span>{t("pathologies.mobileHint", "Appuyez sur une carte pour voir tous les détails")}</span>
        </div>

        {items.map((item, index) => (
          <motion.article
            key={item.title}
            id={`pathology-card-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
            onClick={() => setSelectedItem(item)}
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#10243e]/95 via-[#0d1c31]/95 to-[#091524]/95 backdrop-blur-md p-4 sm:p-5 shadow-xl transition-all duration-300 hover:border-[#48cae4]/60 active:scale-[0.98] cursor-pointer"
          >
            {/* Liseré lumineux coloré en haut */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: item.color || '#48cae4' }}
            />

            <div className="flex items-start gap-3.5 sm:gap-4">
              {/* Image miniature avec badge icône */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-white/15 shadow-md">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-1 right-1 w-7 h-7 rounded-lg bg-black/80 backdrop-blur-sm flex items-center justify-center text-sm border border-white/20">
                  {item.icon}
                </div>
              </div>

              {/* Titre et extrait */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                    style={{
                      color: item.color || '#48cae4',
                      borderColor: `${item.color || '#48cae4'}40`,
                      backgroundColor: `${item.color || '#48cae4'}15`
                    }}
                  >
                    Pathologie #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3
                  className="text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-[#48cae4] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>

                <p className="mt-1 text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2 font-light">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Pied de carte avec incitation au clic */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-light">
                {t("pathologies.touchToDiscover", "Détails & prise en charge")}
              </span>
              <Link
                to={`/pathologies/${item.slug || 'lombalgie-chronique'}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-[#48cae4] font-medium group-hover:translate-x-1 transition-transform"
              >
                {t("common.read", "Lire")} 
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-1" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 2. VERSION DESKTOP : Scène 3D avec carrousel rotatif     */}
      {/* ========================================================= */}
      <div 
        className="hidden lg:flex relative z-10 flex-1 w-full items-center justify-center mt-6 perspective-[2000px]"
        style={{ perspective: "2000px" }}
      >
        <motion.div 
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              layoutId={`card-${selectedItem.title}`}
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              className="w-[900px] h-[88vh] max-h-[900px] max-w-[96vw] sm:max-w-[90vw] pointer-events-auto flex flex-col"
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

