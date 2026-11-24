import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ShimmerButton } from "../ui/ShimmerButton";
import videoIntervention from "../../images/video-intervention.mp4";
import { useTypewriter } from "../../hooks/useTypewriter";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { getCleanImageSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";
import { ArrowRight, Maximize2, X, ChevronLeft, ChevronRight, Stethoscope, Sparkles, ZoomIn, ZoomOut, Calendar } from "lucide-react";
import { DEFAULT_CAS_CLINIQUES } from "../../data";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";

interface CaseItem {
  id?: string;
  title: string;
  category: string;
  image: string;
  traitement_slug: string;
  traitement_title?: string;
  pathologie_slug?: string;
  pathologie_title?: string;
  short_desc?: string;
}

interface ActiveSliderCardProps {
  item: CaseItem;
  index: number;
  onExpand: () => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  hasTreatmentDescription?: boolean;
}

/**
 * Carte d'intervention dans le carrousel.
 * Pas de retournement 3D : un clic agrandit progressivement la carte au centre de l'écran.
 */
function ActiveSliderCard({
  item,
  index = 0,
  onExpand,
  isDraggingRef,
  hasTreatmentDescription = false,
}: ActiveSliderCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const fallbackUrl = REAL_FALLBACK_IMAGES[index % REAL_FALLBACK_IMAGES.length] || REAL_FALLBACK_IMAGES[0];
  const resolvedSrc = getCleanImageSrc(item?.image, index);
  const currentImageSrc = imgError ? fallbackUrl : resolvedSrc;

  useEffect(() => {
    setImgError(false);
  }, [item?.image]);

  const targetTreatmentUrl = `/traitements/${item.traitement_slug || "infiltrations-rachidiennes"}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) return;
    onExpand();
  };

  const handleNavigateTreatment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    navigate(targetTreatmentUrl);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-[290px] h-[450px] md:w-[350px] md:h-[500px] shrink-0 rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#0e213b] via-[#0a172a] to-[#07111e] shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(72,202,228,0.25)] hover:border-[#48cae4]/70 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group select-none"
    >
      {/* Zone Image supérieure avec proportions soignées et gradient doux */}
      <div className="relative w-full h-56 md:h-64 shrink-0 overflow-hidden bg-slate-950">
        <img
          src={currentImageSrc}
          alt={item.title || "Cas Clinique ITID"}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a172a] via-[#0a172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/10 to-[#0a172a]/70" />

        {/* Badge Catégorie en haut à gauche */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="py-1 px-3 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold text-[#48cae4] tracking-wider uppercase shadow-md">
            {item.category}
          </span>
        </div>

        {/* Bouton indicateur d'agrandissement en haut à droite */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <div
            title="Agrandir la fiche"
            className="w-8 h-8 rounded-full bg-black/60 group-hover:bg-[#48cae4] group-hover:text-[#0c1a2e] text-white border border-white/20 flex items-center justify-center transition-all shadow-md"
          >
            <Maximize2 size={14} />
          </div>
        </div>
      </div>

      {/* Zone Contenu inférieure */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-3 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-1.5">
            <Sparkles size={12} className="text-[#48cae4]" />
            <span>Cas d'Intervention</span>
          </div>

          <h3
            className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-cyan-100 transition-colors line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.title}
          </h3>

          {item.short_desc && (
            <p className="mt-2 text-xs md:text-sm text-slate-300/90 font-light leading-relaxed line-clamp-2">
              {item.short_desc}
            </p>
          )}
        </div>

        {/* Actions inférieures */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2">
          {hasTreatmentDescription ? (
            <button
              type="button"
              onClick={handleNavigateTreatment}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_15px_rgba(72,202,228,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Voir le traitement</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 group-hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all flex items-center justify-center gap-1.5">
              <Maximize2 size={13} className="text-[#48cae4]" />
              <span>Agrandir la fiche</span>
            </div>
          )}

          <div
            title="Cliquer pour afficher la fiche complète"
            className="py-2.5 px-3 rounded-xl bg-white/10 group-hover:bg-[#48cae4] group-hover:text-[#0c1a2e] border border-white/15 text-white text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Détails</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsMasonry() {
  const { t, i18n } = useTranslation();
  const [dynamicCases, setDynamicCases] = useState<any[]>([]);
  const [publishedTreatments, setPublishedTreatments] = useState<any[]>([]);

  // États pour l'agrandissement de la carte et du zoom indépendant d'image
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const isDraggingRef = useRef(false);
  const navigate = useNavigate();

  const PROJECTS: CaseItem[] = [
    {
      title: t("masonry.p1.title", "Infiltration Épidurale Lombaire"),
      category: t("masonry.p1.cat", "Lombalgie & Sciatique"),
      image: "/images/treatments/infiltrations_rachidiennes.jpg",
      traitement_slug: "infiltrations-rachidiennes",
      traitement_title: "Infiltrations Rachidiennes Guidées",
      pathologie_slug: "lombalgie",
      pathologie_title: "Lombalgie & Sciatique Rebelle",
      short_desc:
        "Prise en charge guidée sous contrôle scopique millimétrique d'un conflit disco-radiculaire persistant avec infiltration épidurale ciblée.",
    },
    {
      title: t("masonry.p2.title", "Radiofréquence des Facettes"),
      category: t("masonry.p2.cat", "Douleur Cervico-Lombaire"),
      image: "/images/treatments/radiofrequence.jpg",
      traitement_slug: "radiofrequence",
      traitement_title: "Radiofréquence / Thermocoagulation",
      pathologie_slug: "sciatique",
      pathologie_title: "Syndrome Facettaire Chronique",
      short_desc:
        "Dénervation par thermocoagulation des branches médiales postérieures garantissant une sédation durable des douleurs articulaires vertébrales.",
    },
    {
      title: t("masonry.p3.title", "Lombalgie Chronique Invalidante"),
      category: t("masonry.p3.cat", "Rachis Lombaire"),
      image: "/images/lombalgie.jpg",
      traitement_slug: "infiltrations-rachidiennes",
      traitement_title: "Infiltrations Rachidiennes Guidées",
      pathologie_slug: "lombalgie",
      pathologie_title: "Lombalgie Chronique",
      short_desc:
        "Protocole interventionnel associant bilan d'imagerie dynamique et infiltration foraminale sélective pour rupture de la chronicisation.",
    },
    {
      title: t("masonry.p4.title", "Bloc Anesthésique d'Arnold"),
      category: t("masonry.p4.cat", "Céphalées & Névralgies"),
      image: "/images/treatments/blocs_anesthesiques.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Anesthésiques Ciblés",
      pathologie_slug: "nevralgie-arnold",
      pathologie_title: "Névralgie d'Arnold",
      short_desc:
        "Infiltration ciblée du nerf grand occipital sous repérage échographique haute résolution apportant un soulagement immédiat des crises occipitales.",
    },
    {
      title: t("masonry.p5.title", "Hypnose Réalité Virtuelle HypnoVR"),
      category: t("masonry.p5.cat", "Neuromodulation"),
      image: "/images/treatments/hypnovr.jpg",
      traitement_slug: "hypnovr",
      traitement_title: "Hypnose Médicale & Réalité Virtuelle",
      pathologie_slug: "douleurs-neuropathiques",
      pathologie_title: "Douleurs Neuropathiques Réfractaires",
      short_desc:
        "Immersion multisensorielle et hypnose médicale permettant une modulation centrale de la douleur et une réduction majeure du stress algique.",
    },
    {
      title: t("masonry.p6.title", "Migraine Chronique Réfractaire"),
      category: t("masonry.p6.cat", "Céphalées Sévères"),
      image: "/images/migraine.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Anesthésiques & Neurolyse",
      pathologie_slug: "migraine",
      pathologie_title: "Migraine Chronique",
      short_desc:
        "Bloc ganglionnaire sphéno-palatin et protocole d'anesthésie régionale pour stopper l'emballement des migraines invalidantes.",
    },
    {
      title: t("masonry.p7.title", "Névralgie d'Arnold Persistante"),
      category: t("masonry.p7.cat", "Nerf Grand Occipital"),
      image: "/images/nevralgie_arnold.jpg",
      traitement_slug: "radiofrequence",
      traitement_title: "Radiofréquence Pulsée du Nerf Occipital",
      pathologie_slug: "nevralgie-arnold",
      pathologie_title: "Névralgie d'Arnold",
      short_desc:
        "Neuromodulation par radiofréquence pulsée sans lésion tissulaire pour stopper les paroxysmes douloureux occipitaux réfractaires.",
    },
    {
      title: t("masonry.p8.title", "SDRC / Algodystrophie Complexe"),
      category: t("masonry.p8.cat", "Syndrome Douloureux"),
      image: "/images/sdrc.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Sympathiques Régionaux",
      pathologie_slug: "sdrc",
      pathologie_title: "SDRC (Syndrome Douloureux Régional Complexe)",
      short_desc:
        "Bloc sympathique étagé précoce permettant la restauration trophique vasculaire et la diminution de l'hyperesthésie cutanée.",
    },
    {
      title: t("masonry.p9.title", "Stimulation du Ganglion Dorsal"),
      category: t("masonry.p9.cat", "Neuromodulation DRG"),
      image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
      traitement_slug: "stimulation-ganglion-dorsal",
      traitement_title: "Stimulation du Ganglion Dorsal (DRG)",
      pathologie_slug: "douleurs-neuropathiques",
      pathologie_title: "Neuropathie Focale Rebelle",
      short_desc:
        "Implantation d'électrodes au contact du ganglion de la racine dorsale ciblant précisément les douleurs neuropathiques focales isolées.",
    },
  ];

  // Chargement des cas cliniques et des traitements dynamiques configurés dans l'admin CMS
  useEffect(() => {
    let isMounted = true;
    const loadAllData = async () => {
      try {
        const [resCases, resTreatments] = await Promise.all([
          fetch("/api/cms/cas_cliniques").catch(() => null),
          fetch("/api/cms/traitements").catch(() => null),
        ]);

        if (resCases && resCases.ok) {
          const data = await resCases.json();
          const items = data.items || data.cases;
          if (isMounted && Array.isArray(items) && items.length > 0) {
            setDynamicCases(items);
          }
        }

        if (resTreatments && resTreatments.ok) {
          const dataT = await resTreatments.json();
          const itemsT = dataT.traitements || dataT.items;
          if (isMounted && Array.isArray(itemsT)) {
            setPublishedTreatments(itemsT);
          }
        }
      } catch (e) {
        // Fallback silencieux vers PROJECTS statiques
      }
    };
    loadAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  const treatmentsWithDesc = useMemo(() => {
    return new Set(
      publishedTreatments
        .filter((t: any) => {
          const hasSecs =
            (Array.isArray(t.sections) && t.sections.length > 0) ||
            (t.sections_json && t.sections_json !== "[]" && String(t.sections_json).trim() !== "");
          const hasDesc =
            (t.desc_front_fr && t.desc_front_fr.trim().length > 20) ||
            (t.desc_back_fr && t.desc_back_fr.trim().length > 20);
          const hasLegacy =
            (t.section1_title_fr && t.section1_title_fr.trim().length > 0) ||
            (t.section1_text_fr && t.section1_text_fr.trim().length > 0);
          return hasSecs || hasDesc || hasLegacy;
        })
        .map((t: any) => (t.slug || "").toLowerCase().trim())
    );
  }, [publishedTreatments]);

  const currentLang = i18n.language || "fr";
  const casesSource = dynamicCases.length > 0 ? dynamicCases : DEFAULT_CAS_CLINIQUES;

  const displayList: CaseItem[] = useMemo(() => {
    const list = casesSource.map((item, idx) => {
      return {
        id: item.id || `case-${idx}`,
        title: currentLang.startsWith("en")
          ? item.title_en || item.title_fr || ""
          : item.title_fr || item.title_en || "",
        category: currentLang.startsWith("en")
          ? item.category_en || item.category_fr || ""
          : item.category_fr || item.category_en || "",
        image: item.image || "/images/treatments/infiltrations_rachidiennes.jpg",
        traitement_slug: item.traitement_slug || "infiltrations-rachidiennes",
        traitement_title: item.traitement_title || "",
        pathologie_slug: item.pathologie_slug || "lombalgie-chronique",
        pathologie_title: item.pathologie_title || "",
        short_desc: currentLang.startsWith("en")
          ? item.short_desc_en || item.short_desc_fr || ""
          : item.short_desc_fr || item.short_desc_en || "",
      };
    });
    return list.length > 0 ? list : PROJECTS;
  }, [casesSource, currentLang]);

  // Préchargement de toutes les images pour éviter tout clignotement ou latence
  useEffect(() => {
    displayList.forEach((item, idx) => {
      const src = getCleanImageSrc(item.image, idx);
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [displayList]);

  const count = displayList.length;

  // Triplication de la liste pour garantir une boucle infinie continue et fluide (sans trou ni saut en arrière)
  const infiniteList = useMemo(() => {
    if (count === 0) return [];
    return [...displayList, ...displayList, ...displayList];
  }, [displayList, count]);

  // virtualIndex démarre au milieu (set 2, c'est-à-dire index `count`)
  const [virtualIndex, setVirtualIndex] = useState(count);
  const [isJumping, setIsJumping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { displayedText, showCursor, ref: typeRef } = useTypewriter(t("masonry.title1") + t("masonry.title2"));
  const containerRef = useRef<HTMLDivElement>(null);

  const cardWidth = isMobile ? 290 : 350;
  const cardGap = 24;
  const cardStep = cardWidth + cardGap;

  // Indice actif normalisé (0 .. count - 1)
  const activeRealIndex = count > 0 ? ((virtualIndex % count) + count) % count : 0;

  // Déplacement avant / arrière d'une slide à la fois
  const handlePrev = useCallback(() => {
    if (isJumping || count <= 1) return;
    setVirtualIndex((prev) => prev - 1);
  }, [isJumping, count]);

  const handleNext = useCallback(() => {
    if (isJumping || count <= 1) return;
    setVirtualIndex((prev) => prev + 1);
  }, [isJumping, count]);

  // Saut direct vers une slide via les points de pagination (au plus proche)
  const handleGoTo = useCallback((targetRealIndex: number) => {
    if (count <= 1) return;
    const diff = targetRealIndex - activeRealIndex;
    setVirtualIndex((prev) => prev + diff);
  }, [count, activeRealIndex]);

  // Recalage transparent et instantané une fois arrivé au début ou à la fin d'un cycle
  const handleAnimationComplete = () => {
    if (count <= 1) return;
    if (virtualIndex >= 2 * count) {
      setIsJumping(true);
      setVirtualIndex((prev) => prev - count);
    } else if (virtualIndex < count) {
      setIsJumping(true);
      setVirtualIndex((prev) => prev + count);
    }
  };

  useEffect(() => {
    if (isJumping) {
      const raf = requestAnimationFrame(() => {
        setIsJumping(false);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isJumping]);

  // Défilement automatique continu, régulier et calme (pause au survol et quand une modale est ouverte)
  useEffect(() => {
    if (isPaused || enlargedIndex !== null || count <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused, enlargedIndex, count, handleNext]);

  // Support swipe / glissement tactile ou souris
  const handleDragEnd = (_e: any, info: PanInfo) => {
    const threshold = 40;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    }
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
  };

  // Gestion de la touche Échap et des flèches gauche/droite
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isImageZoomed) {
          // Ferme uniquement le zoom d'image, la carte reste agrandie
          setIsImageZoomed(false);
        } else if (enlargedIndex !== null) {
          // Ferme la carte agrandie
          setEnlargedIndex(null);
        }
      } else if (e.key === "ArrowLeft") {
        if (enlargedIndex !== null && !isImageZoomed) {
          setEnlargedIndex((prev) => (prev! > 0 ? prev! - 1 : count - 1));
        } else if (enlargedIndex === null) {
          handlePrev();
        }
      } else if (e.key === "ArrowRight") {
        if (enlargedIndex !== null && !isImageZoomed) {
          setEnlargedIndex((prev) => (prev! < count - 1 ? prev! + 1 : 0));
        } else if (enlargedIndex === null) {
          handleNext();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageZoomed, enlargedIndex, count, handlePrev, handleNext]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const title1Len = t("masonry.title1").length;

  const currentModalItem = enlargedIndex !== null && count > 0 ? displayList[enlargedIndex] : null;
  const currentModalImage = currentModalItem
    ? getCleanImageSrc(currentModalItem.image, enlargedIndex!)
    : "";

  return (
    <section className="relative overflow-hidden" id="projets">
      {/* Background Video avec voile discret */}
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
        <div className="max-w-7xl mx-auto px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-20">
          <div>
            <h2
              ref={typeRef}
              className="text-5xl md:text-7xl font-bold text-[#1a3a5c] min-h-[1.2em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayedText.substring(0, title1Len)}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48cae4]">
                {displayedText.substring(title1Len)}
              </span>
              <span
                className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#1a3a5c] align-middle ml-2 ${
                  showCursor ? "opacity-100" : "opacity-0"
                } transition-opacity duration-75`}
              />
            </h2>
          </div>
          <div className="pointer-events-auto">
            <ShimmerButton as="Link" to="/traitements" data-discover="true">
              {t("masonry.discoverMore", "Découvrir plus")} <span className="text-xl ml-1">→</span>
            </ShimmerButton>
          </div>
        </div>

        {/* ============================================================= */}
        {/* CARROUSEL SIMPLIFIÉ EN BOUCLE INFINIE CONTINUE                */}
        {/* ============================================================= */}
        <div
          className="relative w-full overflow-hidden py-4"
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Boutons de navigation manuelle (gauche / droite) */}
          <div className="absolute top-1/2 left-4 right-4 md:left-8 md:right-8 flex justify-between z-30 pointer-events-none -translate-y-1/2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Cas précédent"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/85 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Cas suivant"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/85 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
            >
              <ChevronRight size={26} />
            </button>
          </div>

          {/* Track de défilement horizontal fluide et continu (1 par 1) */}
          <div className="w-full flex items-center justify-center overflow-visible">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragStart={() => {
                isDraggingRef.current = true;
              }}
              onDragEnd={handleDragEnd}
              animate={{
                x: `calc(50% - ${cardWidth / 2}px - ${virtualIndex * cardStep}px)`,
              }}
              transition={
                isJumping
                  ? { duration: 0 }
                  : { duration: 0.55, ease: [0.25, 1, 0.5, 1] }
              }
              onAnimationComplete={handleAnimationComplete}
              className="flex gap-6 cursor-grab active:cursor-grabbing z-10 py-6"
            >
              {infiniteList.map((item, idx) => {
                const realIdx = idx % count;
                const isCenter = idx === virtualIndex;
                const hasTreatmentDesc = Boolean(
                  item.traitement_slug &&
                    treatmentsWithDesc.has(item.traitement_slug.toLowerCase().trim())
                );

                return (
                  <motion.div
                    key={`${item.id || realIdx}-${idx}`}
                    animate={{
                      scale: isCenter ? 1 : 0.94,
                      opacity: isCenter ? 1 : 0.72,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    onClick={() => {
                      if (!isCenter && !isDraggingRef.current) {
                        setVirtualIndex(idx);
                      }
                    }}
                    className="shrink-0 transition-all duration-300 rounded-3xl"
                  >
                    <ActiveSliderCard
                      item={item}
                      index={realIdx}
                      onExpand={() => {
                        setEnlargedIndex(realIdx);
                        setIsImageZoomed(false);
                      }}
                      isDraggingRef={isDraggingRef}
                      hasTreatmentDescription={hasTreatmentDesc}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Pagination & Indicateurs carte par carte */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 z-20 relative">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-xs">
              Cas {activeRealIndex + 1} / {count}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md p-1.5 rounded-full border border-white/10">
              {displayList.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => handleGoTo(dotIdx)}
                  aria-label={`Aller au cas ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === activeRealIndex
                      ? "w-8 bg-[#2a9d8f]"
                      : "w-2 bg-white/40 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* NOUVEAU COMPORTEMENT : CARTE D'INTERVENTION AGRANDIE          */}
      {/* S'agrandit au centre, voile sombre en fond, sans rotation 3D */}
      {/* ============================================================= */}
      {currentModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            // Situation 1 & 2 : un clic à l'extérieur de la carte ferme l'ensemble et revient à l'affichage normal
            setIsImageZoomed(false);
            setEnlargedIndex(null);
          }}
        >
          {/* Conteneur de la carte agrandie (très grand format) */}
          <div
            className="relative w-full max-w-6xl xl:max-w-7xl bg-[#0a1628] border border-[#48cae4]/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(72,202,228,0.25)] flex flex-col md:flex-row max-h-[95vh] md:min-h-[580px] lg:min-h-[660px] animate-in zoom-in-95 duration-200"
            onClick={(e) => {
              // Situation 1 : un clic à l'intérieur de la carte ne la ferme pas
              e.stopPropagation();

              // Situation 2 : un clic en dehors de l'image, mais à l'intérieur de la carte, ferme UNIQUEMENT le zoom image
              if (isImageZoomed) {
                setIsImageZoomed(false);
              }
            }}
          >
            {/* Bouton Fermer la carte agrandie (en haut à droite) */}
            <button
              type="button"
              onClick={() => {
                setIsImageZoomed(false);
                setEnlargedIndex(null);
              }}
              aria-label="Fermer la vue agrandie"
              className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/75 hover:bg-red-500/50 hover:border-red-400 border border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              <X size={20} />
            </button>

            {/* Navigation interne Flèches Précédent / Suivant */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageZoomed(false);
                setEnlargedIndex((prev) => (prev! > 0 ? prev! - 1 : count - 1));
              }}
              aria-label="Cas précédent"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/75 hover:bg-[#48cae4] hover:text-[#0c1a2e] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageZoomed(false);
                setEnlargedIndex((prev) => (prev! < count - 1 ? prev! + 1 : 0));
              }}
              aria-label="Cas suivant"
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/75 hover:bg-[#48cae4] hover:text-[#0c1a2e] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
            >
              <ChevronRight size={22} />
            </button>

            {/* Colonne Gauche : Image complète (object-fit: contain, proportions respectées, très grand format) */}
            <div
              className="md:w-7/12 lg:w-3/5 relative bg-slate-950/95 overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[540px] lg:min-h-[640px] cursor-pointer group select-none"
              onClick={(e) => {
                // Section 5 : clic sur l'image ouvre la vue agrandie indépendante de l'image
                e.stopPropagation();
                setIsImageZoomed(true);
              }}
              title="Cliquer pour observer l'image en grand"
            >
              {/* Fond flouté d'ambiance pour un rendu harmonieux sans vide */}
              <img
                src={currentModalImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
              />

              {/* Image principale : object-contain préserve 100% de l'image médicale */}
              <img
                src={currentModalImage}
                alt={currentModalItem.title}
                className="relative z-10 max-h-[380px] md:max-h-[540px] lg:max-h-[640px] w-auto max-w-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-102"
                onError={(e) => {
                  e.currentTarget.src =
                    REAL_FALLBACK_IMAGES[enlargedIndex! % REAL_FALLBACK_IMAGES.length];
                }}
              />

              {/* Badge Catégorie */}
              <div className="absolute top-4 left-4 z-20">
                <span className="py-1 px-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-[#48cae4] uppercase tracking-wider">
                  {currentModalItem.category}
                </span>
              </div>

              {/* Bouton incitatif pour l'agrandissement d'image */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg group-hover:border-[#48cae4] group-hover:text-[#48cae4] transition-all pointer-events-none">
                <ZoomIn size={15} className="text-[#48cae4]" />
                <span>Cliquer pour agrandir l'image</span>
              </div>
            </div>

            {/* Colonne Droite : Informations réorganisées du Recto et du Verso */}
            <div className="md:w-5/12 lg:w-2/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                    <Stethoscope size={13} className="text-[#48cae4]" />
                    <span>Fiche Clinique #{enlargedIndex! + 1}</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#48cae4]" />
                  <span className="text-xs text-[#48cae4] font-semibold">Centre Expert ITID</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {currentModalItem.title}
                </h3>

                {/* Bloc Traitement & Pathologie Associés */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#48cae4] tracking-wider block">
                        Traitement Associé :
                      </span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {currentModalItem.traitement_title ||
                          currentModalItem.traitement_slug?.replace(/-/g, " ") ||
                          "Geste Interventionnel Spécialisé"}
                      </p>
                    </div>

                    {currentModalItem.traitement_slug && (
                      <Link
                        to={`/traitements/${currentModalItem.traitement_slug}`}
                        onClick={() => setEnlargedIndex(null)}
                        className="text-xs text-cyan-300 hover:text-white underline font-semibold shrink-0"
                      >
                        Consulter →
                      </Link>
                    )}
                  </div>

                  {currentModalItem.pathologie_slug && (
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-400">Pathologie Cible : </span>
                      <Link
                        to={`/pathologies/${currentModalItem.pathologie_slug}`}
                        onClick={() => setEnlargedIndex(null)}
                        className="text-emerald-300 hover:underline font-medium"
                      >
                        {currentModalItem.pathologie_title ||
                          currentModalItem.pathologie_slug.replace(/-/g, " ")}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Description clinique complète réorganisée du verso */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Protocole & Description Clinique :
                  </span>
                  <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed whitespace-pre-line">
                    {currentModalItem.short_desc ||
                      "Prise en charge spécialisée et protocole mini-invasif de haute précision réalisé par les médecins algologues et radiologues interventionnels de l'Institut."}
                  </p>
                </div>
              </div>

              {/* Actions inférieures de la modale */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageZoomed(false);
                    setEnlargedIndex(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Fermer
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {currentModalItem?.traitement_slug &&
                  treatmentsWithDesc.has(currentModalItem.traitement_slug.toLowerCase().trim()) ? (
                    <button
                      type="button"
                      onClick={() => {
                        const url = `/traitements/${currentModalItem.traitement_slug}`;
                        setEnlargedIndex(null);
                        navigate(url);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_20px_rgba(72,202,228,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Voir le traitement complet</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <a
                      href={DOCTOLIB_APPOINTMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar size={13} />
                      <span>Prendre rendez-vous</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 5 & 6 : AGRANDISSEMENT INDÉPENDANT DE L'IMAGE     */}
            {/* Niveau 2 au-dessus de la carte agrandie                   */}
            {/* ========================================================= */}
            {isImageZoomed && (
              <div
                className="absolute inset-0 z-40 bg-[#06101c]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
                // Situation 2 : clic en dehors de l'image (dans la carte) ferme uniquement le zoom image
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageZoomed(false);
                }}
              >
                {/* En-tête : Bouton retour à la carte agrandie */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageZoomed(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-md"
                  >
                    <ZoomOut size={13} />
                    <span>Retour à la carte</span>
                    <X size={13} className="ml-1" />
                  </button>
                </div>

                {/* Vue centrale de l'image agrandie dans ses proportions originales */}
                <div
                  className="relative max-w-full max-h-[84vh] flex flex-col items-center justify-center"
                  onClick={(e) => {
                    // Situation 2 : un clic à l'intérieur de l'image ne ferme pas la carte,
                    // mais selon la Section 5 : "Un clic sur l'image agrandie permet de revenir à la carte agrandie"
                    e.stopPropagation();
                    setIsImageZoomed(false);
                  }}
                  title="Cliquer pour revenir à la carte agrandie"
                >
                  <img
                    src={currentModalImage}
                    alt={currentModalItem.title}
                    className="max-h-[76vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/20 cursor-zoom-out select-none"
                    onError={(e) => {
                      e.currentTarget.src =
                        REAL_FALLBACK_IMAGES[enlargedIndex! % REAL_FALLBACK_IMAGES.length];
                    }}
                  />
                  <div className="mt-3 text-center text-xs text-slate-300 font-medium">
                    <span className="font-bold text-white">{currentModalItem.title}</span> —{" "}
                    <span className="text-[#48cae4]">{currentModalItem.category}</span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      Cliquez sur l'image ou hors de l'image pour revenir à la fiche complète (ou appuyez sur Échap)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
export default ProjectsMasonry;
