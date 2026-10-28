import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ShimmerButton } from "../ui/ShimmerButton";
import { PATHOLOGIES } from "../../data";
import { MedicalCard } from "../Cards";
import { ContentNavigator } from "../ui/ContentNavigator";
import spineImg from "../../images/spine_isolated.png";
import bgVideo from "../../images/pathologie-2.mp4";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../../hooks/useIsMobile";
import { getCleanImageSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";

export function PathologiesPremium() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const isMobile = useIsMobile(1024);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isDraggingRef = useRef(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchPathologies() {
      try {
        const res = await fetch("/api/cms/pathologies");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.pathologies)) {
            setDynamicItems(data.pathologies);
            setLoaded(true);
            return;
          }
        }
      } catch (e) {}
      setLoaded(true);
    }
    fetchPathologies();
  }, []);

  const items = loaded
    ? dynamicItems.map((item, idx) => ({
        ...item,
        title: lang === "en" ? (item.title_en || item.title_fr) : item.title_fr,
        desc: lang === "en" ? (item.short_desc_en || item.short_desc_fr) : item.short_desc_fr,
        img: getCleanImageSrc(item.card_image || item.img, idx),
        slug: item.slug
      }))
    : PATHOLOGIES.map((item, idx) => ({
        ...item,
        title: t(item.title),
        desc: t(item.desc),
        img: getCleanImageSrc(item.img, idx),
        slug: item.slug || ["lombalgie-chronique", "nevralgie-arnold", "sdrc", "endometriose", "douleurs-articulaires", "fibromyalgie", "douleurs-neuropathiques", "douleurs-post-op", "migraines"][idx] || "lombalgie-chronique"
      }));

  const cardWidth = isMobile ? 290 : 350;
  const cardGap = 20;
  const cardStep = cardWidth + cardGap;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % items.length);
  };

  // Circulation automatique calme carte par carte (en boucle) avec pause immédiate au survol
  useEffect(() => {
    if (isPaused || selectedItem !== null || items.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length, isPaused, selectedItem]);

  // Raccourcis clavier (Flèches gauche/droite et Échap)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedItem !== null) {
        if (e.key === "Escape") {
          setSelectedItem(null);
        } else if (e.key === "ArrowLeft") {
          setActiveIdx((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        } else if (e.key === "ArrowRight") {
          setActiveIdx((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        }
      } else {
        if (e.key === "ArrowLeft") {
          handlePrev();
        } else if (e.key === "ArrowRight") {
          handleNext();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, items.length]);

  const handleSelect = (_item: any, index: number) => {
    setActiveIdx(index);
  };

  const handleDragEnd = (_e: any, info: PanInfo) => {
    const threshold = 35;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    }
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen text-[#1a3a5c] relative overflow-hidden flex flex-col items-center justify-between">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1a2e]/90 via-[#0c1a2e]/60 to-[#0c1a2e]/95" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#48cae4]/10 rounded-full blur-[150px]" />
      </div>

      {/* Hologramme médical central fixe en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-20">
        <img
          src={spineImg}
          alt="Hologramme Colonne"
          className="h-[550px] md:h-[700px] w-auto object-contain drop-shadow-[0_0_50px_rgba(72,209,194,0.3)] animate-pulse"
          style={{ animationDuration: "5s" }}
        />
      </div>

      {/* Barre supérieure unifiée : Retour (gauche), Titre (centre), Sélecteur (droite) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-30 mb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Gauche : Bouton retour */}
          <div className="w-full lg:w-auto flex justify-start">
            <ShimmerButton as="Link" to="/">
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
            <p className="text-xs sm:text-sm text-cyan-200/70 mt-1 max-w-xl mx-auto font-light">
              Faites défiler carte par carte ou sélectionnez directement une pathologie
            </p>
          </div>

          {/* Droite : Menu déroulant de choix direct */}
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
      {/* SECTION CARROUSEL CARTE PAR CARTE (HAUTEUR RÉDUITE, CLIC DIRECT) */}
      {/* ========================================================= */}
      <div
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col justify-center items-center py-4 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Boutons de navigation gauche / droite */}
        <div className="absolute top-1/2 left-2 right-2 sm:left-4 sm:right-4 md:left-8 md:right-8 flex justify-between z-30 pointer-events-none -translate-y-1/2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Pathologie précédente"
            className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-slate-900/80 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Pathologie suivante"
            className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-slate-900/80 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight size={26} />
          </button>
        </div>

        {/* Track de défilement horizontal centré sur la carte active */}
        <div className="w-full flex items-center justify-center overflow-visible py-4">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => { isDraggingRef.current = true; }}
            onDragEnd={handleDragEnd}
            animate={{ x: `calc(50% - ${cardWidth / 2}px - ${activeIdx * cardStep}px)` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-5 cursor-grab active:cursor-grabbing z-10"
          >
            {items.map((item, idx) => {
              const isActive = idx === activeIdx;
              const detailSlug = item.slug || "lombalgie-chronique";

              return (
                <motion.article
                  key={item.title || idx}
                  animate={{
                    scale: isActive ? 1 : 0.94,
                    opacity: isActive ? 1 : 0.6
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    if (!isActive) {
                      setActiveIdx(idx);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                  style={{ width: `${cardWidth}px` }}
                  className={`h-[360px] sm:h-[375px] shrink-0 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-gradient-to-br from-[#10243e]/95 via-[#0d1c31]/95 to-[#091524]/95 backdrop-blur-md cursor-pointer select-none ${
                    isActive
                      ? "border-[#48cae4] shadow-[0_0_35px_rgba(72,202,228,0.35)]"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  {/* Liseré supérieur coloré */}
                  <div
                    className="h-1 w-full shrink-0"
                    style={{ backgroundColor: item.color || "#48cae4" }}
                  />

                  {/* Zone Image compacte (hauteur réduite) */}
                  <div className="relative h-40 sm:h-44 w-full shrink-0 overflow-hidden bg-slate-950">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = REAL_FALLBACK_IMAGES[idx % REAL_FALLBACK_IMAGES.length];
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] via-transparent to-black/30" />

                    {/* Badge numéro & Icône */}
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-[#48cae4]">
                      #{String(idx + 1).padStart(2, "0")}
                    </div>
                    {item.icon && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm text-white">
                        {item.icon}
                      </div>
                    )}
                  </div>

                  {/* Zone Texte et Action compacte */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-[#48cae4] transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-300 leading-relaxed line-clamp-2 font-light">
                        {item.desc}
                      </p>
                    </div>

                    {/* Bouton direct vers la fiche complète */}
                    <div className="mt-3">
                      <Link
                        to={`/pathologies/${detailSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer group"
                      >
                        <span className="font-bold">
                          {t("common.readFullFile", "Lire la fiche détaillée")}
                        </span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* Pagination & Indicateurs carte par carte */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 z-20 relative">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-200 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-xs">
            Pathologie {activeIdx + 1} / {items.length}
          </span>
          <div className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActiveIdx(dotIdx)}
                aria-label={`Aller à la pathologie ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === activeIdx
                    ? "w-8 bg-[#48cae4]"
                    : "w-2 bg-white/30 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modale plein écran au clic sur une carte */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              layoutId={`card-${selectedItem.title}`}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-[900px] h-[85vh] max-h-[850px] max-w-[96vw] sm:max-w-[90vw] pointer-events-auto flex flex-col"
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

export default PathologiesPremium;
