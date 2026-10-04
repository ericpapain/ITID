import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const validImages = images && images.length > 0 ? images.filter(Boolean) : ["/images/lombalgie.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [validImages.length, autoPlayInterval, isHovered]);

  const currentSrc = validImages[currentIndex] || validImages[0];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex + '-' + currentSrc}
          src={currentSrc}
          alt={`${alt} ${currentIndex + 1}`}
          loading="lazy"
          decoding="async"
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
      {showDots && validImages.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
          {validImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`transition-all rounded-full ${
                currentIndex === i
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
