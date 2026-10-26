import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import { TRAITEMENTS } from "../../data";
import { CardFlip } from "../ui/CardFlip";
import { ContentNavigator } from "../ui/ContentNavigator";
import { ArrowRight, Sparkles, Filter } from "lucide-react";
import { Particles } from "../animations/Particles";
import { useIsMobile } from "../../hooks/useIsMobile";
import bgVideo from "../../images/video_intervention_ITID.mp4";
import { useTranslation } from "react-i18next";
import { getCleanImageSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";

function TreatmentFrontFace({
  title,
  desc,
  img,
  index = 0,
  badge
}: {
  title: string;
  desc: string;
  img: string;
  index?: number;
  badge?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const cleanSrc = getCleanImageSrc(img, index);
  const fallback = REAL_FALLBACK_IMAGES[index % REAL_FALLBACK_IMAGES.length];
  const finalSrc = imgError ? fallback : cleanSrc;

  useEffect(() => {
    setImgError(false);
  }, [img]);

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[26px] bg-slate-950">
        <img
          src={finalSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] via-[#0c1a2e]/60 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between p-5 overflow-hidden">
        {badge ? (
          <div className="flex justify-start">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-[#48cae4] shadow-md flex items-center gap-1.5">
              <Sparkles size={11} className="text-[#48cae4]" />
              <span>{badge}</span>
            </span>
          </div>
        ) : <div />}

        <div className="translate-y-8 transition-all duration-500 ease-out group-hover:translate-y-0">
          <h3
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug drop-shadow-lg text-center px-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed text-center px-4 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100 line-clamp-3">
            {desc}
          </p>
        </div>
      </div>
    </>
  );
}

function TreatmentBackFace({
  desc,
  slug,
  hasDescription = false,
  badge,
  targetTitle
}: {
  desc: string;
  slug?: string;
  hasDescription?: boolean;
  badge?: string;
  targetTitle?: string;
}) {
  const { t } = useTranslation();
  const targetSlug = slug || "infiltrations-rachidiennes";

  return (
    <>
      <div className="flex-1 overflow-y-auto pr-2 mb-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-2">
        {badge && (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
            {badge}
          </span>
        )}
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#48cae4]">
          {t("common.learnMore", "Détails & Indications")}
        </h3>
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 relative z-30 pt-2 border-t border-white/10">
        {hasDescription ? (
          <Link
            to={`/traitements/${targetSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_20px_rgba(72,202,228,0.35)] hover:brightness-110 active:scale-95 transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-bold">
              {t("common.readFullFile", "Lire la fiche détaillée")}
            </span>
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div
            title="La fiche détaillée de ce geste est en cours de rédaction par nos praticiens"
            className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold text-xs select-none cursor-not-allowed"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <span>🔒</span>
              <span>Fiche détaillée en cours de rédaction</span>
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Bientôt</span>
          </div>
        )}

        <a
          href="https://www.doctolib.fr"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
        >
          <span>{t("buttons.bookAppointment", "Prendre rendez-vous")}</span>
          <ArrowRight size={13} strokeWidth={2.25} />
        </a>
      </div>
    </>
  );
}

export function TraitementsPremium() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const [dynamicCases, setDynamicCases] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "treatments" | "cases">("all");

  useEffect(() => {
    async function loadAllContent() {
      try {
        const [resTreatments, resCases] = await Promise.all([
          fetch("/api/cms/traitements").catch(() => null),
          fetch("/api/cms/cas_cliniques").catch(() => null)
        ]);

        if (resTreatments && resTreatments.ok) {
          const dataT = await resTreatments.json();
          if (dataT.success && Array.isArray(dataT.traitements)) {
            setDynamicItems(dataT.traitements);
          }
        }

        if (resCases && resCases.ok) {
          const dataC = await resCases.json();
          const itemsC = dataC.items || dataC.cases || [];
          if (Array.isArray(itemsC)) {
            setDynamicCases(itemsC);
          }
        }
      } catch (e) {
      } finally {
        setLoaded(true);
      }
    }
    loadAllContent();
  }, []);

  // Mappage des traitements configurés dans le CMS
  const treatmentsMapped = useMemo(() => {
    return dynamicItems.map((item, idx) => {
      const hasDesc = Boolean(
        (Array.isArray(item.sections) && item.sections.length > 0) ||
        (item.sections_json && item.sections_json !== "[]" && String(item.sections_json).trim() !== "") ||
        (item.desc_back_fr && item.desc_back_fr.trim().length > 20) ||
        (item.section1_title_fr && item.section1_title_fr.trim().length > 0)
      );

      return {
        id: `tr-${item.id || idx}`,
        title: lang === "en" ? (item.title_en || item.title_fr) : item.title_fr,
        desc: lang === "en" ? (item.desc_front_en || item.desc_front_fr) : item.desc_front_fr,
        descBack: lang === "en" ? (item.desc_back_en || item.desc_back_fr) : item.desc_back_fr,
        img: getCleanImageSrc(item.card_image || item.img, idx),
        slug: item.slug,
        badge: "Traitement Médical",
        hasDescription: hasDesc,
        itemType: "treatment" as const
      };
    });
  }, [dynamicItems, lang]);

  // Mappage des cas cliniques créés dans le CMS : s'ajoutent DIRECTEMENT dans la page traitement !
  const casesMapped = useMemo(() => {
    return dynamicCases.map((cs, idx) => {
      const trSlug = (cs.traitement_slug || "").toLowerCase().trim();
      const matchingTreatment = dynamicItems.find(t => (t.slug || "").toLowerCase().trim() === trSlug);
      const hasDesc = matchingTreatment
        ? Boolean(
            (Array.isArray(matchingTreatment.sections) && matchingTreatment.sections.length > 0) ||
            (matchingTreatment.sections_json && matchingTreatment.sections_json !== "[]" && String(matchingTreatment.sections_json).trim() !== "") ||
            (matchingTreatment.desc_back_fr && matchingTreatment.desc_back_fr.trim().length > 20) ||
            (matchingTreatment.section1_title_fr && matchingTreatment.section1_title_fr.trim().length > 0)
          )
        : false;

      return {
        id: `case-${cs.id || idx}`,
        title: lang === "en" ? (cs.title_en || cs.title_fr) : cs.title_fr,
        desc: lang === "en" ? (cs.short_desc_en || cs.short_desc_fr) : cs.short_desc_fr,
        descBack: lang === "en" ? (cs.short_desc_en || cs.short_desc_fr) : cs.short_desc_fr,
        img: getCleanImageSrc(cs.image, idx + 5),
        slug: cs.traitement_slug || "infiltrations-rachidiennes",
        badge: lang === "en" ? (cs.category_en || cs.category_fr || "Cas d'Intervention") : (cs.category_fr || "Cas d'Intervention"),
        hasDescription: hasDesc,
        itemType: "case" as const
      };
    });
  }, [dynamicCases, dynamicItems, lang]);

  // Union intelligente des cartes
  const allItems = useMemo(() => {
    if (!loaded) return [];
    
    // Si la base en ligne a des données (traitements ou cas cliniques)
    if (treatmentsMapped.length > 0 || casesMapped.length > 0) {
      return [...treatmentsMapped, ...casesMapped];
    }

    // Si vraiment tout est vide en base (0 traitement et 0 cas créé), on reste vide pour respecter le CMS
    return [];
  }, [loaded, treatmentsMapped, casesMapped]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "treatments") {
      return allItems.filter(item => item.itemType === "treatment");
    }
    if (activeFilter === "cases") {
      return allItems.filter(item => item.itemType === "case");
    }
    return allItems;
  }, [allItems, activeFilter]);

  const [highlightedTitle, setHighlightedTitle] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleSelect = (item: any) => {
    setHighlightedTitle(item.title);

    setTimeout(() => {
      const element = document.getElementById(`traitement-${item.title}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedTitle((current) => (current === item.title ? null : current));
    }, 4000);
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 min-h-screen text-[#1a3a5c] relative overflow-hidden">
      {/* Interactive Particles Constellation Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={bgVideo}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, rgba(42,157,143,0.15), transparent 60%), radial-gradient(90% 80% at 50% 100%, rgba(72,209,194,0.10), transparent 65%)",
          }}
        />
        <Particles quantity={180} connectDistance={120} repelRadius={140} />
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 relative z-10">
        {/* Barre supérieure : Retour (gauche) & Sélecteur (droite) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 relative z-50">
          <div className="w-full sm:w-auto flex justify-start">
            <ShimmerButton as="Link" to="/">
              ← {t("common.backHome", "Retour à l'accueil")}
            </ShimmerButton>
          </div>

          <div className="w-full sm:w-72 md:w-80 text-left">
            <ContentNavigator
              items={filteredItems}
              placeholder={t("common.chooseTreatment", "Choisir un traitement")}
              onSelect={handleSelect}
              theme="light"
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 text-[#1a3a5c] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("treatments.allOur", "Tous nos")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a5080] to-[#2a9d8f]">
              {t("treatments.title", "Traitements & Gestes Interventionnels")}
            </span>
          </h2>

          <p className="text-base sm:text-lg leading-relaxed text-gray-600 font-light mb-6">
            {t(
              "treatments.subtitle",
              "Découvrez en détail les techniques interventionnelles guidées par imagerie proposées par l'ITID. Des solutions minimalement invasives pour votre soulagement."
            )}
          </p>

          {/* Filtres par catégorie si traitements et cas cliniques coexistent */}
          {treatmentsMapped.length > 0 && casesMapped.length > 0 && (
            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-[#2a9d8f] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0c1a2e]"
                }`}
              >
                Tous nos gestes & cas ({allItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("treatments")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "treatments"
                    ? "bg-[#2a9d8f] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0c1a2e]"
                }`}
              >
                Traitements ({treatmentsMapped.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("cases")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "cases"
                    ? "bg-[#2a9d8f] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#0c1a2e]"
                }`}
              >
                Cas d'Intervention ({casesMapped.length})
              </button>
            </div>
          )}
        </div>

        {/* Grid Section */}
        {filteredItems.length === 0 && loaded ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 md:p-14 border border-slate-200/80 shadow-xs text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2a9d8f]/10 text-[#0d9488] border border-[#2a9d8f]/20 mx-auto flex items-center justify-center text-3xl">
              🩺
            </div>
            <h3 className="text-2xl font-bold text-[#0c1a2e]" style={{ fontFamily: "var(--font-display)" }}>
              Fiches et cas d'interventions en cours de mise en ligne
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Nos praticiens sont en train d'actualiser les fiches détaillées de nos traitements interventionnels.
              Vous pouvez nous contacter ou prendre directement rendez-vous pour une consultation personnalisée.
            </p>
            <div className="pt-2">
              <a
                href="https://www.doctolib.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <span>Prendre rendez-vous sur Doctolib</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((traitement, idx) => {
              const isHighlighted = highlightedTitle === traitement.title;

              return (
                <div
                  id={`traitement-${traitement.title}`}
                  key={traitement.id || traitement.title}
                  className={`relative rounded-[28px] p-2 transition-all duration-700 ${
                    isHighlighted
                      ? "scale-105 shadow-[0_0_50px_rgba(72,209,194,0.8)] z-30"
                      : "hover:scale-[1.02]"
                  }`}
                  style={{
                    background: isHighlighted
                      ? "linear-gradient(135deg, #48cae4, #2a9d8f)"
                      : "transparent",
                  }}
                >
                  <CardFlip
                    front={
                      <TreatmentFrontFace
                        title={traitement.title}
                        desc={traitement.desc}
                        img={traitement.img}
                        index={idx}
                        badge={traitement.badge}
                      />
                    }
                    back={
                      <TreatmentBackFace
                        desc={traitement.descBack || traitement.desc}
                        slug={traitement.slug}
                        hasDescription={traitement.hasDescription}
                        badge={traitement.badge}
                        targetTitle={traitement.title}
                      />
                    }
                    className="w-full h-[400px] sm:h-[440px] md:h-[480px]"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default TraitementsPremium;
