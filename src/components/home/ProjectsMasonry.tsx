import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ShimmerButton } from "../ui/ShimmerButton";
import videoIntervention from "../../images/video-intervention.mp4";
import { useTypewriter } from "../../hooks/useTypewriter";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { getCleanImageSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";
import { ArrowRight, RotateCw, Maximize2, X, ChevronLeft, ChevronRight, Stethoscope, Sparkles } from "lucide-react";
import { DEFAULT_CAS_CLINIQUES } from "../../data";

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
  index?: number;
  onExpand: (item: CaseItem, index: number) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  hasTreatmentDescription?: boolean;
}

function ActiveSliderCard({ item, index = 0, onExpand, isDraggingRef, hasTreatmentDescription = false }: ActiveSliderCardProps) {
  const [imgError, setImgError] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  const fallbackUrl = REAL_FALLBACK_IMAGES[index % REAL_FALLBACK_IMAGES.length] || REAL_FALLBACK_IMAGES[0];
  const resolvedSrc = getCleanImageSrc(item?.image, index);
  const currentImageSrc = imgError ? fallbackUrl : resolvedSrc;

  useEffect(() => {
    setImgError(false);
  }, [item?.image]);

  const targetTreatmentUrl = `/traitements/${item.traitement_slug || "infiltrations-rachidiennes"}`;

  const handleFlipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    setFlipped(!flipped);
  };

  const handleNavigateTreatment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    navigate(targetTreatmentUrl);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    onExpand(item, index);
  };

  return (
    <div
      className="relative w-[290px] h-[460px] md:w-[360px] md:h-[520px] shrink-0 pointer-events-auto select-none"
      style={{ perspective: 1400 }}
    >
      <div
        className="w-full h-full relative transition-transform duration-700 rounded-3xl"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ============================================================= */}
        {/* FACE AVANT (RECTO)                                            */}
        {/* ============================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-white/20 hover:border-[#48cae4]/70 transition-all duration-300 flex flex-col justify-between p-6 bg-[#0a1628] group"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          onClick={handleFlipToggle}
        >
          {/* Image de fond avec overlay progressif */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={currentImageSrc}
              alt={item.title || "Cas Clinique ITID"}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-black/30" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-[#0a1628]/80" />
          </div>

          {/* En-tête : Badge Catégorie + Bouton Agrandir */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="py-1 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-[#48cae4] tracking-widest uppercase shadow-md">
              {item.category}
            </span>

            <button
              type="button"
              onClick={handleOpenModal}
              title="Agrandir en plein écran"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-[#48cae4] hover:text-[#0c1a2e] text-white border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer pointer-events-auto"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Zone Centrale / Bas : Titre + Traitement Lié + Barre d'actions */}
          <div className="relative z-10 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-1">
                <Sparkles size={12} className="text-[#48cae4]" />
                <span>Cas d'Intervention</span>
              </div>
              <h3
                className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md group-hover:text-cyan-100 transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h3>
            </div>

            {/* Boutons d'actions clairement séparés */}
            <div className="pt-2 border-t border-white/15 flex items-center gap-2 pointer-events-auto">
              {hasTreatmentDescription ? (
                <button
                  type="button"
                  onClick={handleNavigateTreatment}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_20px_rgba(72,202,228,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Voir le traitement</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFlipToggle}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Fiche détaillée en cours de rédaction — Cliquez pour lire les détails du cas clinique"
                >
                  <RotateCw size={13} className="text-[#48cae4]" />
                  <span>Détails du cas</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleFlipToggle}
                title="Retourner la carte pour lire les détails"
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCw size={13} className="text-[#48cae4]" />
                <span className="hidden sm:inline">Détails</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* FACE ARRIÈRE (VERSO)                                          */}
        {/* ============================================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-[#48cae4]/50 p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-[#10243e] via-[#0d1c31] to-[#08121f]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Header Verso : Retour + Titre */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold flex items-center gap-1">
                <Stethoscope size={13} />
                <span>Fiche Clinique ITID</span>
              </span>

              <button
                type="button"
                onClick={handleFlipToggle}
                className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto"
              >
                <RotateCw size={12} />
                <span>Recto</span>
              </button>
            </div>

            <h4
              className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.title}
            </h4>

            {/* Badges Relations Traitement & Pathologie */}
            <div className="space-y-1.5 pt-1">
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-[#48cae4]/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#48cae4] tracking-wider block">
                  Traitement Associé :
                </span>
                <p className="text-xs text-white font-semibold flex items-center gap-1">
                  <span>{item.traitement_title || item.traitement_slug?.replace(/-/g, " ") || "Geste Spécialisé"}</span>
                </p>
              </div>

              {item.pathologie_slug && (
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                    Pathologie Cible :
                  </span>
                  <span className="text-emerald-100 font-medium capitalize">
                    {item.pathologie_title || item.pathologie_slug?.replace(/-/g, " ")}
                  </span>
                </div>
              )}
            </div>

            {/* Courte description du cas */}
            <div className="pt-2">
              <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed line-clamp-5">
                {item.short_desc || "Prise en charge spécialisée et protocole mini-invasif réalisé par les médecins algologues de l'Institut."}
              </p>
            </div>
          </div>

          {/* Actions Verso */}
          <div className="space-y-2 pt-4 border-t border-white/10 pointer-events-auto">
            {hasTreatmentDescription ? (
              <button
                type="button"
                onClick={handleNavigateTreatment}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(72,202,228,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder au traitement</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <div
                title="La fiche complète de ce traitement est en cours de rédaction par l'équipe médicale de l'ITID"
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-medium text-center flex items-center justify-center gap-1.5 select-none"
              >
                <span>🔒</span>
                <span>Fiche traitement en cours de rédaction</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenModal}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Agrandir en plein écran</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsMasonry() {
  const { t, i18n } = useTranslation();
  const [dynamicCases, setDynamicCases] = useState<any[]>([]);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const navigate = useNavigate();

  const PROJECTS: CaseItem[] = [
    {
      title: t('masonry.p1.title', 'Infiltration Épidurale Lombaire'),
      category: t('masonry.p1.cat', 'Lombalgie & Sciatique'),
      image: "/images/treatments/infiltrations_rachidiennes.jpg",
      traitement_slug: "infiltrations-rachidiennes",
      traitement_title: "Infiltrations Rachidiennes Guidées",
      pathologie_slug: "lombalgie",
      pathologie_title: "Lombalgie & Sciatique Rebelle",
      short_desc: "Prise en charge guidée sous contrôle scopique millimétrique d'un conflit disco-radiculaire persistant avec infiltration épidurale ciblée."
    },
    {
      title: t('masonry.p2.title', 'Radiofréquence des Facettes'),
      category: t('masonry.p2.cat', 'Douleur Cervico-Lombaire'),
      image: "/images/treatments/radiofrequence.jpg",
      traitement_slug: "radiofrequence",
      traitement_title: "Radiofréquence / Thermocoagulation",
      pathologie_slug: "sciatique",
      pathologie_title: "Syndrome Facettaire Chronique",
      short_desc: "Dénervation par thermocoagulation des branches médiales postérieures garantissant une sédation durable des douleurs articulaires vertébrales."
    },
    {
      title: t('masonry.p3.title', 'Lombalgie Chronique Invalidante'),
      category: t('masonry.p3.cat', 'Rachis Lombaire'),
      image: "/images/lombalgie.jpg",
      traitement_slug: "infiltrations-rachidiennes",
      traitement_title: "Infiltrations Rachidiennes Guidées",
      pathologie_slug: "lombalgie",
      pathologie_title: "Lombalgie Chronique",
      short_desc: "Protocole interventionnel associant bilan d'imagerie dynamique et infiltration foraminale sélective pour rupture de la chronicisation."
    },
    {
      title: t('masonry.p4.title', 'Bloc Anesthésique d\'Arnold'),
      category: t('masonry.p4.cat', 'Céphalées & Névralgies'),
      image: "/images/treatments/blocs_anesthesiques.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Anesthésiques Ciblés",
      pathologie_slug: "nevralgie-arnold",
      pathologie_title: "Névralgie d'Arnold",
      short_desc: "Infiltration ciblée du nerf grand occipital sous repérage échographique haute résolution apportant un soulagement immédiat des crises occipitales."
    },
    {
      title: t('masonry.p5.title', 'Hypnose Réalité Virtuelle HypnoVR'),
      category: t('masonry.p5.cat', 'Neuromodulation'),
      image: "/images/treatments/hypnovr.jpg",
      traitement_slug: "hypnovr",
      traitement_title: "Hypnose Médicale & Réalité Virtuelle",
      pathologie_slug: "douleurs-neuropathiques",
      pathologie_title: "Douleurs Neuropathiques Réfractaires",
      short_desc: "Immersion multisensorielle et hypnose médicale permettant une modulation centrale de la douleur et une réduction majeure du stress algique."
    },
    {
      title: t('masonry.p6.title', 'Migraine Chronique Réfractaire'),
      category: t('masonry.p6.cat', 'Céphalées Sévères'),
      image: "/images/migraine.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Anesthésiques & Neurolyse",
      pathologie_slug: "migraine",
      pathologie_title: "Migraine Chronique",
      short_desc: "Bloc ganglionnaire sphéno-palatin et protocole d'anesthésie régionale pour stopper l'emballement des migraines invalidantes."
    },
    {
      title: t('masonry.p7.title', 'Névralgie d\'Arnold Persistante'),
      category: t('masonry.p7.cat', 'Nerf Grand Occipital'),
      image: "/images/nevralgie_arnold.jpg",
      traitement_slug: "radiofrequence",
      traitement_title: "Radiofréquence Pulsée du Nerf Occipital",
      pathologie_slug: "nevralgie-arnold",
      pathologie_title: "Névralgie d'Arnold",
      short_desc: "Neuromodulation par radiofréquence pulsée sans lésion tissulaire pour stopper les paroxysmes douloureux occipitaux réfractaires."
    },
    {
      title: t('masonry.p8.title', 'SDRC / Algodystrophie Complexe'),
      category: t('masonry.p8.cat', 'Syndrome Douloureux'),
      image: "/images/sdrc.jpg",
      traitement_slug: "blocs-anesthesiques",
      traitement_title: "Blocs Sympathiques Régionaux",
      pathologie_slug: "sdrc",
      pathologie_title: "SDRC (Syndrome Douloureux Régional Complexe)",
      short_desc: "Bloc sympathique étagé précoce permettant la restauration trophique vasculaire et la diminution de l'hyperesthésie cutanée."
    },
    {
      title: t('masonry.p9.title', 'Stimulation du Ganglion Dorsal'),
      category: t('masonry.p9.cat', 'Neuromodulation DRG'),
      image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
      traitement_slug: "stimulation-ganglion-dorsal",
      traitement_title: "Stimulation du Ganglion Dorsal (DRG)",
      pathologie_slug: "douleurs-neuropathiques",
      pathologie_title: "Neuropathie Focale Rebelle",
      short_desc: "Implantation d'électrodes au contact du ganglion de la racine dorsale ciblant précisément les douleurs neuropathiques focales isolées."
    }
  ];

  const [publishedTreatments, setPublishedTreatments] = useState<any[]>([]);

  // Chargement des cas cliniques et des traitements dynamiques configurés dans l'admin CMS
  useEffect(() => {
    let isMounted = true;
    const loadAllData = async () => {
      try {
        const [resCases, resTreatments] = await Promise.all([
          fetch("/api/cms/cas_cliniques").catch(() => null),
          fetch("/api/cms/traitements").catch(() => null)
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
    return () => { isMounted = false; };
  }, []);

  const treatmentsWithDesc = React.useMemo(() => {
    return new Set(
      publishedTreatments
        .filter((t: any) => {
          const hasSecs = (Array.isArray(t.sections) && t.sections.length > 0) ||
            (t.sections_json && t.sections_json !== "[]" && String(t.sections_json).trim() !== "");
          const hasDesc = (t.desc_front_fr && t.desc_front_fr.trim().length > 20) || (t.desc_back_fr && t.desc_back_fr.trim().length > 20);
          const hasLegacy = (t.section1_title_fr && t.section1_title_fr.trim().length > 0) || (t.section1_text_fr && t.section1_text_fr.trim().length > 0);
          return hasSecs || hasDesc || hasLegacy;
        })
        .map((t: any) => (t.slug || "").toLowerCase().trim())
    );
  }, [publishedTreatments]);

  const currentLang = i18n.language || "fr";

  const casesSource = dynamicCases.length > 0 ? dynamicCases : DEFAULT_CAS_CLINIQUES;

  const displayList: CaseItem[] = casesSource.map((item, idx) => {
    return {
      id: item.id || `case-${idx}`,
      title: currentLang.startsWith("en") ? (item.title_en || item.title_fr || "") : (item.title_fr || item.title_en || ""),
      category: currentLang.startsWith("en") ? (item.category_en || item.category_fr || "") : (item.category_fr || item.category_en || ""),
      image: item.image || "/images/treatments/infiltrations_rachidiennes.jpg",
      traitement_slug: item.traitement_slug || "infiltrations-rachidiennes",
      pathologie_slug: item.pathologie_slug || "lombalgie-chronique",
      short_desc: currentLang.startsWith("en") ? (item.short_desc_en || item.short_desc_fr || "") : (item.short_desc_fr || item.short_desc_en || "")
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { displayedText, showCursor, ref: typeRef } = useTypewriter(t('masonry.title1') + t('masonry.title2'));
  const containerRef = useRef<HTMLDivElement>(null);

  const cardWidth = isMobile ? 290 : 360;
  const cardGap = 24;
  const cardStep = cardWidth + cardGap;

  // Écouteur clavier Échap et Flèches pour la modale Lightbox ou navigation slider
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activeLightboxIndex !== null) {
        if (e.key === "Escape") {
          setActiveLightboxIndex(null);
        } else if (e.key === "ArrowLeft") {
          setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : displayList.length - 1));
        } else if (e.key === "ArrowRight") {
          setActiveLightboxIndex((prev) => (prev! < displayList.length - 1 ? prev! + 1 : 0));
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
  }, [activeLightboxIndex, displayList.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  // Circulation automatique calme carte par carte (en boucle) avec pause au survol
  useEffect(() => {
    if (isPaused || activeLightboxIndex !== null || displayList.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 2000);
    return () => clearInterval(interval);
  }, [displayList.length, isPaused, activeLightboxIndex]);

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

  const title1Len = t('masonry.title1').length;
  const currentModalItem = activeLightboxIndex !== null ? displayList[activeLightboxIndex] : null;

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
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10 pointer-events-none">
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
            to="/traitements"
          >
            {t('masonry.discoverMore', 'Tous les Traitements')} <span className="text-xl ml-1">→</span>
          </ShimmerButton>
        </div>

        {/* Conteneur Carrousel sans ondulation, circulation carte par carte */}
        <div
          className="relative w-full overflow-hidden py-4"
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Boutons de navigation gauche / droite */}
          <div className="absolute top-1/2 left-4 right-4 md:left-8 md:right-8 flex justify-between z-30 pointer-events-none -translate-y-1/2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Cas précédent"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/80 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 transition-all shadow-xl cursor-pointer"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Cas suivant"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/80 hover:bg-[#2a9d8f] text-white border border-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:scale-105 transition-all shadow-xl cursor-pointer"
            >
              <ChevronRight size={26} />
            </button>
          </div>

          {/* Track de défilement centré carte par carte */}
          <div className="w-full flex items-center justify-center overflow-visible">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={() => { isDraggingRef.current = true; }}
              onDragEnd={handleDragEnd}
              animate={{ x: `calc(50% - ${cardWidth / 2}px - ${currentIndex * cardStep}px)` }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-6 cursor-grab active:cursor-grabbing z-10 py-6"
            >
              {displayList.map((item, idx) => {
                const isActive = idx === currentIndex;
                const hasTreatmentDesc = Boolean(item.traitement_slug && treatmentsWithDesc.has(item.traitement_slug.toLowerCase().trim()));
                return (
                  <motion.div
                    key={item.id || idx}
                    animate={{
                      scale: isActive ? 1 : 0.94,
                      opacity: isActive ? 1 : 0.65
                    }}
                    transition={{ duration: 0.35 }}
                    onClick={() => {
                      if (!isActive) setCurrentIndex(idx);
                    }}
                    className="shrink-0 transition-all duration-300 rounded-3xl"
                  >
                    <ActiveSliderCard
                      item={item}
                      index={idx}
                      onExpand={() => setActiveLightboxIndex(idx)}
                      isDraggingRef={isDraggingRef}
                      hasTreatmentDescription={hasTreatmentDesc}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Pagination & Indicateurs carte par carte */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 z-20 relative">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              Cas {currentIndex + 1} / {displayList.length}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
              {displayList.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Aller au cas ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex
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
      {/* MODAL / LIGHTBOX DE CAS CLINIQUE AGRANDI                      */}
      {/* ============================================================= */}
      {currentModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#0e1d32] border border-[#48cae4]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton Fermer accessible */}
            <button
              type="button"
              onClick={() => setActiveLightboxIndex(null)}
              aria-label="Fermer la vue détaillée"
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-red-500/30 hover:border-red-400 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Navigation Flèches Précédent / Suivant dans la modale */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : displayList.length - 1));
              }}
              aria-label="Voir le cas précédent"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-[#48cae4] hover:text-[#0c1a2e] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxIndex((prev) => (prev! < displayList.length - 1 ? prev! + 1 : 0));
              }}
              aria-label="Voir le cas suivant"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-[#48cae4] hover:text-[#0c1a2e] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer md:right-16"
            >
              <ChevronRight size={20} />
            </button>

            {/* Colonne Gauche : Image Haute Définition */}
            <div className="md:w-5/12 relative aspect-[4/3] md:aspect-auto min-h-[260px] bg-slate-950 overflow-hidden">
              <img
                src={getCleanImageSrc(currentModalItem.image, activeLightboxIndex!)}
                alt={currentModalItem.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = REAL_FALLBACK_IMAGES[activeLightboxIndex! % REAL_FALLBACK_IMAGES.length];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-[#0e1d32] opacity-70 md:opacity-40" />
              <div className="absolute top-4 left-4">
                <span className="py-1 px-3 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-bold text-[#48cae4] uppercase tracking-wider">
                  {currentModalItem.category}
                </span>
              </div>
            </div>

            {/* Colonne Droite : Fiche complète, Traitement lié & Redirection */}
            <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    Cas Clinique #{activeLightboxIndex! + 1}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#48cae4]" />
                  <span className="text-xs text-[#48cae4] font-semibold">Centre Expert ITID</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {currentModalItem.title}
                </h3>

                {/* Bloc Traitement & Pathologie */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#48cae4] tracking-wider block">
                        Traitement Correspondant :
                      </span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {currentModalItem.traitement_title || currentModalItem.traitement_slug?.replace(/-/g, " ")}
                      </p>
                    </div>

                    <Link
                      to={`/traitements/${currentModalItem.traitement_slug}`}
                      className="text-xs text-cyan-300 hover:text-white underline font-semibold shrink-0"
                    >
                      Détails →
                    </Link>
                  </div>

                  {currentModalItem.pathologie_slug && (
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-400">Pathologie ciblée : </span>
                      <Link
                        to={`/pathologies/${currentModalItem.pathologie_slug}`}
                        className="text-emerald-300 hover:underline font-medium"
                      >
                        {currentModalItem.pathologie_title || currentModalItem.pathologie_slug}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Description clinique complète */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Protocole & Résultat :
                  </span>
                  <p className="text-sm text-slate-200 font-light leading-relaxed whitespace-pre-line">
                    {currentModalItem.short_desc || "Prise en charge spécialisée et protocole mini-invasif réalisé par les médecins algologues de l'Institut."}
                  </p>
                </div>
              </div>

              {/* Barre d'action inférieure de la modale */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Naviguez avec les flèches ← → du clavier
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveLightboxIndex(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>

                  {Boolean(currentModalItem?.traitement_slug && treatmentsWithDesc.has(currentModalItem.traitement_slug.toLowerCase().trim())) ? (
                    <button
                      type="button"
                      onClick={() => {
                        const url = `/traitements/${currentModalItem.traitement_slug}`;
                        setActiveLightboxIndex(null);
                        navigate(url);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_25px_rgba(72,202,228,0.45)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Voir le traitement complet</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold flex items-center gap-1.5 select-none">
                      <span>🔒</span>
                      <span>Fiche traitement bientôt disponible</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
