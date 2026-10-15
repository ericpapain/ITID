import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import videoIntervention from "../../images/video-intervention.mp4";
import { useTypewriter } from "../../hooks/useTypewriter";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";

const DEFAULT_CASE_IMAGES = [
  "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop"
];

function ActiveSliderCard({ item, index = 0 }: { item: any, scrollX?: any, index?: number }) {
  const [imgError, setImgError] = useState(false);

  const fallbackUrl = DEFAULT_CASE_IMAGES[index % DEFAULT_CASE_IMAGES.length] || DEFAULT_CASE_IMAGES[0];
  const hasValidImage = item.image && typeof item.image === "string" && item.image.trim().length > 0;
  const currentImageSrc = (!hasValidImage || imgError) ? fallbackUrl : item.image;

  return (
    <div className="relative w-[300px] h-[450px] md:w-[400px] md:h-[600px] rounded-2xl overflow-hidden shrink-0 group pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] card-hover-highlight hover:shadow-[0_0_40px_rgba(72,209,194,0.5)] transition-all duration-500 p-[1mm] bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#48cae4]/60">
      <div className="relative w-full h-full overflow-hidden rounded-[calc(1rem-1mm)] bg-[#0a1628] pointer-events-none">
        <img
          src={currentImageSrc}
          alt={item.title || "Cas Clinique ITID"}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover opacity-100 transition-transform duration-700 group-hover:scale-105"
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
  const { t, i18n } = useTranslation();
  const [dynamicCases, setDynamicCases] = useState<any[]>([]);

  const PROJECTS = [
    {
      title: t('masonry.p1.title'),
      category: t('masonry.p1.cat'),
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p2.title'),
      category: t('masonry.p2.cat'),
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p3.title'),
      category: t('masonry.p3.cat'),
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p4.title'),
      category: t('masonry.p4.cat'),
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p5.title'),
      category: t('masonry.p5.cat'),
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p6.title'),
      category: t('masonry.p6.cat'),
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p7.title'),
      category: t('masonry.p7.cat'),
      image: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p8.title'),
      category: t('masonry.p8.cat'),
      image: "https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: t('masonry.p9.title'),
      category: t('masonry.p9.cat'),
      image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop"
    }
  ];

  // Chargement des cas cliniques dynamiques configurés dans l'admin CMS
  useEffect(() => {
    let isMounted = true;
    const fetchCases = async () => {
      try {
        const res = await fetch("/api/cms/cas_cliniques");
        if (res.ok) {
          const data = await res.json();
          const items = data.items || data.cases;
          if (isMounted && Array.isArray(items) && items.length > 0) {
            setDynamicCases(items);
          }
        }
      } catch (e) {
        // Fallback silencieux vers PROJECTS statiques
      }
    };
    fetchCases();
    return () => { isMounted = false; };
  }, []);

  const currentLang = i18n.language || "fr";

  const displayList = dynamicCases.length > 0
    ? dynamicCases.map((item) => ({
        title: currentLang.startsWith("en") ? (item.title_en || item.title_fr) : (item.title_fr || item.title_en),
        category: currentLang.startsWith("en") ? (item.category_en || item.category_fr) : (item.category_fr || item.category_en),
        image: item.image
      }))
    : PROJECTS;

  const maxLimit = -Math.max(0, (displayList.length - 1) * 430);

  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { displayedText, showCursor, ref: typeRef } = useTypewriter(t('masonry.title1') + t('masonry.title2'));
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollX = useMotionValue(0);
  const springScroll = useSpring(scrollX, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

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
    if (target < maxLimit) target = maxLimit;

    scrollX.set(target);
  };

  const handlePrev = () => {
    const current = scrollX.get();
    let target = current + 450;
    if (target > 0) target = 0;
    scrollX.set(target);
  };

  const handleNext = () => {
    const current = scrollX.get();
    let target = current - 450;
    if (target < maxLimit) target = 0;
    scrollX.set(target);
  };

  // Défilement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [maxLimit]);

  const title1Len = t('masonry.title1').length;

  return (
    <section className="relative overflow-hidden" id="projets">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-100">
        <video
          ref={videoRef}
          src={videoIntervention}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      </div>

      <div className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10 pointer-events-none">
          <div>

            <h2 ref={typeRef} className="text-5xl md:text-7xl font-bold text-[#1a3a5c] min-h-[1.2em]" style={{ fontFamily: "var(--font-display)" }}>
              {displayedText.substring(0, title1Len)}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48cae4]">
                {displayedText.substring(title1Len)}
              </span>
              <span className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#1a3a5c] align-middle ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`} />
            </h2>
          </div>
          <ShimmerButton
            as="Link"
            to="/pathologies"
          >
            {t('masonry.discoverMore')} <span className="text-xl ml-1">→</span>
          </ShimmerButton>
        </div>

        <div className="relative w-full h-[500px] md:h-[650px]" ref={containerRef}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03] pointer-events-none text-[10rem] md:text-[15rem] font-bold text-[#1a3a5c] tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
            DRAG
          </div>

          {/* Boutons de navigation */}
          <div className="absolute top-1/2 left-4 right-4 md:left-8 md:right-8 flex justify-between z-20 pointer-events-none -translate-y-1/2">
            <button
              onClick={handlePrev}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#1a3a5c] pointer-events-auto hover:bg-white/60 hover:scale-110 transition-all shadow-xl"
            >
              <span className="text-xl md:text-2xl font-bold">←</span>
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#1a3a5c] pointer-events-auto hover:bg-white/60 hover:scale-110 transition-all shadow-xl"
            >
              <span className="text-xl md:text-2xl font-bold">→</span>
            </button>
          </div>

          <motion.div
            drag="x"
            dragElastic={0.1}
            dragConstraints={{ left: maxLimit, right: 0 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: springScroll }}
            className="absolute left-[10%] top-0 flex gap-8 cursor-grab active:cursor-grabbing z-10 px-10"
          >
            {displayList.map((item, idx) => (
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
