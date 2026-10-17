import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Activity, HelpCircle, ArrowRight } from "lucide-react";
import { ImageCarousel } from "../ui/ImageCarousel";
import { TRAITEMENTS } from "../../data";

export function TreatmentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadTreatment() {
      try {
        const res = await fetch(`/api/cms/traitements?slug=${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.traitement) {
            setData(json.traitement);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Fallback on local treatment data", err);
      }

      // Fallback local data
      const cleanSlug = (slug || "").toLowerCase().trim();
      const found = TRAITEMENTS.find((tr: any) => {
        if (tr.slug && tr.slug === cleanSlug) return true;
        if (tr.title) {
          const keyPart = tr.title.replace("treatments.", "").replace(".title", "").toLowerCase();
          if (cleanSlug.includes(keyPart)) return true;
        }
        const trSlug = t(tr.title).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
        const normClean = cleanSlug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return trSlug.includes(normClean) || normClean.includes(trSlug) || (slug && tr.title.includes(slug));
      }) || TRAITEMENTS[0];

      setData({
        slug: (found as any).slug || slug || "infiltrations-rachidiennes",
        num: found.num || "01",
        icon: found.icon || "💉",
        title_fr: t(found.title),
        title_en: t(found.title),
        desc_front_fr: t(found.desc),
        desc_front_en: t(found.desc),
        desc_back_fr: t(found.desc) + "\n\nTraitement réalisé en ambulatoire sous anesthésie locale et guidage millimétrique par imagerie.",
        desc_back_en: t(found.desc) + "\n\nOutpatient procedure performed under local anesthesia and high-definition image guidance.",
        card_image: found.img || "/images/treatments/infiltrations_rachidiennes.jpg",
        hero_gallery: [
          found.img || "/images/treatments/infiltrations_rachidiennes.jpg",
          "/images/treatments/infiltrations_articulaires.jpg",
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop"
        ],
        section1_title_fr: "Indications & Douleurs Ciblées",
        section1_title_en: "Indications & Targeted Conditions",
        section1_text_fr: t(found.desc) + "\n\nCe geste s'adresse aux patients souffrant de douleurs chroniques rebelles lorsque les traitements médicamenteux se révèlent insuffisants.",
        section1_text_en: t(found.desc) + "\n\nThis interventional procedure is designed for patients with refractory pain when standard medications fail to deliver sufficient relief.",
        section1_image: found.img || "/images/treatments/infiltrations_rachidiennes.jpg",

        section2_title_fr: "Déroulement Précis du Geste sous Imagerie",
        section2_title_en: "Step-by-Step Guided Procedure",
        section2_text_fr: "Réalisé au bloc interventionnel stérile sous contrôle échographique ou scopique en temps réel. Le positionnement de précision garantit une sécurité maximale et un confort optimal.",
        section2_text_en: "Performed in a sterile interventional suite under real-time ultrasound or fluoroscopic imaging. Precision guidance ensures maximal clinical safety.",
        section2_image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",

        section3_title_fr: "Bénéfices Attendus & Suites Post-Interventionnelles",
        section3_title_en: "Expected Benefits & Recovery",
        section3_text_fr: "Soulagement significatif et rapide, permettant de reprendre les activités quotidiennes et le reconditionnement physique en toute sécurité.",
        section3_text_en: "Significant and sustained pain reduction, facilitating early rehabilitation and return to active daily living.",
        section3_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop",

        section4_title_fr: "Pathologies Associées Prises en Charge",
        section4_title_en: "Related Conditions Managed",
        section4_text_fr: "Ce geste est fréquemment associé à la prise en charge des lombalgies, arthropathies, névralgies et douleurs neuropathiques.",
        section4_text_en: "This procedure is regularly combined in the comprehensive management of spinal, joint, and neuropathic disorders.",
        section4_image: "/images/lombalgie.jpg"
      });
      setLoading(false);
    }

    loadTreatment();
  }, [slug, t]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0c1a2e] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-[#48cae4] border-t-transparent rounded-full animate-spin" />
          <span>{t("common.loading", "Chargement du traitement...")}</span>
        </div>
      </div>
    );
  }

  const title = lang === "en" ? (data.title_en || data.title_fr) : data.title_fr;
  const descBack = lang === "en" ? (data.desc_back_en || data.desc_back_fr) : data.desc_back_fr;
  const heroImages = data.hero_gallery && data.hero_gallery.length > 0 ? data.hero_gallery : [data.card_image || "/images/treatments/infiltrations_rachidiennes.jpg"];

  // Sections
  const s1Title = lang === "en" ? (data.section1_title_en || data.section1_title_fr) : data.section1_title_fr;
  const s1Text = lang === "en" ? (data.section1_text_en || data.section1_text_fr) : data.section1_text_fr;
  const s1Img = data.section1_image || data.card_image;

  const s2Title = lang === "en" ? (data.section2_title_en || data.section2_title_fr) : data.section2_title_fr;
  const s2Text = lang === "en" ? (data.section2_text_en || data.section2_text_fr) : data.section2_text_fr;
  const s2Img = data.section2_image || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop";

  const s3Title = lang === "en" ? (data.section3_title_en || data.section3_title_fr) : data.section3_title_fr;
  const s3Text = lang === "en" ? (data.section3_text_en || data.section3_text_fr) : data.section3_text_fr;
  const s3Img = data.section3_image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop";

  const s4Title = lang === "en" ? (data.section4_title_en || data.section4_title_fr) : data.section4_title_fr;
  const s4Text = lang === "en" ? (data.section4_text_en || data.section4_text_fr) : data.section4_text_fr;
  const s4Img = data.section4_image || "/images/lombalgie.jpg";

  return (
    <main className="min-h-screen bg-[#0c1a2e] text-white pt-28 md:pt-32 pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-[#48cae4]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-[#2a9d8f]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barre Retour & Fil d'Ariane */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/traitements"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-200 border border-white/10 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t("treatments.backToList", "← Retour aux traitements")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#48cae4]/15 border border-[#48cae4]/40 text-[#48cae4]">
              {t("treatments.badgeGeste", "Geste Interventionnel")} #{data.num || "01"}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE HAUT : CARROUSEL MULTI-PHOTOS + TITRE + DOCTOLIB */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#10243e]/90 via-[#0d1c31]/90 to-[#091524]/90 shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-center">
            
            {/* Colonne Gauche */}
            <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl bg-[#48cae4]/20 shadow-lg border border-[#48cae4]/30">
                  {data.icon || "💉"}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#48cae4]">
                    {t("treatments.expertCenter", "Plateau Technique ITID")}
                  </span>
                  <h1 
                    className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mt-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed mb-8 whitespace-pre-line">
                {descBack}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://www.doctolib.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_0_25px_rgba(72,202,228,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Calendar size={18} />
                  <span>{t("buttons.bookAppointment", "Prendre rendez-vous pour ce geste")}</span>
                </a>

                <Link
                  to="/pathologies"
                  className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <span>{t("treatments.viewPathologies", "Pathologies traitées")}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Colonne Droite : Carrousel Multi-Photos */}
            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[380px] relative overflow-hidden">
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
        {/* 4 SECTIONS EN LAYOUT ALTERNÉ (ZIG-ZAG) PHOTO / TEXTE       */}
        {/* ========================================================= */}
        <div className="space-y-16 md:space-y-24">

          {/* 🔹 SECTION 1 : Indications Cliniques (Photo Gauche / Texte Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] group">
                <img 
                  src={s1Img} 
                  alt={s1Title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0c1a2e]/80 backdrop-blur-md border border-white/10 text-xs text-cyan-200 flex items-center gap-2">
                  <Activity size={16} className="text-[#48cae4] shrink-0" />
                  <span>{t("treatments.s1Badge", "Indications médicales validées")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48cae4]/10 text-[#48cae4] text-xs font-bold uppercase tracking-wider border border-[#48cae4]/20">
                <span>01</span>
                <span>{t("treatments.step1Tag", "Pour qui ?")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s1Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s1Text}
              </p>
            </div>
          </section>

          {/* 🔹 SECTION 2 : Déroulement Précis (Texte Gauche / Photo Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold uppercase tracking-wider border border-[#2a9d8f]/20">
                <span>02</span>
                <span>{t("treatments.step2Tag", "Protocole Interventionnel")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s2Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s2Text}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] group">
                <img 
                  src={s2Img} 
                  alt={s2Title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0c1a2e]/80 backdrop-blur-md border border-white/10 text-xs text-emerald-200 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#2a9d8f] shrink-0" />
                  <span>{t("treatments.s2Badge", "Sécurité & guidage scopique")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 🔹 SECTION 3 : Bénéfices & Suites (Photo Gauche / Texte Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] group">
                <img 
                  src={s3Img} 
                  alt={s3Title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0c1a2e]/80 backdrop-blur-md border border-white/10 text-xs text-cyan-200 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#48cae4] shrink-0" />
                  <span>{t("treatments.s3Badge", "Récupération fonctionnelle rapide")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9c46a]/10 text-[#e9c46a] text-xs font-bold uppercase tracking-wider border border-[#e9c46a]/20">
                <span>03</span>
                <span>{t("treatments.step3Tag", "Efficacité & Suites")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s3Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s3Text}
              </p>
            </div>
          </section>

          {/* 🔹 SECTION 4 : Pathologies Liées (Texte Gauche / Photo Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#81b29a]/10 text-[#81b29a] text-xs font-bold uppercase tracking-wider border border-[#81b29a]/20">
                <span>04</span>
                <span>{t("treatments.step4Tag", "Pathologies Cibles")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s4Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s4Text}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] group">
                <img 
                  src={s4Img} 
                  alt={s4Title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0c1a2e]/80 backdrop-blur-md border border-white/10 text-xs text-emerald-200 flex items-center gap-2">
                  <HelpCircle size={16} className="text-[#81b29a] shrink-0" />
                  <span>{t("treatments.s4Badge", "Prise en charge intégrée")}</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE FINALE : PRISE DE RENDEZ-VOUS                     */}
        {/* ========================================================= */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#10243e] via-[#0d1c31] to-[#10243e] border border-[#48cae4]/30 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#48cae4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {t("treatments.ctaAppointmentTitle", "Consultez un spécialiste pour ce traitement")}
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-base sm:text-lg font-light">
            {t("treatments.ctaAppointmentSubtitle", "Nos médecins algologues évaluent votre situation pour déterminer l'indication exacte du geste.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.doctolib.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-base shadow-[0_0_30px_rgba(72,202,228,0.5)] hover:scale-105 transition-all flex items-center gap-2"
            >
              <Calendar size={20} />
              <span>{t("buttons.bookAppointment", "Prendre rendez-vous en ligne")}</span>
            </a>

            <Link
              to="/traitements"
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all"
            >
              {t("treatments.viewAll", "Voir tous les traitements")}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
