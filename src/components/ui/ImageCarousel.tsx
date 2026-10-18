import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCleanGallery, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  autoPlayInterval?: number; // ms, default 3500
  className?: string;
  showDots?: boolean;
  aspectRatio?: string;
  overlayGradient?: boolean;
}

export function ImageCarousel({
  images,
  alt = "Image médicale ITID",
  autoPlayInterval = 3500,
  className = "w-full h-full",
  showDots = true,
  overlayGradient = true,
}: ImageCarouselProps) {
  // 1. Normalisation et nettoyage préalable de toutes les URLs
  const initialImages = useMemo(() => {
    return getCleanGallery(images, null, 3);
  }, [images]);

  // État local des images pour pouvoir remplacer immédiatement une image cassée/404 par un fallback
  const [currentGallery, setCurrentGallery] = useState<string[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setCurrentGallery(getCleanGallery(images, null, 3));
    setCurrentIndex(0);
  }, [images]);

  const totalImages = currentGallery.length;

  useEffect(() => {
    if (totalImages <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [totalImages, autoPlayInterval, isHovered]);

  const safeIndex = currentIndex < totalImages ? currentIndex : 0;
  const currentSrc = currentGallery[safeIndex] || REAL_FALLBACK_IMAGES[safeIndex % REAL_FALLBACK_IMAGES.length];

  // Gestionnaire d'erreur : si l'image distante échoue (404, indisponible), bascule instantanément vers un asset local
  const handleImageError = (failedIdx: number) => {
    setCurrentGallery((prev) => {
      const next = [...prev];
      const fallback = REAL_FALLBACK_IMAGES[failedIdx % REAL_FALLBACK_IMAGES.length];
      if (next[failedIdx] !== fallback) {
        next[failedIdx] = fallback;
      }
      return next;
    });
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-950 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={`${safeIndex}-${currentSrc}`}
          src={currentSrc}
          alt={`${alt} ${safeIndex + 1}`}
          loading="lazy"
          decoding="async"
          onError={() => handleImageError(safeIndex)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/90 via-[#0c1a2e]/30 to-transparent pointer-events-none" />
      )}

      {/* Mini dots indicator */}
      {showDots && totalImages > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 pointer-events-auto">
          {currentGallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`transition-all rounded-full cursor-pointer ${
                safeIndex === i
                  ? "w-4 h-1.5 bg-[#48cae4] shadow-[0_0_8px_#48cae4]"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              title={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

