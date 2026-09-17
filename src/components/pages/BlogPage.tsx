import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BLOG_ARTICLES, BLOG_CATEGORIES, BlogCategory } from "../../data/blogData";
import { useTypewriter } from "../../hooks/useTypewriter";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "Tous">("Tous");
  const { displayedText, showCursor, ref: typeRef } = useTypewriter(t('blog.title'));

  const translatedArticles = BLOG_ARTICLES.map(a => ({
    ...a,
    title: t(`blogData.${a.id}.title`),
    summary: t(`blogData.${a.id}.summary`),
    authorRole: t(`blogData.${a.id}.authorRole`),
    category: t(`blogData.categories.${a.category === "Innovations" ? "innovations" : a.category === "Conseils Patients" ? "conseils" : a.category === "Traitements" ? "traitements" : "vie"}`) as BlogCategory,
  }));

  const filteredArticles = activeCategory === "Tous" 
    ? translatedArticles 
    : translatedArticles.filter(a => a.category === t(`blogData.categories.${activeCategory === "Innovations" ? "innovations" : activeCategory === "Conseils Patients" ? "conseils" : activeCategory === "Traitements" ? "traitements" : "vie"}`));

  const featuredArticle = activeCategory === "Tous" ? filteredArticles[0] : null;
  const regularArticles = activeCategory === "Tous" ? filteredArticles.slice(1) : filteredArticles;

  return (
    <main className="min-h-screen bg-[#0c1a2e] text-white pt-32 pb-24">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#48cae4]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#2a9d8f]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 ref={typeRef} className="text-4xl md:text-6xl font-bold mb-6 min-h-[1.5em]" style={{ fontFamily: "var(--font-display)" }}>
            {displayedText}
            <span className={`inline-block w-[4px] md:w-[5px] h-[0.9em] bg-white align-middle ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`} />
          </h1>
          <p className="text-lg text-gray-400 font-light">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button
            onClick={() => setActiveCategory("Tous")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === "Tous" 
                ? "bg-[#48cae4] text-[#0c1a2e] shadow-[0_0_20px_rgba(72,202,228,0.4)]" 
                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t('common.all')}
          </button>
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat 
                  ? "bg-[#48cae4] text-[#0c1a2e] shadow-[0_0_20px_rgba(72,202,228,0.4)]" 
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(`blogData.categories.${cat === "Innovations" ? "innovations" : cat === "Conseils Patients" ? "conseils" : cat === "Traitements" ? "traitements" : "vie"}`)}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <Link to={`/actualites/${featuredArticle.id}`} className="block mb-16 group">
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex flex-col md:flex-row min-h-[400px]">
              <div className="w-full md:w-1/2 relative overflow-hidden">
                <img 
                  src={featuredArticle.coverImage} 
                  alt={featuredArticle.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0c1a2e] via-transparent to-transparent opacity-80" />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-[#0c1a2e] md:bg-transparent md:bg-gradient-to-l md:from-[#0c1a2e] md:via-[#0c1a2e] md:to-transparent">
                <span className="inline-block px-3 py-1 bg-[#48cae4]/20 text-[#48cae4] rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4 border border-[#48cae4]/30">
                  {featuredArticle.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-[#48cae4] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-400 mb-6 line-clamp-3 text-lg font-light">
                  {featuredArticle.summary}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-auto">
                  <div className="flex items-center gap-2"><User size={16} className="text-[#48cae4]"/> {featuredArticle.author}</div>
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-[#48cae4]"/> {featuredArticle.date}</div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-[#48cae4]"/> {featuredArticle.readTime}</div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Regular Articles Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {regularArticles.map((article) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/actualites/${article.id}`} className="block h-full group">
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col hover:bg-white/10 transition-colors duration-300">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#0c1a2e]/80 backdrop-blur-md text-[#48cae4] rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#48cae4] transition-colors line-clamp-2 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-1 font-light">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#48cae4]"/> {article.date}</div>
                        <div className="flex items-center text-[#48cae4] font-medium group-hover:translate-x-1 transition-transform">
                          {t('common.read')} <ArrowRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {regularArticles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            {t('blog.noArticles')}
          </div>
        )}
      </div>
    </main>
  );
}
