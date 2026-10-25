import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import { TRAITEMENTS } from "../../data";
import { CardFlip } from "../ui/CardFlip";
import { ContentNavigator } from "../ui/ContentNavigator";
import { ArrowRight } from "lucide-react";
import { Particles } from "../animations/Particles";
import { useIsMobile } from "../../hooks/useIsMobile";
import bgVideo from "../../images/video_intervention_ITID.mp4";
import { useTranslation } from "react-i18next";
import { getCleanImageSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";

function TreatmentFrontFace({ title, desc, img, index = 0 }: { title: string; desc: string; img: string; index?: number }) {
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

      <div className="relative z-10 flex flex-col h-full justify-end pb-4 overflow-hidden">
        <div className="translate-y-12 transition-all duration-500 ease-out group-hover:translate-y-0">
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug drop-shadow-lg text-center px-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <p className="mt-4 text-base sm:text-[18px] text-gray-300 leading-relaxed text-center px-4 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100 line-clamp-3">
            {desc}
          </p>
        </div>
      </div>
    </>
  );
}

function TreatmentBackFace({ desc, slug }: { desc: string; slug?: string }) {
  const { t } = useTranslation();
  const targetSlug = slug || "infiltrations-rachidiennes";

  return (
    <>
      <div className="flex-1 overflow-y-auto pr-2 mb-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <h3 className="text-xl font-semibold tracking-tight text-[#48cae4]">
          {t("common.learnMore", "En savoir plus")}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 relative z-30">
        <Link
          to={`/traitements/${targetSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-[0_0_20px_rgba(72,202,228,0.35)] hover:brightness-110 transition-all group cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-bold">
            {t("common.readFullFile", "Lire la fiche détaillée")}
          </span>
          <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>

        <a
          href="https://www.doctolib.fr"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
        >
          <span>{t("buttons.bookAppointment", "Prendre rendez-vous")}</span>
          <ArrowRight size={14} strokeWidth={2.25} />
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

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchTreatments() {
      try {
        const res = await fetch("/api/cms/traitements");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.traitements)) {
            setDynamicItems(data.traitements);
            setLoaded(true);
            return;
          }
        }
      } catch (e) {}
      setLoaded(true);
    }
    fetchTreatments();
  }, []);

  const items = loaded
    ? dynamicItems.map((item, idx) => ({
        ...item,
        title: lang === "en" ? (item.title_en || item.title_fr) : item.title_fr,
        desc: lang === "en" ? (item.desc_front_en || item.desc_front_fr) : item.desc_front_fr,
        descBack: lang === "en" ? (item.desc_back_en || item.desc_back_fr) : item.desc_back_fr,
        img: getCleanImageSrc(item.card_image || item.img, idx),
        slug: item.slug
      }))
    : TRAITEMENTS.map((item, idx) => ({
        ...item,
        title: t(item.title),
        desc: t(item.desc),
        descBack: t(item.desc),
        img: getCleanImageSrc(item.img, idx),
        slug: item.slug || ["infiltrations-rachidiennes", "infiltrations-articulaires", "perfusion-lidocaine", "stimulation-ganglion-dorsal", "cryoneurolyse", "rtms", "blocs-anesthesiques", "radiofrequence", "toxine-botulique", "tens", "catheter-perinerveux", "patch-capsaicine", "hypnovr", "stimulation-medullaire"][idx] || "infiltrations-rachidiennes"
      }));

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
              items={items}
              placeholder={t("common.chooseTreatment", "Choisir un traitement")}
              onSelect={handleSelect}
              theme="light"
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#1a3a5c] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("treatments.allOur", "Tous nos")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a5080] to-[#2a9d8f]">
              {t("treatments.title", "Traitements")}
            </span>
          </h2>

          <p className="text-base sm:text-lg leading-relaxed text-gray-600 font-light mb-10">
            {t(
              "treatments.subtitle",
              "Découvrez en détail les techniques interventionnelles guidées par imagerie proposées par l'ITID. Des solutions minimalement invasives pour votre soulagement."
            )}
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((traitement, idx) => {
            const isHighlighted = highlightedTitle === traitement.title;

            return (
              <div
                id={`traitement-${traitement.title}`}
                key={traitement.title}
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
                    />
                  }
                  back={<TreatmentBackFace desc={traitement.descBack || traitement.desc} slug={traitement.slug} />}
                  className="w-full h-[400px] sm:h-[440px] md:h-[480px]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
