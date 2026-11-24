import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Activity, HelpCircle, ArrowRight, X } from "lucide-react";
import { ImageCarousel } from "../ui/ImageCarousel";
import { TRAITEMENTS, DEFAULT_TRAITEMENTS } from "../../data";
import { getCleanImageSrc, getCleanGallery, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";
import RichContentRenderer from "../ui/RichContentRenderer";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";
import { SEOHead } from "../seo/SEOHead";

export function TreatmentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [data, setData] = useState<any>(null);
  const [associatedCases, setAssociatedCases] = useState<any[]>([]);
  const [selectedModalCase, setSelectedModalCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Écouteur clavier Échap pour fermer la modale de cas clinique
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedModalCase(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadTreatment() {
      let treatmentData: any = null;
      try {
        const res = await fetch(`/api/cms/traitements?slug=${encodeURIComponent(slug || "")}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.traitement) {
            treatmentData = json.traitement;
            if (!treatmentData.sections && treatmentData.sections_json) {
              try {
                treatmentData.sections = typeof treatmentData.sections_json === "string" ? JSON.parse(treatmentData.sections_json) : treatmentData.sections_json;
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn("Fallback on local treatment data", err);
      }

      // Si recherche directe échoue, vérifier dans la liste globale du CMS
      if (!treatmentData) {
        try {
          const listRes = await fetch("/api/cms/traitements");
          if (listRes.ok) {
            const listJson = await listRes.json();
            const items = listJson.traitements || listJson.items || [];
            if (Array.isArray(items) && items.length > 0) {
              const cleanSlug = (slug || "").toLowerCase().trim();
              const foundInList = items.find((t: any) => {
                const tSlug = (t.slug || "").toLowerCase().trim();
                return tSlug === cleanSlug ||
                  (tSlug && (tSlug.includes(cleanSlug) || cleanSlug.includes(tSlug))) ||
                  (t.title_fr && t.title_fr.toLowerCase().includes(cleanSlug.replace(/-/g, " ")));
              });
              if (foundInList) {
                if (!foundInList.sections && foundInList.sections_json) {
                  try {
                    foundInList.sections = typeof foundInList.sections_json === "string" ? JSON.parse(foundInList.sections_json) : foundInList.sections_json;
                  } catch {}
                }
                treatmentData = foundInList;
              }
            }
          }
        } catch {}
      }

      if (!treatmentData) {
        const cleanSlug = (slug || "").toLowerCase().trim();
        const foundCanonical = DEFAULT_TRAITEMENTS.find((dt) => {
          const dtSlug = (dt.slug || "").toLowerCase().trim();
          return dtSlug === cleanSlug || (dtSlug && (dtSlug.includes(cleanSlug) || cleanSlug.includes(dtSlug)));
        });
        if (foundCanonical) {
          treatmentData = foundCanonical;
        } else {
          setData(null);
          try {
            const resCases = await fetch("/api/cms/cas_cliniques");
            if (resCases.ok) {
              const jsonCases = await resCases.json();
              const items = jsonCases.items || jsonCases.cases || [];
              const matched = items.filter((c: any) => (c.traitement_slug || "").toLowerCase().trim() === cleanSlug);
              setAssociatedCases(matched);
            }
          } catch {}
          setLoading(false);
          return;
        }
      }

      setData(treatmentData);

      // Charger les cas cliniques associés
      if (treatmentData.associated_cas_cliniques && treatmentData.associated_cas_cliniques.length > 0) {
        setAssociatedCases(treatmentData.associated_cas_cliniques);
      } else {
        try {
          const resCases = await fetch("/api/cms/cas_cliniques");
          if (resCases.ok) {
            const jsonCases = await resCases.json();
            const items = jsonCases.items || jsonCases.cases || [];
            const currentTrSlug = treatmentData.slug || slug;
            const matched = items.filter((c: any) => c.traitement_slug === currentTrSlug);
            setAssociatedCases(matched);
          }
        } catch {
          // Fallback silencieux
        }
      }

      setLoading(false);
    }

    loadTreatment();
  }, [slug, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f7f6] flex items-center justify-center text-[#1a3a5c]">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-[#2a9d8f] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-700">{t("common.loading", "Chargement du traitement...")}</span>
        </div>
      </div>
    );
  }

  const hasSections = (Array.isArray(data?.sections) && data.sections.length > 0) ||
    (data?.sections_json && data.sections_json !== "[]" && String(data.sections_json).trim() !== "");
  const hasTextDesc = Boolean(
    (data?.desc_back_fr && data.desc_back_fr.trim().length > 20) ||
    (data?.desc_front_fr && data.desc_front_fr.trim().length > 20) ||
    (data?.section1_title_fr && data.section1_title_fr.trim().length > 0)
  );
  const hasActiveDescription = Boolean(data && (hasSections || hasTextDesc));

  if (!data || !hasActiveDescription) {
    const displayTitle = data
      ? (lang === "en" ? (data.title_en || data.title_fr) : data.title_fr)
      : (slug ? slug.replace(/-/g, " ") : "Traitement Thérapeutique");

    return (
      <main className="min-h-screen bg-[#f0f7f6] text-[#1a3a5c] pt-24 md:pt-28 pb-16 relative overflow-hidden">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#48cae4]/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-[#2a9d8f]/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Link
            to="/traitements"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1a3a5c] border border-slate-200/90 text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>← Retour aux traitements</span>
          </Link>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#2a9d8f]/10 text-[#0d9488] border border-[#2a9d8f]/20 mx-auto flex items-center justify-center text-3xl shadow-xs">
              💉
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
              <span>Geste Interventionnel ITID</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c1a2e] capitalize leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {displayTitle}
            </h1>

            <p className="text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Ce geste thérapeutique fait partie des interventions de pointe pratiquées par l'équipe d'algologues de l'Institut du Traitement Interventionnel de la Douleur (ITID). 
              La fiche clinique complète et les recommandations détaillées sont actuellement en cours de finalisation par nos praticiens.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={DOCTOLIB_APPOINTMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_8px_20px_rgba(72,202,228,0.4)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar size={17} />
                <span>Prendre rendez-vous sur Doctolib</span>
              </a>

              <Link
                to="/traitements"
                className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-all cursor-pointer"
              >
                Tous les traitements
              </Link>
            </div>
          </div>

          {/* Si des cas cliniques existent pour ce geste, on les affiche */}
          {associatedCases.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-[#0c1a2e] flex items-center gap-2">
                <span>Cas cliniques d'interventions associés ({associatedCases.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {associatedCases.map((cs: any, idx: number) => (
                  <div
                    key={cs.id || idx}
                    onClick={() => setSelectedModalCase(cs)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#2a9d8f] hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={getCleanImageSrc(cs.image, idx)} alt={cs.title_fr} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-[#0d9488] block truncate">{cs.category_fr || "Cas Clinique"}</span>
                      <h4 className="font-bold text-sm text-[#0c1a2e] truncate">{cs.title_fr}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cs.short_desc_fr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  const title = lang === "en" ? (data.title_en || data.title_fr) : data.title_fr;
  const descBack = lang === "en" ? (data.desc_back_en || data.desc_back_fr) : data.desc_back_fr;
  const heroImages = getCleanGallery(data.hero_gallery, data.card_image, 3);

  // Configuration des styles et badges cycliques par défaut pour les sections
  const defaultSectionStyles = [
    { tag: t("treatments.step1Tag", "Pour qui ?"), badge: t("treatments.s1Badge", "Indications médicales validées"), color: "bg-[#2a9d8f]/10 text-[#0d9488] border-[#2a9d8f]/20", icon: <Activity size={15} className="text-[#0d9488] shrink-0" /> },
    { tag: t("treatments.step2Tag", "Protocole Interventionnel"), badge: t("treatments.s2Badge", "Sécurité & guidage scopique"), color: "bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20", icon: <ShieldCheck size={15} className="text-[#0284c7] shrink-0" /> },
    { tag: t("treatments.step3Tag", "Efficacité & Suites"), badge: t("treatments.s3Badge", "Récupération fonctionnelle rapide"), color: "bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/20", icon: <CheckCircle2 size={15} className="text-[#d97706] shrink-0" /> },
    { tag: t("treatments.step4Tag", "Pathologies Cibles"), badge: t("treatments.s4Badge", "Prise en charge intégrée"), color: "bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/20", icon: <HelpCircle size={15} className="text-[#0d9488] shrink-0" /> },
  ];

  // Sections dynamiques (avec rétro-compatibilité totale sur section1..4)
  const legacyS1Title = lang === "en" ? (data.section1_title_en || data.section1_title_fr) : data.section1_title_fr;
  const legacyS1Text = lang === "en" ? (data.section1_text_en || data.section1_text_fr) : data.section1_text_fr;
  const legacyS2Title = lang === "en" ? (data.section2_title_en || data.section2_title_fr) : data.section2_title_fr;
  const legacyS2Text = lang === "en" ? (data.section2_text_en || data.section2_text_fr) : data.section2_text_fr;
  const legacyS3Title = lang === "en" ? (data.section3_title_en || data.section3_title_fr) : data.section3_title_fr;
  const legacyS3Text = lang === "en" ? (data.section3_text_en || data.section3_text_fr) : data.section3_text_fr;
  const legacyS4Title = lang === "en" ? (data.section4_title_en || data.section4_title_fr) : data.section4_title_fr;
  const legacyS4Text = lang === "en" ? (data.section4_text_en || data.section4_text_fr) : data.section4_text_fr;

  const parsedSections = (Array.isArray(data.sections) && data.sections.length > 0)
    ? data.sections
    : (data.sections_json ? (typeof data.sections_json === "string" ? (JSON.parse(data.sections_json) || []) : data.sections_json) : []);

  const dynamicSections: any[] = (Array.isArray(parsedSections) && parsedSections.length > 0)
    ? parsedSections
    : [
        (legacyS1Title || legacyS1Text) && {
          title_fr: data.section1_title_fr,
          title_en: data.section1_title_en,
          text_fr: data.section1_text_fr,
          text_en: data.section1_text_en,
          image: data.section1_image || data.card_image,
          image_position: data.section1_image_position || "left",
          badge: data.section1_badge
        },
        (legacyS2Title || legacyS2Text) && {
          title_fr: data.section2_title_fr,
          title_en: data.section2_title_en,
          text_fr: data.section2_text_fr,
          text_en: data.section2_text_en,
          image: data.section2_image,
          image_position: data.section2_image_position || "right",
          badge: data.section2_badge
        },
        (legacyS3Title || legacyS3Text) && {
          title_fr: data.section3_title_fr,
          title_en: data.section3_title_en,
          text_fr: data.section3_text_fr,
          text_en: data.section3_text_en,
          image: data.section3_image,
          image_position: data.section3_image_position || "left",
          badge: data.section3_badge
        },
        (legacyS4Title || legacyS4Text) && {
          title_fr: data.section4_title_fr,
          title_en: data.section4_title_en,
          text_fr: data.section4_text_fr,
          text_en: data.section4_text_en,
          image: data.section4_image,
          image_position: data.section4_image_position || "right",
          badge: data.section4_badge
        },
      ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f0f7f6] text-[#1a3a5c] pt-24 md:pt-28 pb-16 relative overflow-hidden">
      <SEOHead
        title={`${title} | Traitement Douleur ITID Troyes`}
        description={descBack ? descBack.replace(/<[^>]*>?/gm, "").slice(0, 160) : `Protocole thérapeutique et geste interventionnel pour ${title} pratiqué à l'Institut ITID Troyes (10).`}
        canonicalUrl={`https://itid-france.com/traitements/${slug}`}
        ogImage={heroImages[0]}
        schemaType="MedicalProcedure"
        schemaCustomData={{
          "@type": "MedicalProcedure",
          name: title,
          description: descBack ? descBack.replace(/<[^>]*>?/gm, "").slice(0, 300) : title,
          procedureType: "Interventional",
          bodyLocation: title,
          howPerformed: "Guidage scopique et échographique de haute précision",
          relevantSpecialty: {
            "@type": "MedicalSpecialty",
            name: "Algologie / Médecine de la douleur"
          },
          provider: {
            "@type": "MedicalClinic",
            name: "ITID France — Institut du Traitement Interventionnel de la Douleur",
            url: "https://itid-france.com"
          }
        }}
        breadcrumbs={[
          { name: "Accueil", item: "https://itid-france.com/" },
          { name: "Traitements", item: "https://itid-france.com/traitements" },
          { name: title, item: `https://itid-france.com/traitements/${slug}` }
        ]}
      />
      {/* Background Decor - Lumineux et apaisant */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#48cae4]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-[#2a9d8f]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barre Retour & Fil d'Ariane */}
        <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <Link
            to="/traitements"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1a3a5c] border border-slate-200/90 text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t("treatments.backToList", "← Retour aux traitements")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2a9d8f]/10 border border-[#2a9d8f]/30 text-[#0d9488] shadow-xs">
              {t("treatments.badgeGeste", "Geste Interventionnel")} #{data.num || "01"}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE HAUT : CARROUSEL + TITRE + DOCTOLIB (CONFONDU)   */}
        {/* ========================================================= */}
        <section className="relative mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[340px] items-center">
            
            {/* Colonne Gauche : Titre, Icône & Présentation */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d8f]/10 text-[#0d9488] border border-[#2a9d8f]/20 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                <span>{t("treatments.expertCenter", "Plateau Technique ITID")}</span>
              </div>

              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl bg-white shadow-sm border border-slate-200/90 shrink-0">
                  {data.icon || "💉"}
                </div>
                <div>
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0c1a2e] leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-5 whitespace-pre-line">
                {descBack}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a
                  href={DOCTOLIB_APPOINTMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_8px_20px_-4px_rgba(42,157,143,0.35)] hover:brightness-105 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Calendar size={17} />
                  <span>{t("buttons.bookAppointment", "Prendre rendez-vous pour ce geste")}</span>
                </a>

                <Link
                  to="/pathologies"
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#1a3a5c] border border-slate-200/90 text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>{t("treatments.viewPathologies", "Pathologies traitées")}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Colonne Droite : Carrousel Multi-Photos */}
            <div className="lg:col-span-5 h-56 sm:h-72 lg:h-[350px] rounded-2xl overflow-hidden shadow-md border border-slate-200/90 relative bg-slate-100">
              <ImageCarousel 
                images={heroImages} 
                alt={title} 
                autoPlayInterval={3800}
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTIONS DÉTAILLÉES DYNAMIQUES (GAUCHE / DROITE / AUCUNE) */}
        {/* ========================================================= */}
        <div className="space-y-4 sm:space-y-6">
          {dynamicSections.map((sec: any, idx: number) => {
            const secNum = String(idx + 1).padStart(2, "0");
            const style = defaultSectionStyles[idx % defaultSectionStyles.length];
            const secTitle = lang === "en" ? (sec.title_en || sec.title_fr || sec.title) : (sec.title_fr || sec.title);
            const secText = lang === "en" ? (sec.text_en || sec.text_fr || sec.content_en || sec.content_fr || sec.content) : (sec.text_fr || sec.content_fr || sec.content);
            const secImg = sec.image ? getCleanImageSrc(sec.image, idx) : REAL_FALLBACK_IMAGES[idx % REAL_FALLBACK_IMAGES.length];
            const secPos = sec.image_position || (idx % 2 === 0 ? "left" : "right");
            const secTag = sec.badge || style.tag;
            const secSubBadge = sec.sub_badge || style.badge;

            if (!secTitle && !secText) return null;

            return (
              <section
                key={sec.id || idx}
                className="bg-white rounded-2xl p-4 sm:p-6 md:p-7 border border-slate-200/80 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                {secPos === "none" ? (
                  <div className="w-full space-y-2.5 sm:space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                      <span>{secNum}</span>
                      <span>{secTag}</span>
                    </div>
                    {secTitle && (
                      <h2
                        className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0c1a2e] leading-snug break-words"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {secTitle}
                      </h2>
                    )}
                    {secText && (
                      <div className="rich-content-light text-sm sm:text-base text-slate-600 font-normal leading-relaxed overflow-x-hidden">
                        <RichContentRenderer content={secText} theme="light" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 items-center">
                    <div className={`lg:col-span-5 ${secPos === "left" ? "order-2 lg:order-1" : "order-2"}`}>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs aspect-[4/3] group bg-slate-50">
                        <img 
                          src={secImg} 
                          alt={secTitle || title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.src = REAL_FALLBACK_IMAGES[idx % REAL_FALLBACK_IMAGES.length]; }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200/80 text-xs font-semibold text-[#0c1a2e] shadow-xs flex items-center gap-2">
                          {style.icon}
                          <span>{secSubBadge}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`lg:col-span-7 ${secPos === "left" ? "order-1 lg:order-2" : "order-1"} space-y-2.5 sm:space-y-3`}>
                      <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                        <span>{secNum}</span>
                        <span>{secTag}</span>
                      </div>
                      {secTitle && (
                        <h2
                          className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0c1a2e] leading-snug break-words"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {secTitle}
                        </h2>
                      )}
                      {secText && (
                        <div className="rich-content-light text-sm sm:text-base text-slate-600 font-normal leading-relaxed overflow-x-hidden">
                          <RichContentRenderer content={secText} theme="light" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

          {/* ========================================================= */}
          {/* CAS CLINIQUES ASSOCIÉS À CE TRAITEMENT                    */}
          {/* ========================================================= */}
          {associatedCases.length > 0 && (
            <section className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#2a9d8f]/10 text-[#0d9488] text-xs font-bold uppercase tracking-wider border border-[#2a9d8f]/20 mb-2">
                    <Activity size={13} />
                    <span>Preuves Cliniques & Retours d'Expérience</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0c1a2e] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    Cas Cliniques Traités par ce Geste
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-normal mt-0.5 max-w-2xl">
                    Découvrez des cas réels de patients pris en charge avec succès au centre ITID grâce à cette technique.
                  </p>
                </div>

                <Link
                  to="/#projets"
                  className="text-[#0284c7] hover:underline text-xs uppercase tracking-wider font-bold inline-flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                  <span>Tous les cas de l'accueil</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {associatedCases.map((c: any, idx: number) => {
                  const cTitle = lang === "en" ? (c.title_en || c.title_fr) : c.title_fr;
                  const cDesc = lang === "en" ? (c.short_desc_en || c.short_desc_fr) : (c.short_desc_fr || c.short_desc_en);
                  const cCat = lang === "en" ? (c.category_en || c.category_fr) : c.category_fr;
                  const cImg = getCleanImageSrc(c.image, idx);

                  return (
                    <div
                      key={c.id || idx}
                      onClick={() => setSelectedModalCase(c)}
                      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-slate-200/90 hover:border-[#2a9d8f]/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={cImg}
                          alt={cTitle}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = REAL_FALLBACK_IMAGES[idx % REAL_FALLBACK_IMAGES.length]; }}
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md border border-slate-200 text-[#0d9488] shadow-xs">
                            {cCat || "Cas Clinique"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
                        <div>
                          <h3 className="text-base font-bold text-[#0c1a2e] group-hover:text-[#0d9488] transition-colors leading-snug">
                            {cTitle}
                          </h3>
                          {cDesc && (
                            <p className="text-xs text-slate-600 line-clamp-2 font-normal mt-1 leading-relaxed">
                              {cDesc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[#0d9488] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Consulter la fiche <ArrowRight size={12} />
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            Détails
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* ========================================================= */}
        {/* MODALE DE PRÉSENTATION D'UN CAS CLINIQUE ASSOCIÉ          */}
        {/* ========================================================= */}
        {selectedModalCase && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedModalCase(null)}
          >
            <div
              className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedModalCase(null)}
                aria-label="Fermer la modale"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-900/70 border border-white/20 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Colonne Image */}
              <div className="md:w-5/12 relative aspect-[4/3] md:aspect-auto min-h-[220px] bg-slate-100 overflow-hidden">
                <img
                  src={getCleanImageSrc(selectedModalCase.image, 0)}
                  alt={selectedModalCase.title_fr}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = REAL_FALLBACK_IMAGES[0]; }}
                />
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md border border-slate-200 text-[#0d9488] shadow-xs">
                    {selectedModalCase.category_fr || "Cas Clinique"}
                  </span>
                </div>
              </div>

              {/* Colonne Contenu */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-4 overflow-y-auto bg-white">
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold block">
                    Cas Clinique d'Intervention
                  </span>
                  <h3 className="text-2xl font-bold text-[#0c1a2e] leading-tight">
                    {lang === "en" ? (selectedModalCase.title_en || selectedModalCase.title_fr) : selectedModalCase.title_fr}
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold uppercase text-[#0d9488] block">
                      Description & Prise en Charge :
                    </span>
                    <p className="text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-line">
                      {lang === "en"
                        ? (selectedModalCase.short_desc_en || selectedModalCase.short_desc_fr)
                        : (selectedModalCase.short_desc_fr || selectedModalCase.short_desc_en || "Prise en charge spécialisée et protocole mini-invasif réalisé par les médecins algologues de l'Institut.")}
                    </p>
                  </div>

                  {selectedModalCase.pathologie_slug && (
                    <div className="text-xs text-slate-600">
                      <span className="text-slate-500">Pathologie concernée : </span>
                      <Link
                        to={`/pathologies/${selectedModalCase.pathologie_slug}`}
                        className="text-[#0284c7] hover:underline font-bold"
                        onClick={() => setSelectedModalCase(null)}
                      >
                        Voir la fiche pathologie →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedModalCase(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Fermer la vue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BANNIÈRE FINALE : PRISE DE RENDEZ-VOUS                     */}
        {/* ========================================================= */}
        <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#10243e] via-[#0d1c31] to-[#10243e] text-center text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#48cae4]/15 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {t("treatments.ctaAppointmentTitle", "Consultez un spécialiste pour ce traitement")}
          </h3>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6 text-sm sm:text-base font-light leading-relaxed">
            {t("treatments.ctaAppointmentSubtitle", "Nos médecins algologues évaluent votre situation pour déterminer l'indication exacte du geste.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={DOCTOLIB_APPOINTMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_8px_20px_rgba(72,202,228,0.4)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={18} />
              <span>{t("buttons.bookAppointment", "Prendre rendez-vous en ligne")}</span>
            </a>

            <Link
              to="/traitements"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer"
            >
              {t("treatments.viewAll", "Voir tous les traitements")}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
export default TreatmentDetailPage;
