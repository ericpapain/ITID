import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Activity, HelpCircle, ArrowRight } from "lucide-react";
import { ImageCarousel } from "../ui/ImageCarousel";
import { PATHOLOGIES, DEFAULT_PATHOLOGIES } from "../../data";
import { getCleanImageSrc, getCleanGallery, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";
import RichContentRenderer from "../ui/RichContentRenderer";

export function PathologyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadPathology() {
      try {
        const res = await fetch(`/api/cms/pathologies?slug=${encodeURIComponent(slug || "")}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.pathology) {
            const p = json.pathology;
            if (!p.sections && p.sections_json) {
              try {
                p.sections = typeof p.sections_json === "string" ? JSON.parse(p.sections_json) : p.sections_json;
              } catch {}
            }
            setData(p);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Fallback on local pathology data", err);
      }

      // Si recherche directe échoue, vérifier dans la liste globale du CMS
      try {
        const listRes = await fetch("/api/cms/pathologies");
        if (listRes.ok) {
          const listJson = await listRes.json();
          const items = listJson.pathologies || listJson.items || [];
          if (Array.isArray(items) && items.length > 0) {
            const cleanSlug = (slug || "").toLowerCase().trim();
            const foundInList = items.find((p: any) => {
              const pSlug = (p.slug || "").toLowerCase().trim();
              return pSlug === cleanSlug ||
                (pSlug && (pSlug.includes(cleanSlug) || cleanSlug.includes(pSlug))) ||
                (p.title_fr && p.title_fr.toLowerCase().includes(cleanSlug.replace(/-/g, " ")));
            });
            if (foundInList) {
              if (!foundInList.sections && foundInList.sections_json) {
                try {
                  foundInList.sections = typeof foundInList.sections_json === "string" ? JSON.parse(foundInList.sections_json) : foundInList.sections_json;
                } catch {}
              }
              setData(foundInList);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      // Recherche dans les fiches de repli de base si le serveur n'a pas répondu
      const cleanSlug = (slug || "").toLowerCase().trim();
      const detailed = DEFAULT_PATHOLOGIES.find((dp) => {
        const dpSlug = (dp.slug || "").toLowerCase().trim();
        return dpSlug === cleanSlug ||
          (dpSlug && (dpSlug.includes(cleanSlug) || cleanSlug.includes(dpSlug))) ||
          (dp.title_fr && dp.title_fr.toLowerCase().includes(cleanSlug.replace(/-/g, " ")));
      });

      setData(detailed || null);
      setLoading(false);
    }

    loadPathology();
  }, [slug, t]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#f0f7f6] flex items-center justify-center text-[#1a3a5c]">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-[#2a9d8f] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-slate-700">{t("common.loading", "Chargement de la fiche médicale...")}</span>
        </div>
      </div>
    );
  }

  const title = lang === "en" ? (data.title_en || data.title_fr) : data.title_fr;
  const shortDesc = lang === "en" ? (data.short_desc_en || data.short_desc_fr) : data.short_desc_fr;
  const heroImages = getCleanGallery(data.hero_gallery, data.card_image, 3);

  // Configuration des styles et badges cycliques par défaut pour les sections
  const defaultSectionStyles = [
    { tag: t("pathologies.step1Tag", "Mécanismes & Origines"), badge: t("pathologies.s1Badge", "Compréhension clinique approfondie"), color: "bg-[#2a9d8f]/10 text-[#0d9488] border-[#2a9d8f]/20", icon: <Activity size={15} className="text-[#0d9488] shrink-0" /> },
    { tag: t("pathologies.step2Tag", "Signes d'Alerte & Bilan"), badge: t("pathologies.s2Badge", "Imagerie & diagnostic de haute précision"), color: "bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20", icon: <ShieldCheck size={15} className="text-[#0284c7] shrink-0" /> },
    { tag: t("pathologies.step3Tag", "Solutions Thérapeutiques"), badge: t("pathologies.s3Badge", "Gestes interventionnels mini-invasifs"), color: "bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/20", icon: <CheckCircle2 size={15} className="text-[#d97706] shrink-0" /> },
    { tag: t("pathologies.step4Tag", "Conseils & Prévention"), badge: t("pathologies.s4Badge", "Accompagnement & réadaptation durable"), color: "bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/20", icon: <HelpCircle size={15} className="text-[#0d9488] shrink-0" /> },
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

  const treatmentSectionIndex = (() => {
    const byBadge = dynamicSections.findIndex((s: any) => /solution|traitement/i.test(s.badge || s.title_fr || s.title_en || ""));
    if (byBadge !== -1) return byBadge;
    if (dynamicSections.length >= 3) return 2;
    return dynamicSections.length - 1;
  })();

  return (
    <main className="min-h-screen bg-[#f0f7f6] text-[#1a3a5c] pt-24 md:pt-28 pb-16 relative overflow-hidden font-sans">
      {/* Background Decor - Doux et lumineux */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#48cae4]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-[#2a9d8f]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barre Retour & Fil d'Ariane */}
        <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
          <Link
            to="/pathologies"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1a3a5c] border border-slate-200/90 text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t("pathologies.backToList", "← Retour aux pathologies")}</span>
          </Link>

          <span 
            className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs"
            style={{
              color: '#0d9488',
              borderColor: 'rgba(13, 148, 136, 0.3)',
              backgroundColor: 'rgba(13, 148, 136, 0.08)'
            }}
          >
            {t("pathologies.badgeSpecialized", "Fiche Thérapeutique ITID")}
          </span>
        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE HAUT : CARROUSEL + TITRE + CTA (CONFONDU AU FOND)*/}
        {/* ========================================================= */}
        <section className="relative mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[340px] items-center">
            
            {/* Colonne Gauche : Titre, Icône & Présentation synthétique */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d8f]/10 text-[#0d9488] border border-[#2a9d8f]/20 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                <span>{t("pathologies.expertAssessment", "Centre Expert Douleur")}</span>
              </div>

              <div className="flex items-start gap-3.5 mb-3.5">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm bg-white border border-slate-200/90 shrink-0"
                >
                  {data.icon || "🩺"}
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

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-5">
                {shortDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.doctolib.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_8px_20px_-4px_rgba(42,157,143,0.35)] hover:brightness-105 hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar size={17} />
                  <span>{t("buttons.bookAppointment", "Prendre rendez-vous en consultation")}</span>
                </a>

                {data.wikipedia_url && (
                  <a
                    href={data.wikipedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#1a3a5c] border border-slate-200/90 text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t("common.medicalWiki", "Ressource médicale")}</span>
                    <ArrowRight size={15} />
                  </a>
                )}
              </div>
            </div>

            {/* Colonne Droite : Carrousel Multi-Images Défilant */}
            <div className="lg:col-span-5 h-64 sm:h-72 lg:h-[350px] rounded-2xl overflow-hidden shadow-md border border-slate-200/90 relative bg-slate-100">
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
        {/* SECTIONS DYNAMIQUES CONFIGURABLES (GAUCHE / DROITE / AUCUNE) */}
        {/* ========================================================= */}
        <div className="space-y-4 sm:space-y-6">
          {dynamicSections.map((sec: any, idx: number) => {
            const style = defaultSectionStyles[idx % defaultSectionStyles.length];
            const secNum = String(idx + 1).padStart(2, "0");
            const secTitle = lang === "en" ? (sec.title_en || sec.title_fr || sec.title) : (sec.title_fr || sec.title);
            const secText = lang === "en" ? (sec.text_en || sec.text_fr || sec.content_en || sec.content_fr || sec.content) : (sec.text_fr || sec.content_fr || sec.content);
            const secImg = sec.image ? getCleanImageSrc(sec.image, idx) : REAL_FALLBACK_IMAGES[idx % REAL_FALLBACK_IMAGES.length];
            const secPos = sec.image_position || (idx % 2 === 0 ? "left" : "right");
            const secTag = sec.badge || style.tag;
            const secSubBadge = sec.sub_badge || style.badge;
            const isTreatmentSection = idx === treatmentSectionIndex && data.associated_traitements && data.associated_traitements.length > 0;

            if (!secTitle && !secText) return null;

            return (
              <section
                key={sec.id || idx}
                className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 border border-slate-200/80 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.03)]"
              >
                {secPos === "none" ? (
                  <div className="w-full space-y-2.5 sm:space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                      <span>{secNum}</span>
                      <span>{secTag}</span>
                    </div>
                    {secTitle && (
                      <h2
                        className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0c1a2e] leading-snug"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {secTitle}
                      </h2>
                    )}
                    {secText && (
                      <div className="rich-content-light text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                        <RichContentRenderer content={secText} />
                      </div>
                    )}

                    {isTreatmentSection && (
                      <>
                        <div className="pt-3 space-y-2">
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                            Traitements recommandés pour cette pathologie :
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {data.associated_traitements.map((tr: any) => (
                              <Link
                                key={tr.slug}
                                to={`/traitements/${tr.slug}`}
                                className="px-3.5 py-1.5 rounded-xl bg-[#f0f7f6] hover:bg-[#e0f0ed] border border-[#2a9d8f]/30 text-[#0c1a2e] text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs group"
                              >
                                <span>{tr.title_fr}</span>
                                <ArrowRight size={12} className="text-[#2a9d8f] group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <Link
                            to="/traitements"
                            className="inline-flex items-center gap-1.5 text-[#0284c7] font-bold text-xs sm:text-sm hover:underline"
                          >
                            <span>{t("pathologies.viewAllTreatments", "Explorer tous nos gestes interventionnels")}</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </>
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
                          className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0c1a2e] leading-snug"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {secTitle}
                        </h2>
                      )}
                      {secText && (
                        <div className="rich-content-light text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                          <RichContentRenderer content={secText} />
                        </div>
                      )}

                      {isTreatmentSection && (
                        <>
                          <div className="pt-2 space-y-1.5">
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                              Traitements recommandés pour cette pathologie :
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {data.associated_traitements.map((tr: any) => (
                                <Link
                                  key={tr.slug}
                                  to={`/traitements/${tr.slug}`}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#f0f7f6] hover:bg-[#e0f0ed] border border-[#2a9d8f]/30 text-[#0c1a2e] text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs group"
                                >
                                  <span>{tr.title_fr}</span>
                                  <ArrowRight size={12} className="text-[#2a9d8f] group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <Link
                              to="/traitements"
                              className="inline-flex items-center gap-1.5 text-[#0284c7] font-bold text-xs sm:text-sm hover:underline"
                            >
                              <span>{t("pathologies.viewAllTreatments", "Explorer tous nos gestes interventionnels")}</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE FINALE : PRISE DE RENDEZ-VOUS DOCTOLIB           */}
        {/* ========================================================= */}
        <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#10243e] via-[#0d1c31] to-[#10243e] text-center text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#48cae4]/15 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {t("pathologies.ctaTitle", "Souffrez-vous de cette pathologie ?")}
          </h3>
          <p className="text-slate-300 max-w-2xl mx-auto mb-6 text-sm sm:text-base font-light leading-relaxed">
            {t("pathologies.ctaSubtitle", "Prenez rendez-vous avec notre équipe d'algologues interventionnels pour un bilan personnalisé et ciblé.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.doctolib.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_8px_20px_rgba(72,202,228,0.4)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={18} />
              <span>{t("buttons.bookAppointment", "Prendre rendez-vous en ligne")}</span>
            </a>

            <Link
              to="/#contact"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer"
            >
              {t("common.contactUs", "Contacter l'institut")}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
export default PathologyDetailPage;
