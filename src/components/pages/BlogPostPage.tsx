import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BLOG_ARTICLES, BlogCategory } from "../../data/blogData";
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BlogPostPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const { id } = useParams<{ id: string }>();

  const [dynamicArticle, setDynamicArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/cms/articles?slug=${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.article) {
            setDynamicArticle(json.article);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Fallback on static blog data", err);
      }
      setLoading(false);
    }
    loadArticle();
  }, [id]);
  
  const rawArticle = BLOG_ARTICLES.find(a => a.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c1a2e] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#48cae4]"></div>
      </div>
    );
  }

  if (!rawArticle && !dynamicArticle) {
    return (
      <div className="min-h-screen bg-[#0c1a2e] text-white pt-32 pb-24 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">{t('blog.notFound')}</h1>
        <Link to="/actualites" className="text-[#48cae4] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> {t('common.backNews')}
        </Link>
      </div>
    );
  }

  const article = dynamicArticle
    ? {
        id: dynamicArticle.slug,
        title: lang === "en" ? (dynamicArticle.title_en || dynamicArticle.title_fr) : dynamicArticle.title_fr,
        summary: lang === "en" ? (dynamicArticle.summary_en || dynamicArticle.summary_fr) : dynamicArticle.summary_fr,
        author: dynamicArticle.author || "Dr. Marc Moreau",
        authorRole: lang === "en" ? (dynamicArticle.author_role_en || dynamicArticle.author_role_fr || "Pain Specialist") : (dynamicArticle.author_role_fr || "Algologue"),
        date: dynamicArticle.date_published || "15 Octobre 2026",
        readTime: lang === "en" ? (dynamicArticle.read_time_en || dynamicArticle.read_time_fr || "4 min") : (dynamicArticle.read_time_fr || "4 min"),
        category: dynamicArticle.category || "Innovations",
        coverImage: dynamicArticle.cover_image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200",
        content: lang === "en" ? (dynamicArticle.content_en || dynamicArticle.content_fr) : dynamicArticle.content_fr,
        tags: dynamicArticle.tags || "",
        dynamicSections: Array.isArray(dynamicArticle.sections) ? dynamicArticle.sections : [],
        sections: []
      }
    : {
        ...rawArticle!,
        tags: rawArticle!.tags || "",
        dynamicSections: rawArticle!.dynamicSections || [],
        title: t(`blogData.${rawArticle!.id}.title`),
        summary: t(`blogData.${rawArticle!.id}.summary`),
        authorRole: t(`blogData.${rawArticle!.id}.authorRole`),
        category: t(`blogData.categories.${rawArticle!.category === "Innovations" ? "innovations" : rawArticle!.category === "Conseils Patients" ? "conseils" : rawArticle!.category === "Traitements" ? "traitements" : "vie"}`) as BlogCategory,
        sections: rawArticle!.sections.map((s, i) => {
          if (s.type === 'list') {
            return { ...s, content: (s.content as string[]).map((_, j) => t(`blogData.${rawArticle!.id}.sections.s${i}_${j}`)) };
          }
          return { ...s, content: t(`blogData.${rawArticle!.id}.sections.s${i}`) as string };
        })
      };

  const relatedArticles = BLOG_ARTICLES.filter(a => a.category === (rawArticle ? rawArticle.category : dynamicArticle?.category) && a.id !== (rawArticle ? rawArticle.id : dynamicArticle?.slug)).slice(0, 3).map(a => ({
    ...a,
    title: t(`blogData.${a.id}.title`),
    summary: t(`blogData.${a.id}.summary`),
    category: t(`blogData.categories.${a.category === "Innovations" ? "innovations" : a.category === "Conseils Patients" ? "conseils" : a.category === "Traitements" ? "traitements" : "vie"}`) as BlogCategory,
  }));

  return (
    <main className="min-h-screen bg-[#f0f7f6] text-[#1a3a5c]">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-[#0c1a2e]">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f0f7f6] via-transparent to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end pb-16">
          <div className="max-w-5xl mx-auto px-6 w-full">
            <Link to="/actualites" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors font-medium">
              <ArrowLeft size={18} /> {t('common.backNews')}
            </Link>
            
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="px-4 py-1.5 bg-[#48cae4] text-[#0c1a2e] rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-bold text-base">{article.author}</div>
                  <div className="text-xs opacity-80">{article.authorRole}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Calendar size={18} className="text-[#48cae4]" /> {article.date}
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                <Clock size={18} className="text-[#48cae4]" /> {article.readTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Résumé / Accroche */}
        {article.summary && (
          <div className="bg-white/90 backdrop-blur-sm border-l-4 border-[#2a9d8f] p-6 md:p-8 rounded-2xl shadow-sm mb-10">
            <p className="text-xl md:text-2xl font-light text-slate-800 leading-relaxed italic">
              "{article.summary}"
            </p>
          </div>
        )}

        {/* Tags */}
        {article.tags && (
          <div className="flex flex-wrap items-center gap-2 mb-12">
            {article.tags.split(",").map((t: string, i: number) => {
              const tag = t.trim();
              if (!tag) return null;
              return (
                <span
                  key={i}
                  className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-semibold shadow-xs hover:border-[#48cae4] hover:text-[#0c1a2e] transition-colors"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              );
            })}
          </div>
        )}

        {/* ====================================================================== */}
        {/* SECTIONS & IMAGES EN DISPOSITION ALTERNÉE G/D */}
        {/* ====================================================================== */}
        {article.dynamicSections && article.dynamicSections.length > 0 ? (
          <div className="space-y-12 md:space-y-16">
            {article.dynamicSections.map((sec: any, idx: number) => {
              // Section #1 (0) : Image à Gauche & Texte à Droite
              // Section #2 (1) : Texte à Gauche & Image à Droite
              const isImageLeft = idx % 2 === 0;

              return (
                <section
                  key={sec.id || idx}
                  className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-[#48cae4]/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Bloc Image */}
                    <div className={`${isImageLeft ? "md:order-1" : "md:order-2"} w-full`}>
                      {sec.image ? (
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md group bg-slate-950">
                          <img
                            src={sec.image}
                            alt={sec.title || article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-medium text-sm">
                          <span>Illustration Section #{idx + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Bloc Texte & Sous-titre */}
                    <div className={`${isImageLeft ? "md:order-2" : "md:order-1"} space-y-4`}>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#48cae4]/10 text-[#0c1a2e] text-xs font-bold tracking-wider uppercase border border-[#48cae4]/20">
                        <span className="w-2 h-2 rounded-full bg-[#48cae4]" />
                        <span>Section #{idx + 1}</span>
                      </div>

                      {sec.title && (
                        <h2
                          className="text-2xl md:text-3xl font-bold text-[#0c1a2e] leading-snug"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {sec.title}
                        </h2>
                      )}

                      {sec.content && (
                        <div className="text-slate-600 text-base md:text-lg leading-relaxed font-light whitespace-pre-line space-y-3">
                          {sec.content}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : article.sections && article.sections.length > 0 ? (
          <article className="prose prose-lg md:prose-xl max-w-none text-gray-700">
            {article.sections.map((section, idx) => {
              switch (section.type) {
                case 'heading':
                  return <h2 key={idx} className="text-3xl font-bold text-[#1a3a5c] mt-16 mb-6" style={{ fontFamily: "var(--font-display)" }}>{section.content}</h2>;
                case 'paragraph':
                  return <p key={idx} className="mb-6 leading-relaxed font-light text-lg">{section.content}</p>;
                case 'quote':
                  return (
                    <blockquote key={idx} className="my-12 p-8 md:p-10 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border-l-4 border-[#48cae4] text-[#1a3a5c] italic font-medium text-xl md:text-2xl">
                      "{section.content}"
                    </blockquote>
                  );
                case 'list':
                  return (
                    <ul key={idx} className="my-10 space-y-4 bg-white p-8 md:p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100">
                      {(section.content as string[]).map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <span className="text-[#2a9d8f] font-bold mt-1.5 text-xl">•</span>
                          <span className="text-lg font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}
          </article>
        ) : null}

        {/* Corps complémentaire ou conclusion */}
        {article.content && (
          <div className="mt-12 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xl font-bold text-[#0c1a2e]" style={{ fontFamily: "var(--font-display)" }}>
              Synthèse & Perspectives
            </h3>
            <div className="text-slate-700 leading-relaxed font-light text-base md:text-lg whitespace-pre-line">
              {article.content}
            </div>
          </div>
        )}
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-white py-24 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-widest text-[#2a9d8f] mb-2 block">{t('blog.goFurther')}</span>
              <h3 className="text-4xl font-bold text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                {t('blog.similarArticles')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((rel) => (
                <Link to={`/actualites/${rel.id}`} key={rel.id} className="block group">
                  <div className="bg-[#f0f7f6] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-transparent hover:border-[#2a9d8f]/30">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={rel.coverImage} 
                        alt={rel.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <span className="text-xs font-bold text-[#2a9d8f] uppercase tracking-widest mb-3">
                        {rel.category}
                      </span>
                      <h4 className="text-xl font-bold text-[#1a3a5c] mb-4 group-hover:text-[#2a9d8f] transition-colors line-clamp-2 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                        {rel.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-1 font-light">
                        {rel.summary}
                      </p>
                      <div className="flex items-center text-[#2a9d8f] font-semibold group-hover:translate-x-2 transition-transform mt-auto">
                        {t('blog.readArticle')} <ArrowRight size={18} className="ml-2" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
