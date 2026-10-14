import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Particles } from "../animations/Particles";
import { ShimmerButton } from "../ui/ShimmerButton";
import { useTranslation } from "react-i18next";
import { BLOG_ARTICLES } from "../../data/blogData";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Newspaper, Calendar } from "lucide-react";

export function ImmersionSection() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  const [articles, setArticles] = useState<any[]>([]);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Chargement des articles CMS
  useEffect(() => {
    let isMounted = true;
    async function loadCmsArticles() {
      try {
        const res = await fetch("/api/cms/articles");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles(data.articles);
            return;
          }
        }
      } catch (e) {
        // Fallback silencieux sur les données statiques
      }
    }
    loadCmsArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrage des articles configurés pour l'accueil (show_in_home === 1)
  const homeArticles = (articles.length > 0 ? articles : BLOG_ARTICLES)
    .filter((a: any) => Number(a.show_in_home ?? 1) === 1);

  const displayArticles = homeArticles.length > 0
    ? homeArticles
    : (articles.length > 0 ? articles : BLOG_ARTICLES);

  const safeArticleIndex = activeArticleIndex < displayArticles.length ? activeArticleIndex : 0;
  const currentArticle = displayArticles[safeArticleIndex] || displayArticles[0];

  // Extraction de la galerie d'images pour l'article courant
  const currentImages: string[] = (() => {
    if (!currentArticle) {
      return ["https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200"];
    }
    const gallery = Array.isArray(currentArticle.gallery_images) && currentArticle.gallery_images.length > 0
      ? currentArticle.gallery_images
      : Array.isArray(currentArticle.gallery) && currentArticle.gallery.length > 0
      ? currentArticle.gallery
      : [];

    const fallbackCover = currentArticle.cover_image || currentArticle.coverImage;
    const list = gallery.length > 0
      ? gallery
      : [
          fallbackCover || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200",
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop"
        ];
    return list.filter(Boolean);
  })();

  const safeImageIndex = activeImageIndex < currentImages.length ? activeImageIndex : 0;
  const currentImageSrc = currentImages[safeImageIndex] || currentImages[0];

  // Défilement automatique : les photos de l'article défilent, puis passage à l'article suivant
  useEffect(() => {
    if (isHovered || currentImages.length === 0) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prevImg) => {
        if (prevImg + 1 < currentImages.length) {
          return prevImg + 1;
        } else {
          // Toutes les images de l'article sont passées, on passe à l'article suivant
          if (displayArticles.length > 1) {
            setActiveArticleIndex((prevArt) => (prevArt + 1) % displayArticles.length);
          }
          return 0;
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, currentImages.length, displayArticles.length]);

  // Réinitialiser l'index d'image lors d'un changement manuel d'article
  const handleSelectArticle = (newIndex: number) => {
    setActiveArticleIndex(newIndex);
    setActiveImageIndex(0);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeImageIndex + 1 < currentImages.length) {
      setActiveImageIndex(safeImageIndex + 1);
    } else {
      if (displayArticles.length > 1) {
        setActiveArticleIndex((prev) => (prev + 1) % displayArticles.length);
      }
      setActiveImageIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeImageIndex > 0) {
      setActiveImageIndex(safeImageIndex - 1);
    } else {
      if (displayArticles.length > 1) {
        setActiveArticleIndex((prev) => (prev - 1 + displayArticles.length) % displayArticles.length);
      }
      setActiveImageIndex(0);
    }
  };

  // Textes dynamiques selon la langue
  const articleTitle = isEn
    ? (currentArticle?.home_title_en || currentArticle?.title_en || currentArticle?.title || t("immersion.title"))
    : (currentArticle?.home_title_fr || currentArticle?.title_fr || currentArticle?.title || t("immersion.title"));

  const articleDesc = isEn
    ? (currentArticle?.home_desc_en || currentArticle?.summary_en || currentArticle?.summary || t("immersion.desc"))
    : (currentArticle?.home_desc_fr || currentArticle?.summary_fr || currentArticle?.summary || t("immersion.desc"));

  const articleSlug = currentArticle?.slug || currentArticle?.id || "";
  const articleCategory = currentArticle?.category || "Innovations";
  const articleDate = currentArticle?.date_published || currentArticle?.date || "";

  return (
    <section className="relative py-20 bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9] overflow-hidden">
      {/* Background depth wash & particles */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(42,157,143,0.12), transparent 55%), radial-gradient(90% 80% at 50% 120%, rgba(72,209,194,0.10), transparent 60%)",
        }}
      />
      <Particles className="z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2a9d8f]/20 to-transparent z-10" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* ── COLONNE GAUCHE : TEXTES DE L'ACTUALITÉ SYNCHRONISÉS ── */}
          <motion.div
            className="w-full lg:w-1/2 space-y-6 relative z-10"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge d'en-tête « À la une » */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#2a9d8f]/30 shadow-sm backdrop-blur-sm text-xs font-semibold text-[#1a3a5c]">
              <span className="flex h-2 w-2 rounded-full bg-[#2a9d8f] animate-pulse" />
              <span className="uppercase tracking-wider text-[11px] font-bold text-[#2a9d8f]">
                {t("immersion.badge", "À la une")}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{articleCategory}</span>
              {articleDate && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-normal flex items-center gap-1">
                    <Calendar size={11} className="text-[#2a9d8f]" />
                    {articleDate}
                  </span>
                </>
              )}
            </div>

            {/* Titre : "À la une," puis titre stylisé de l'actualité */}
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a3a5c] leading-tight min-h-[110px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[#1a3a5c] block mb-1">
                {t("immersion.heading", "À la une,")}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentArticle?.id || safeArticleIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45 }}
                  className="text-gray-500 italic font-light block text-2xl sm:text-3xl lg:text-4xl"
                >
                  {articleTitle}
                </motion.span>
              </AnimatePresence>
            </h2>

            {/* Descriptif / Résumé synchronisé */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentArticle?.id || safeArticleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-base sm:text-lg text-gray-600 leading-relaxed font-light max-w-xl min-h-[60px]"
              >
                {articleDesc}
              </motion.p>
            </AnimatePresence>

            {/* Boutons d'action */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <ShimmerButton as="Link" to="/actualites">
                {t("immersion.discoverNews", "Découvrir toutes les nouveautés")}
              </ShimmerButton>

              {articleSlug && (
                <Link
                  to={`/actualites/${articleSlug}`}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#1a3a5c] hover:text-[#2a9d8f] hover:bg-white/90 transition-all border border-[#2a9d8f]/30 bg-white/60 shadow-sm backdrop-blur-sm group"
                >
                  <span>{t("immersion.readArticle", "Lire l'article")}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Sélecteur d'actualités si plusieurs sont configurées pour l'accueil */}
            {displayArticles.length > 1 && (
              <div className="pt-4 border-t border-[#2a9d8f]/15 flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Newspaper size={13} className="text-[#2a9d8f]" />
                  <span>Actualités à la une :</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {displayArticles.map((art: any, idx: number) => {
                    const isActive = idx === safeArticleIndex;
                    return (
                      <button
                        key={art.id || art.slug || idx}
                        onClick={() => handleSelectArticle(idx)}
                        className={`h-2 transition-all rounded-full cursor-pointer ${
                          isActive
                            ? "w-6 bg-[#2a9d8f] shadow-sm shadow-[#2a9d8f]/30"
                            : "w-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                        title={art.title_fr || art.title || `Actualité ${idx + 1}`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                  {safeArticleIndex + 1} / {displayArticles.length}
                </span>
              </div>
            )}
          </motion.div>

          {/* ── COLONNE DROITE : GRAND ÉCRAN D'ACTUALITÉ UNIQUE & IMMERSIF ── */}
          <motion.div
            className="w-full lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Halo lumineux d'ambiance à l'arrière-plan */}
            <div className="absolute -inset-3 bg-gradient-to-r from-[#2a9d8f]/20 via-[#48cae4]/20 to-[#2a9d8f]/20 rounded-[32px] blur-xl opacity-70 pointer-events-none" />

            {/* Le grand panneau d'affichage fusionné */}
            <div
              className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-slate-900 group select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Image en défilement avec fondu fluide */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${safeArticleIndex}-${safeImageIndex}-${currentImageSrc}`}
                  src={currentImageSrc}
                  alt={articleTitle}
                  loading="lazy"
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Dégradés d'ombrage pour lisibilité et style premium */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Barre supérieure : Catégorie & Badge Photo */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-[#48cae4] border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={11} />
                  <span>{articleCategory}</span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-white/80 bg-black/40 backdrop-blur-md border border-white/10">
                    Photo {safeImageIndex + 1}/{currentImages.length}
                  </span>
                </div>
              </div>

              {/* Boutons fléchés pour naviguer dans les photos */}
              {currentImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-105"
                    title="Photo précédente"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-105"
                    title="Photo suivante"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Barre inférieure : Titre en surimpression & Indicateurs de photos */}
              <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 z-20 flex flex-col gap-3">
                <div className="space-y-1">
                  <div className="text-white text-base sm:text-lg font-bold line-clamp-1 drop-shadow-md">
                    {articleTitle}
                  </div>
                  <div className="text-slate-300 text-xs line-clamp-1 font-light drop-shadow">
                    {articleDesc}
                  </div>
                </div>

                {/* Indicateurs de progression des photos */}
                {currentImages.length > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/15">
                    <div className="flex items-center gap-1.5">
                      {currentImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveImageIndex(i);
                          }}
                          className={`transition-all rounded-full cursor-pointer ${
                            safeImageIndex === i
                              ? "w-5 h-1.5 bg-[#48cae4] shadow-[0_0_8px_#48cae4]"
                              : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          title={`Photo ${i + 1}`}
                        />
                      ))}
                    </div>

                    {articleSlug && (
                      <Link
                        to={`/actualites/${articleSlug}`}
                        className="text-[11px] font-semibold text-[#48cae4] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>{t("immersion.readArticle", "Lire l'article")}</span>
                        <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
