import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Search,
  Plus,
  X,
  FileText,
  Check,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  ArrowRight
} from "lucide-react";

export interface ImportedSectionData {
  badge?: string;
  title_fr: string;
  title_en?: string;
  title?: string;
  text_fr: string;
  text_en?: string;
  content_fr?: string;
  content_en?: string;
  text?: string;
  content?: string;
  image?: string;
  image_position?: "left" | "right" | "none";
  source_type?: string;
  source_title?: string;
}

interface SectionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (section: ImportedSectionData) => void;
  title?: string;
  subtitle?: string;
}

export function SectionImportModal({
  isOpen,
  onClose,
  onImport,
  title = "Importer une section existante",
  subtitle = "Sélectionnez un article, un traitement ou une pathologie pour réutiliser et insérer l'une de ses sections."
}: SectionImportModalProps) {
  const [activeCategory, setActiveCategory] = useState<"articles" | "traitements" | "pathologies">("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Données des entités
  const [articles, setArticles] = useState<any[]>([]);
  const [traitements, setTraitements] = useState<any[]>([]);
  const [pathologies, setPathologies] = useState<any[]>([]);
  const [selectedItemSlug, setSelectedItemSlug] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      fetch("/api/cms/articles").then((r) => r.json()),
      fetch("/api/cms/traitements").then((r) => r.json()),
      fetch("/api/cms/pathologies").then((r) => r.json()),
    ])
      .then(([resA, resT, resP]) => {
        if (!isMounted) return;

        if (resA.status === "fulfilled" && resA.value?.articles) {
          setArticles(resA.value.articles);
        }
        if (resT.status === "fulfilled" && resT.value?.traitements) {
          setTraitements(resT.value.traitements);
        }
        if (resP.status === "fulfilled" && resP.value?.pathologies) {
          setPathologies(resP.value.pathologies);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Éléments de la catégorie active
  const currentCategoryItems = useMemo(() => {
    let list: any[] = [];
    if (activeCategory === "articles") list = articles;
    else if (activeCategory === "traitements") list = traitements;
    else if (activeCategory === "pathologies") list = pathologies;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((it) => {
      const tFr = (it.title_fr || it.title || "").toLowerCase();
      const tEn = (it.title_en || "").toLowerCase();
      const desc = (it.short_desc_fr || it.desc_front_fr || it.summary || "").toLowerCase();
      return tFr.includes(q) || tEn.includes(q) || desc.includes(q);
    });
  }, [activeCategory, articles, traitements, pathologies, searchQuery]);

  // Sélection automatique du premier élément si non défini
  useEffect(() => {
    if (currentCategoryItems.length > 0) {
      const exists = currentCategoryItems.some((it) => (it.slug || String(it.id)) === selectedItemSlug);
      if (!exists) {
        setSelectedItemSlug(currentCategoryItems[0].slug || String(currentCategoryItems[0].id));
      }
    } else {
      setSelectedItemSlug("");
    }
  }, [currentCategoryItems, selectedItemSlug]);

  const selectedItem = useMemo(() => {
    return currentCategoryItems.find((it) => (it.slug || String(it.id)) === selectedItemSlug) || null;
  }, [currentCategoryItems, selectedItemSlug]);

  // Extraction propre des sections de l'élément sélectionné
  const sectionsList: any[] = useMemo(() => {
    if (!selectedItem) return [];

    // Si sections est déjà un tableau
    if (Array.isArray(selectedItem.sections) && selectedItem.sections.length > 0) {
      return selectedItem.sections;
    }
    // Si sections_json est une string
    if (typeof selectedItem.sections_json === "string") {
      try {
        const parsed = JSON.parse(selectedItem.sections_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }

    // Fallback : vérifier si l'élément possède des sections numérotées section1..section4
    const extracted: any[] = [];
    for (let i = 1; i <= 6; i++) {
      const titleFr = selectedItem[`section${i}_title_fr`] || selectedItem[`section${i}_title`];
      const textFr = selectedItem[`section${i}_text_fr`] || selectedItem[`section${i}_text`];
      if (titleFr || textFr) {
        extracted.push({
          id: `sec-${i}`,
          badge: selectedItem[`section${i}_badge`] || `Section #${i}`,
          title_fr: titleFr || "",
          title_en: selectedItem[`section${i}_title_en`] || "",
          text_fr: textFr || "",
          text_en: selectedItem[`section${i}_text_en`] || "",
          image: selectedItem[`section${i}_image`] || "",
          image_position: selectedItem[`section${i}_image_position`] || "left",
        });
      }
    }
    return extracted;
  }, [selectedItem]);

  if (!isOpen) return null;

  const handleSelectSection = (sec: any) => {
    const itemTitle = selectedItem?.title_fr || selectedItem?.title || "Contenu ITID";
    const normalized: ImportedSectionData = {
      badge: sec.badge || (itemTitle ? `Extrait : ${itemTitle}` : "Section importée"),
      title_fr: sec.title_fr || sec.title || "",
      title_en: sec.title_en || sec.title || "",
      title: sec.title_fr || sec.title || "",
      text_fr: sec.text_fr || sec.content_fr || sec.text || sec.content || "",
      text_en: sec.text_en || sec.content_en || sec.text || sec.content || "",
      content_fr: sec.text_fr || sec.content_fr || sec.text || sec.content || "",
      content_en: sec.text_en || sec.content_en || sec.text || sec.content || "",
      text: sec.text_fr || sec.content_fr || sec.text || sec.content || "",
      content: sec.text_fr || sec.content_fr || sec.text || sec.content || "",
      image: sec.image || selectedItem?.card_image || selectedItem?.cover_image || "",
      image_position: sec.image_position || "left",
      source_type: activeCategory,
      source_title: itemTitle,
    };

    onImport(normalized);
    onClose();
  };

  const handleImportEntireItem = () => {
    if (!selectedItem) return;
    const itemTitle = selectedItem.title_fr || selectedItem.title || "Contenu ITID";
    const textFr = selectedItem.content_fr || selectedItem.content || selectedItem.short_desc_fr || selectedItem.desc_front_fr || "";
    const textEn = selectedItem.content_en || selectedItem.short_desc_en || selectedItem.desc_front_en || "";

    const normalized: ImportedSectionData = {
      badge: `Synthèse : ${itemTitle}`,
      title_fr: itemTitle,
      title_en: selectedItem.title_en || itemTitle,
      title: itemTitle,
      text_fr: textFr,
      text_en: textEn,
      content_fr: textFr,
      content_en: textEn,
      text: textFr,
      content: textFr,
      image: selectedItem.card_image || selectedItem.cover_image || selectedItem.image || "",
      image_position: "left",
      source_type: activeCategory,
      source_title: itemTitle,
    };

    onImport(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0c1a2e] border border-slate-700/80 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white space-y-4">
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2a9d8f]/30 to-[#48cae4]/30 border border-[#2a9d8f]/50 flex items-center justify-center text-[#48cae4]">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 font-semibold">
                  Bibliothèque CMS
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Onglets de sélection du type de contenu */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveCategory("articles")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeCategory === "articles"
                ? "bg-[#2a9d8f] text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>📰 Articles & Actualités</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 font-mono">
              {articles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("traitements")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeCategory === "traitements"
                ? "bg-[#2a9d8f] text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>💉 Traitements Médicaux</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 font-mono">
              {traitements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("pathologies")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeCategory === "pathologies"
                ? "bg-[#2a9d8f] text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>🦴 Pathologies & Douleurs</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 font-mono">
              {pathologies.length}
            </span>
          </button>
        </div>

        {/* Barre de recherche et sélecteur de contenu */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Rechercher un ${activeCategory === "articles" ? "article" : activeCategory === "traitements" ? "traitement" : "pathologie"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-[#48cae4]"
            />
          </div>

          <div className="md:col-span-7">
            <select
              value={selectedItemSlug}
              onChange={(e) => setSelectedItemSlug(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold outline-none focus:border-[#48cae4] cursor-pointer truncate"
            >
              {currentCategoryItems.map((it) => (
                <option key={it.slug || it.id} value={it.slug || String(it.id)}>
                  {it.title_fr || it.title_en || it.title || it.slug}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Détails de l'élément sélectionné et sections disponibles */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Chargement des contenus en cours...
            </div>
          ) : !selectedItem ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              Aucun élément trouvé pour cette recherche.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Carte résumé de l'élément sélectionné */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {(selectedItem.card_image || selectedItem.cover_image || selectedItem.image) && (
                    <img
                      src={selectedItem.card_image || selectedItem.cover_image || selectedItem.image}
                      alt={selectedItem.title_fr}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#48cae4] tracking-wider">
                      {activeCategory === "articles" ? "Article de référence" : activeCategory === "traitements" ? "Traitement médical" : "Pathologie"}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {selectedItem.title_fr || selectedItem.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {sectionsList.length} section{sectionsList.length > 1 ? "s" : ""} disponible{sectionsList.length > 1 ? "s" : ""} à importer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleImportEntireItem}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#48cae4] hover:text-white border border-slate-700 text-xs font-semibold transition-all shrink-0 self-end sm:self-auto cursor-pointer"
                  title="Importer la synthèse complète de cet élément"
                >
                  📥 Importer le résumé global
                </button>
              </div>

              {/* Liste des sections de l'élément */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Sections individuelles disponibles :</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Cliquez sur « Importer cette section » pour l'ajouter
                  </span>
                </div>

                {sectionsList.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-950/40">
                    <FileText size={28} className="mx-auto text-slate-600" />
                    <p className="text-slate-400 text-xs">
                      Cet élément ne comporte pas de sections détaillées découpées.
                    </p>
                    <button
                      type="button"
                      onClick={handleImportEntireItem}
                      className="px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus size={14} />
                      <span>Importer le texte principal à la place</span>
                    </button>
                  </div>
                ) : (
                  sectionsList.map((sec, idx) => {
                    const secTitle = sec.title_fr || sec.title_en || sec.title || `Section #${idx + 1}`;
                    const secText = sec.text_fr || sec.text_en || sec.content_fr || sec.content_en || sec.text || sec.content || "";
                    const textSnippet = secText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220);

                    return (
                      <div
                        key={sec.id || idx}
                        className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#2a9d8f]/50 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {sec.image ? (
                            <img
                              src={sec.image}
                              alt={secTitle}
                              className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-950"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                              <ImageIcon size={20} />
                            </div>
                          )}

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
                                {sec.badge || `Section #${idx + 1}`}
                              </span>
                              {sec.image_position && (
                                <span className="text-[10px] text-slate-400">
                                  Position image : {sec.image_position === "left" ? "Gauche" : sec.image_position === "right" ? "Droite" : "Pleine largeur"}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#48cae4] transition-colors">
                              {secTitle}
                            </h4>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {textSnippet || "(Aucun texte renseigné dans cette section)"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectSection(sec)}
                          className="px-4 py-2 rounded-xl bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Importer cette section</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bas de page modal */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Astuce : La section importée sera directement modifiable et personnalisable dans la page courante.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
