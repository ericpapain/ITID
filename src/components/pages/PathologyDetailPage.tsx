import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ShieldCheck, CheckCircle2, Activity, HelpCircle, ArrowRight } from "lucide-react";
import { ImageCarousel } from "../ui/ImageCarousel";
import { ShimmerButton } from "../ui/ShimmerButton";
import { PATHOLOGIES } from "../../data";

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
        const res = await fetch(`/api/cms/pathologies?slug=${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.pathology) {
            setData(json.pathology);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Fallback on local pathology data", err);
      }

      // Fallback local data if API not responding
      const cleanSlug = (slug || "").toLowerCase().trim();
      const found = PATHOLOGIES.find((p: any) => {
        if (p.slug && (p.slug === cleanSlug || (cleanSlug === "migraine" && p.slug === "migraines") || (cleanSlug === "migraines" && p.slug === "migraine"))) {
          return true;
        }
        if (p.title) {
          const keyPart = p.title.replace("pathologies.", "").replace(".title", "").toLowerCase();
          if (cleanSlug.includes(keyPart) || keyPart.includes(cleanSlug)) return true;
        }
        const pSlug = t(p.title).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
        const normClean = cleanSlug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return pSlug.includes(normClean) || normClean.includes(pSlug);
      }) || PATHOLOGIES[0];

      setData({
        slug: (found as any).slug || slug || "lombalgie-chronique",
        title_fr: t(found.title),
        title_en: t(found.title),
        icon: found.icon || "🩺",
        color: found.color || "#48d1c2",
        short_desc_fr: t(found.desc),
        short_desc_en: t(found.desc),
        card_image: found.img || "/images/lombalgie.jpg",
        hero_gallery: [
          found.img || "/images/lombalgie.jpg",
          "/images/glowing_3d_spine.jpg",
          "/images/spine_isolated.png"
        ],
        section1_title_fr: "Comprendre la Pathologie",
        section1_title_en: "Understanding the Condition",
        section1_text_fr: t(found.desc) + "\n\nÀ l'ITID, notre approche repose sur une évaluation ciblée permettant d'identifier précisément les générateurs de douleur anatomiques.",
        section1_text_en: t(found.desc) + "\n\nAt ITID, our approach is based on targeted assessment to precisely pinpoint anatomical pain generators.",
        section1_image: found.img || "/images/lombalgie.jpg",

        section2_title_fr: "Quand et Comment se faire Diagnostiquer ?",
        section2_title_en: "When & How to Get Diagnosed?",
        section2_text_fr: "Une consultation spécialisée est recommandée dès lors que la douleur persiste plus de 6 semaines ou impacte le sommeil et l'activité professionnelle.\n\nLe diagnostic algologique associe examen clinique minutieux et imagerie moderne haute résolution.",
        section2_text_en: "Specialist consultation is recommended when pain persists over 6 weeks or disrupts sleep and daily activities.\n\nDiagnosis pairs precise clinical evaluation with modern high-resolution imaging.",
        section2_image: "/images/glowing_3d_spine.jpg",

        section3_title_fr: "Prise en Charge Interventionnelle à l'ITID",
        section3_title_en: "Interventional Care at ITID",
        section3_text_fr: "Nous proposons des techniques guidées par imagerie de pointe :\n• Infiltrations ciblées sous guidage millimétrique\n• Radiofréquence pulsée et cryoneurolyse\n• Protocoles individualisés de neuromodulation.",
        section3_text_en: "We offer advanced image-guided interventional therapies:\n• Targeted injections under millimeter guidance\n• Pulsed radiofrequency & cryoneurolysis\n• Customized neuromodulation protocols.",
        section3_image: "/images/treatments/infiltrations_rachidiennes.jpg",

        section4_title_fr: "Prévention & Conseils au Quotidien",
        section4_title_en: "Prevention & Daily Advice",
        section4_text_fr: "La réadaptation active, la posture ergonomique et la nutrition anti-inflammatoire permettent de maintenir un soulagement durable et de prévenir les récidives.",
        section4_text_en: "Active rehabilitation, ergonomic posture, and anti-inflammatory lifestyle measures sustain long-term relief and prevent recurrences.",
        section4_image: "/images/spine_isolated.png"
      });
      setLoading(false);
    }

    loadPathology();
  }, [slug, t]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0c1a2e] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-[#48cae4] border-t-transparent rounded-full animate-spin" />
          <span>{t("common.loading", "Chargement de la fiche médicale...")}</span>
        </div>
      </div>
    );
  }

  const title = lang === "en" ? (data.title_en || data.title_fr) : data.title_fr;
  const shortDesc = lang === "en" ? (data.short_desc_en || data.short_desc_fr) : data.short_desc_fr;
  const heroImages = data.hero_gallery && data.hero_gallery.length > 0 ? data.hero_gallery : [data.card_image || "/images/lombalgie.jpg"];

  // Sections data
  const s1Title = lang === "en" ? (data.section1_title_en || data.section1_title_fr) : data.section1_title_fr;
  const s1Text = lang === "en" ? (data.section1_text_en || data.section1_text_fr) : data.section1_text_fr;
  const s1Img = data.section1_image || data.card_image;

  const s2Title = lang === "en" ? (data.section2_title_en || data.section2_title_fr) : data.section2_title_fr;
  const s2Text = lang === "en" ? (data.section2_text_en || data.section2_text_fr) : data.section2_text_fr;
  const s2Img = data.section2_image || "/images/glowing_3d_spine.jpg";

  const s3Title = lang === "en" ? (data.section3_title_en || data.section3_title_fr) : data.section3_title_fr;
  const s3Text = lang === "en" ? (data.section3_text_en || data.section3_text_fr) : data.section3_text_fr;
  const s3Img = data.section3_image || "/images/treatments/infiltrations_rachidiennes.jpg";

  const s4Title = lang === "en" ? (data.section4_title_en || data.section4_title_fr) : data.section4_title_fr;
  const s4Text = lang === "en" ? (data.section4_text_en || data.section4_text_fr) : data.section4_text_fr;
  const s4Img = data.section4_image || "/images/spine_isolated.png";

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
            to="/pathologies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-200 border border-white/10 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t("pathologies.backToList", "← Retour aux pathologies")}</span>
          </Link>

          <span 
            className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
            style={{
              color: data.color || '#48cae4',
              borderColor: `${data.color || '#48cae4'}40`,
              backgroundColor: `${data.color || '#48cae4'}15`
            }}
          >
            {t("pathologies.badgeSpecialized", "Fiche Thérapeutique ITID")}
          </span>
        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE HAUT : CARROUSEL MULTI-PHOTOS HD + TITRE + CTA   */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#10243e]/90 via-[#0d1c31]/90 to-[#091524]/90 shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-center">
            
            {/* Colonne Gauche : Titre, Icône & Présentation synthétique */}
            <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-5">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border border-white/20"
                  style={{ backgroundColor: `${data.color || '#48cae4'}25` }}
                >
                  {data.icon || "🩺"}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#48cae4]">
                    {t("pathologies.expertAssessment", "Centre Expert Douleur")}
                  </span>
                  <h1 
                    className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mt-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h1>
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed mb-8">
                {shortDesc}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://www.doctolib.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_0_25px_rgba(72,202,228,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Calendar size={18} />
                  <span>{t("buttons.bookAppointment", "Prendre rendez-vous en consultation")}</span>
                </a>

                {data.wikipedia_url && (
                  <a
                    href={data.wikipedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <span>{t("common.medicalWiki", "Ressource médicale")}</span>
                    <ArrowRight size={15} />
                  </a>
                )}
              </div>
            </div>

            {/* Colonne Droite : Carrousel Multi-Images Défilant */}
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

          {/* 🔹 SECTION 1 : Comprendre la maladie (Photo Gauche / Texte Droite) */}
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
                  <span>{t("pathologies.s1Badge", "Compréhension clinique approfondie")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48cae4]/10 text-[#48cae4] text-xs font-bold uppercase tracking-wider border border-[#48cae4]/20">
                <span>01</span>
                <span>{t("pathologies.step1Tag", "Mécanismes & Origines")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s1Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s1Text}
              </p>
            </div>
          </section>

          {/* 🔹 SECTION 2 : Diagnostic & Quand consulter (Texte Gauche / Photo Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold uppercase tracking-wider border border-[#2a9d8f]/20">
                <span>02</span>
                <span>{t("pathologies.step2Tag", "Signes d'Alerte & Bilan")}</span>
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
                  <span>{t("pathologies.s2Badge", "Imagerie & diagnostic de haute précision")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 🔹 SECTION 3 : Traitements ITID Associés (Photo Gauche / Texte Droite) */}
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
                  <span>{t("pathologies.s3Badge", "Gestes interventionnels mini-invasifs")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9c46a]/10 text-[#e9c46a] text-xs font-bold uppercase tracking-wider border border-[#e9c46a]/20">
                <span>03</span>
                <span>{t("pathologies.step3Tag", "Solutions Thérapeutiques")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s3Title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed whitespace-pre-line">
                {s3Text}
              </p>

              <div className="pt-2">
                <Link
                  to="/traitements"
                  className="inline-flex items-center gap-2 text-[#48cae4] font-bold text-sm hover:underline"
                >
                  <span>{t("pathologies.viewAllTreatments", "Explorer tous nos gestes interventionnels")}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          {/* 🔹 SECTION 4 : Prévention & Conseils au quotidien (Texte Gauche / Photo Droite) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#81b29a]/10 text-[#81b29a] text-xs font-bold uppercase tracking-wider border border-[#81b29a]/20">
                <span>04</span>
                <span>{t("pathologies.step4Tag", "Conseils & Prévention")}</span>
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
                  <span>{t("pathologies.s4Badge", "Accompagnement & réadaptation durable")}</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ========================================================= */}
        {/* BANNIÈRE FINALE : PRISE DE RENDEZ-VOUS DOCTOLIB           */}
        {/* ========================================================= */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#10243e] via-[#0d1c31] to-[#10243e] border border-[#48cae4]/30 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#48cae4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {t("pathologies.ctaTitle", "Souffrez-vous de cette pathologie ?")}
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-base sm:text-lg font-light">
            {t("pathologies.ctaSubtitle", "Prenez rendez-vous avec notre équipe d'algologues interventionnels pour un bilan personnalisé et ciblé.")}
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
              to="/#contact"
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all"
            >
              {t("common.contactUs", "Contacter l'institut")}
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
