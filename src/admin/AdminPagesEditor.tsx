import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuthHeaders } from "./auth";
import { SingleMediaSelector, GalleryMediaSelector } from "./MediaSelector";
import { Plus, Trash2, Edit3, Check, Eye, RefreshCw, Layers, Sparkles } from "lucide-react";

type LangTab = "fr" | "en";

export default function AdminPagesEditor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = searchParams.get("section") || "pathologies";
  const [lang, setLang] = useState<LangTab>("fr");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Données dynamiques
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [pageContentFr, setPageContentFr] = useState<any>({});
  const [pageContentEn, setPageContentEn] = useState<any>({});

  const sectionsList = [
    { id: "pathologies", label: "Pathologies", icon: "🦴" },
    { id: "traitements", label: "Traitements", icon: "💉" },
    { id: "articles", label: "Actualités & Blog", icon: "📰" },
    { id: "home", label: "Page d'Accueil", icon: "🏠" },
    { id: "about", label: "À Propos & Équipe", icon: "🏥" },
  ];

  // Chargement des données selon la section active
  const loadData = async () => {
    setLoading(true);
    setSaveMessage(null);
    setSelectedItem(null);

    try {
      if (currentSection === "home" || currentSection === "about") {
        const res = await fetch(`/api/admin/cms?type=pages&page=${currentSection}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setPageContentFr(data.content_fr || {});
          setPageContentEn(data.content_en || {});
        } else if (res.status === 401) {
          setSaveMessage("⚠️ Non autorisé / Session expirée. Veuillez vous reconnecter.");
        } else {
          setSaveMessage(`❌ Erreur de chargement (HTTP ${res.status})`);
        }
      } else {
        const res = await fetch(`/api/admin/cms?type=${currentSection}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItemsList(data.items);
            if (data.items.length > 0) {
              setSelectedItem(data.items[0]);
            }
          }
        } else if (res.status === 401) {
          setSaveMessage("⚠️ Non autorisé / Session expirée. Veuillez vous reconnecter.");
        } else {
          setSaveMessage(`❌ Erreur de chargement (HTTP ${res.status})`);
        }
      }
    } catch (err: any) {
      setSaveMessage(`❌ Erreur de chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSection]);

  // Sauvegarde globale pour Home & About
  const handleSavePage = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/admin/cms?type=pages&page=${currentSection}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content_fr: pageContentFr,
          content_en: pageContentEn,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur de sauvegarde");

      setSaveMessage("✅ Page mise à jour avec succès en base de données !");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarde d'un élément (Pathologie, Traitement, Article)
  const handleSaveItem = async (itemToSave: any) => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const isNew = !itemToSave.id;
      const method = isNew ? "POST" : "PUT";
      const url = isNew 
        ? `/api/admin/cms?type=${currentSection}` 
        : `/api/admin/cms?type=${currentSection}&id=${itemToSave.id}`;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(itemToSave),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur de sauvegarde");

      setSaveMessage(`✅ ${isNew ? "Création réussie" : "Modifications enregistrées"} avec succès !`);
      setTimeout(() => setSaveMessage(null), 4000);

      // Recharger la liste
      await loadData();
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Suppression d'un élément
  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet élément ?")) return;

    try {
      const res = await fetch(`/api/admin/cms?type=${currentSection}&id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur de suppression");

      setSaveMessage("✅ Élément supprimé.");
      setTimeout(() => setSaveMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    }
  };

  // Création d'un nouvel élément vierge
  const handleAddNew = () => {
    if (currentSection === "pathologies") {
      const newPatho = {
        title_fr: "Nouvelle Pathologie",
        title_en: "New Condition",
        slug: "nouvelle-pathologie-" + Date.now().toString().slice(-4),
        icon: "🩺",
        color: "#4ade80",
        short_desc_fr: "Description clinique courte pour la carte...",
        short_desc_en: "Short clinical description for card...",
        card_image: "/images/lombalgie.jpg",
        hero_gallery: ["/images/lombalgie.jpg", "/images/spine_isolated.jpg"],
        section1_title_fr: "Comprendre la Pathologie",
        section1_title_en: "Understanding the Condition",
        section1_text_fr: "Description approfondie des mécanismes biologiques...",
        section1_text_en: "In-depth description of biological mechanisms...",
        section1_image: "/images/lombalgie.jpg",
        section2_title_fr: "Quand et comment se faire diagnostiquer ?",
        section2_title_en: "When & How to Get Diagnosed?",
        section2_text_fr: "Signes d'alerte et examens complémentaires...",
        section2_text_en: "Warning signs and medical imaging...",
        section2_image: "/images/glowing_3d_spine.jpg",
        section3_title_fr: "Prise en charge interventionnelle à l'ITID",
        section3_title_en: "Interventional Care at ITID",
        section3_text_fr: "Gestes thérapeutiques proposés à l'institut...",
        section3_text_en: "Therapeutic procedures provided at ITID...",
        section3_image: "/images/treatments/infiltrations_rachidiennes.jpg",
        section4_title_fr: "Prévention & Conseils au Quotidien",
        section4_title_en: "Prevention & Daily Advice",
        section4_text_fr: "Postures, réadaptation et hygiène de vie...",
        section4_text_en: "Postures, rehabilitation, and lifestyle...",
        section4_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        wikipedia_url: "",
        display_order: itemsList.length + 1,
        is_active: 1
      };
      setSelectedItem(newPatho);
    } else if (currentSection === "traitements") {
      const newTrait = {
        num: String(itemsList.length + 1).padStart(2, "0"),
        icon: "💉",
        title_fr: "Nouveau Traitement",
        title_en: "New Treatment",
        slug: "nouveau-traitement-" + Date.now().toString().slice(-4),
        desc_front_fr: "Accroche courte du geste (recto)...",
        desc_front_en: "Short front description...",
        desc_back_fr: "Description clinique détaillée (verso)...",
        desc_back_en: "Detailed clinical description (back)...",
        card_image: "/images/treatments/infiltrations_rachidiennes.jpg",
        hero_gallery: ["/images/treatments/infiltrations_rachidiennes.jpg"],
        section1_title_fr: "Indications & Douleurs Ciblées",
        section1_title_en: "Indications & Targeted Conditions",
        section1_text_fr: "Pour quels patients et quelles douleurs...",
        section1_text_en: "For which patients and pain types...",
        section1_image: "/images/treatments/infiltrations_rachidiennes.jpg",
        section2_title_fr: "Déroulement Précis du Geste sous Imagerie",
        section2_title_en: "Step-by-Step Guided Procedure",
        section2_text_fr: "Protocole interventionnel, durée et sécurité...",
        section2_text_en: "Interventional protocol, duration, safety...",
        section2_image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
        section3_title_fr: "Bénéfices Attendus & Suites",
        section3_title_en: "Expected Benefits & Recovery",
        section3_text_fr: "Délai de soulagement et reprise d'activité...",
        section3_text_en: "Pain relief timeline and recovery...",
        section3_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
        section4_title_fr: "Pathologies Associées Prises en Charge",
        section4_title_en: "Related Conditions Managed",
        section4_text_fr: "Maladies traitées par cette technique...",
        section4_text_en: "Conditions managed by this procedure...",
        section4_image: "/images/lombalgie.jpg",
        display_order: itemsList.length + 1,
        is_active: 1
      };
      setSelectedItem(newTrait);
    } else if (currentSection === "articles") {
      const newArt = {
        title_fr: "Nouvel Article Médical",
        title_en: "New Medical Article",
        slug: "nouvel-article-" + Date.now().toString().slice(-4),
        category: "Innovations",
        author: "Dr. Marc Moreau",
        author_role_fr: "Algologue / Neurochirurgien",
        author_role_en: "Pain Specialist / Neurosurgeon",
        date_published: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
        read_time_fr: "4 min",
        read_time_en: "4 min",
        summary_fr: "Résumé accrocheur de l'article...",
        summary_en: "Compelling article summary...",
        content_fr: "Corps complet de l'article médical...",
        content_en: "Full body text of medical article...",
        cover_image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200",
        gallery_images: [
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
          "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800",
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
        ],
        is_published: 1
      };
      setSelectedItem(newArt);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* En-tête Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Éditeur de Contenus Médicaux (CMS)</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
              Persistance BDD Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestion bilingue intégrale, upload local/URL, galeries défilantes et fiches détaillées.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de Langue Strict FR / EN */}
          <div className="flex p-1 bg-slate-900 border border-slate-700 rounded-xl">
            <button
              onClick={() => setLang("fr")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                lang === "fr" ? "bg-[#2a9d8f] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇫🇷</span>
              <span>Français</span>
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                lang === "en" ? "bg-[#2a9d8f] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>

          {(currentSection === "home" || currentSection === "about") && (
            <button
              onClick={handleSavePage}
              disabled={saving}
              className="px-5 py-2.5 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer la page</span>}
            </button>
          )}
        </div>
      </div>

      {saveMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold ${
            saveMessage.startsWith("✅")
              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border border-red-500/40 text-red-300"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Navigation par Onglets de Rubriques */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {sectionsList.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSearchParams({ section: sec.id })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              currentSection === sec.id
                ? "bg-slate-800 text-white border border-[#2a9d8f]"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de la Rubrique */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm flex items-center justify-center gap-3 bg-[#0c1a2e] rounded-3xl border border-slate-800">
          <RefreshCw size={20} className="animate-spin text-[#2a9d8f]" />
          <span>Chargement des données...</span>
        </div>
      ) : (
        <div>
          {/* Rubrique PATHOLOGIES */}
          {currentSection === "pathologies" && (
            <MasterDetailEditor
              title="Fiches Pathologies"
              items={itemsList}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onAddNew={handleAddNew}
              onDelete={handleDeleteItem}
              onSave={handleSaveItem}
              saving={saving}
              lang={lang}
              renderForm={(item: any, onChange: any) => (
                <PathologyForm item={item} onChange={onChange} lang={lang} />
              )}
            />
          )}

          {/* Rubrique TRAITEMENTS */}
          {currentSection === "traitements" && (
            <MasterDetailEditor
              title="Gestes Interventionnels & Traitements"
              items={itemsList}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onAddNew={handleAddNew}
              onDelete={handleDeleteItem}
              onSave={handleSaveItem}
              saving={saving}
              lang={lang}
              renderForm={(item: any, onChange: any) => (
                <TreatmentForm item={item} onChange={onChange} lang={lang} />
              )}
            />
          )}

          {/* Rubrique ARTICLES / ACTUALITÉS */}
          {currentSection === "articles" && (
            <MasterDetailEditor
              title="Articles Médicaux & Actualités"
              items={itemsList}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onAddNew={handleAddNew}
              onDelete={handleDeleteItem}
              onSave={handleSaveItem}
              saving={saving}
              lang={lang}
              renderForm={(item: any, onChange: any) => (
                <ArticleForm item={item} onChange={onChange} lang={lang} />
              )}
            />
          )}

          {/* Rubrique PAGE D'ACCUEIL */}
          {currentSection === "home" && (
            <HomePageEditor
              dataFr={pageContentFr}
              dataEn={pageContentEn}
              onChangeFr={(data: any) => setPageContentFr((prev: any) => ({ ...prev, ...data }))}
              onChangeEn={(data: any) => setPageContentEn((prev: any) => ({ ...prev, ...data }))}
              lang={lang}
            />
          )}

          {/* Rubrique À PROPOS */}
          {currentSection === "about" && (
            <AboutPageEditor
              dataFr={pageContentFr}
              dataEn={pageContentEn}
              onChangeFr={(data: any) => setPageContentFr((prev: any) => ({ ...prev, ...data }))}
              onChangeEn={(data: any) => setPageContentEn((prev: any) => ({ ...prev, ...data }))}
              lang={lang}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ======================================================================
// COMPOSANT MASTER-DETAIL GÉNÉRIQUE (LISTE GAUCHE / FORMULAIRE DROITE)
// ======================================================================
function MasterDetailEditor({ title, items, selectedItem, onSelect, onAddNew, onDelete, onSave, saving, lang, renderForm }: any) {
  const [formData, setFormData] = useState<any>(selectedItem || {});

  useEffect(() => {
    setFormData(selectedItem || {});
  }, [selectedItem]);

  const handleChange = (updatedFields: any) => {
    setFormData((prev: any) => ({ ...prev, ...updatedFields }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Colonne Gauche : Liste des éléments */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div>
            <div className="font-bold text-sm text-white">{title}</div>
            <div className="text-[11px] text-slate-400">{items.length} fiche(s) configurée(s)</div>
          </div>
          <button
            type="button"
            onClick={onAddNew}
            className="px-3 py-1.5 bg-[#2a9d8f] hover:bg-[#238276] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Nouveau</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {items.map((it: any) => {
            const isSelected = selectedItem && selectedItem.id === it.id;
            const displayTitle = lang === "en" ? (it.title_en || it.title_fr) : it.title_fr;

            return (
              <div
                key={it.id || it.slug}
                onClick={() => onSelect(it)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-slate-800 border-[#2a9d8f] shadow-lg shadow-[#2a9d8f]/10"
                    : "bg-slate-900/70 border-slate-800 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-base shrink-0">
                    {it.icon || "📄"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{displayTitle}</span>
                      {it.is_featured === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          ⭐ À la une
                        </span>
                      )}
                      {(it.show_in_home ?? 1) === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 shrink-0">
                          🏠 Accueil
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">/{it.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(it.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Colonne Droite : Formulaire d'édition */}
      <div className="lg:col-span-8">
        {formData && formData.title_fr !== undefined ? (
          <div className="p-6 md:p-8 bg-[#0c1a2e] border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#48cae4]">
                  {formData.id ? `Édition Fiche #${formData.id}` : "Création d'une nouvelle fiche"}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {lang === "en" ? (formData.title_en || formData.title_fr) : formData.title_fr}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onSave(formData)}
                disabled={saving}
                className="px-6 py-2.5 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer les modifications</span>}
              </button>
            </div>

            {renderForm(formData, handleChange)}

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => onSave(formData)}
                disabled={saving}
                className="px-8 py-3 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer & Publier</span>}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            Sélectionnez une fiche à gauche ou cliquez sur "+ Nouveau" pour en créer une.
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================================
// FORMULAIRE PATHOLOGIE (BILINGUE + GALERIE + 4 SECTIONS ALTERNÉES)
// ======================================================================
function PathologyForm({ item, onChange, lang }: any) {
  return (
    <div className="space-y-6 text-xs">
      {/* Données d'en-tête de la carte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre [{lang.toUpperCase()}] *</label>
          <input
            type="text"
            value={lang === "en" ? (item.title_en || "") : (item.title_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { title_en: e.target.value } : { title_fr: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Identifiant d'URL (Slug) *</label>
          <input
            type="text"
            value={item.slug || ""}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="ex: lombalgie-chronique"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Émoji / Icône</label>
            <input
              type="text"
              value={item.icon || "🩺"}
              onChange={(e) => onChange({ icon: e.target.value })}
              className="w-full text-center py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Couleur Thème</label>
            <input
              type="text"
              value={item.color || "#4ade80"}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-full px-2 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-center font-mono"
            />
          </div>
        </div>
      </div>

      {/* Image de la carte & Description courte */}
      <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
        <SingleMediaSelector
          label="Photo Principale de la Carte (Upload depuis votre ordinateur ou URL) *"
          value={item.card_image || ""}
          onChange={(url) => onChange({ card_image: url })}
        />

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Description courte d'accroche (Visible sur la carte du site) [{lang.toUpperCase()}] *
          </label>
          <textarea
            rows={2}
            value={lang === "en" ? (item.short_desc_en || "") : (item.short_desc_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { short_desc_en: e.target.value } : { short_desc_fr: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
          />
        </div>
      </div>

      {/* Galerie de Bannière d'en-tête (Carrousel multi-photos) */}
      <GalleryMediaSelector
        label="Carrousel Multi-Photos HD de la Bannière d'en-tête (Défilant)"
        images={item.hero_gallery || []}
        onChange={(images) => onChange({ hero_gallery: images })}
        minImages={3}
      />

      {/* 4 SECTIONS DÉTAILLÉES EN LAYOUT ALTERNÉ */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="font-bold text-sm text-white flex items-center gap-2">
          <Layers size={16} className="text-[#2a9d8f]" />
          <span>Contenu Détaillé de la Page (4 Sections Alternées Photo / Texte)</span>
        </div>

        {/* Section 1 : Comprendre la maladie (Photo Gauche / Texte Droite) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-cyan-300">Section 1 — Comprendre la Pathologie (Photo Gauche / Texte Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleMediaSelector
              label="Photo Section 1"
              value={item.section1_image || ""}
              onChange={(url) => onChange({ section1_image: url })}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre de la Section 1"
                value={lang === "en" ? (item.section1_title_en || "") : (item.section1_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section1_title_en: e.target.value } : { section1_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Texte explicatif clinique..."
                value={lang === "en" ? (item.section1_text_en || "") : (item.section1_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section1_text_en: e.target.value } : { section1_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Diagnostic (Texte Gauche / Photo Droite) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-emerald-300">Section 2 — Diagnostic & Quand Consulter (Texte Gauche / Photo Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre de la Section 2"
                value={lang === "en" ? (item.section2_title_en || "") : (item.section2_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section2_title_en: e.target.value } : { section2_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Critères d'alerte, examens d'imagerie..."
                value={lang === "en" ? (item.section2_text_en || "") : (item.section2_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section2_text_en: e.target.value } : { section2_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
            <SingleMediaSelector
              label="Photo Section 2"
              value={item.section2_image || ""}
              onChange={(url) => onChange({ section2_image: url })}
            />
          </div>
        </div>

        {/* Section 3 : Traitements ITID (Photo Gauche / Texte Droite) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-yellow-300">Section 3 — Traitements Interventionnels ITID (Photo Gauche / Texte Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleMediaSelector
              label="Photo Section 3"
              value={item.section3_image || ""}
              onChange={(url) => onChange({ section3_image: url })}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre de la Section 3"
                value={lang === "en" ? (item.section3_title_en || "") : (item.section3_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section3_title_en: e.target.value } : { section3_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Infiltrations, radiofréquence, cryoneurolyse..."
                value={lang === "en" ? (item.section3_text_en || "") : (item.section3_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section3_text_en: e.target.value } : { section3_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Prévention & Conseils (Texte Gauche / Photo Droite) */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-teal-300">Section 4 — Prévention & Conseils au Quotidien (Texte Gauche / Photo Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre de la Section 4"
                value={lang === "en" ? (item.section4_title_en || "") : (item.section4_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section4_title_en: e.target.value } : { section4_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Postures, étirements, hygiène de vie..."
                value={lang === "en" ? (item.section4_text_en || "") : (item.section4_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section4_text_en: e.target.value } : { section4_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
            <SingleMediaSelector
              label="Photo Section 4"
              value={item.section4_image || ""}
              onChange={(url) => onChange({ section4_image: url })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// FORMULAIRE TRAITEMENT (BILINGUE + RECTO/VERSO + 4 SECTIONS)
// ======================================================================
function TreatmentForm({ item, onChange, lang }: any) {
  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Numéro (ex: 01) *</label>
          <input
            type="text"
            value={item.num || "01"}
            onChange={(e) => onChange({ num: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4] font-bold text-center"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1">Intitulé du Traitement [{lang.toUpperCase()}] *</label>
          <input
            type="text"
            value={lang === "en" ? (item.title_en || "") : (item.title_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { title_en: e.target.value } : { title_fr: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Identifiant d'URL (Slug) *</label>
          <input
            type="text"
            value={item.slug || ""}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="ex: infiltrations-rachidiennes"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4]"
          />
        </div>
      </div>

      {/* Image de la carte + Recto / Verso */}
      <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
        <SingleMediaSelector
          label="Photo Principale du Traitement (Upload local ou URL) *"
          value={item.card_image || ""}
          onChange={(url) => onChange({ card_image: url })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Texte Recto de la carte (Accroche courte) [{lang.toUpperCase()}] *
            </label>
            <textarea
              rows={3}
              value={lang === "en" ? (item.desc_front_en || "") : (item.desc_front_fr || "")}
              onChange={(e) => onChange(lang === "en" ? { desc_front_en: e.target.value } : { desc_front_fr: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Texte Verso de la carte (« En savoir plus ») [{lang.toUpperCase()}] *
            </label>
            <textarea
              rows={3}
              value={lang === "en" ? (item.desc_back_en || "") : (item.desc_back_fr || "")}
              onChange={(e) => onChange(lang === "en" ? { desc_back_en: e.target.value } : { desc_back_fr: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Galerie de Bannière d'en-tête */}
      <GalleryMediaSelector
        label="Carrousel Multi-Photos HD de la Bannière Dédiée"
        images={item.hero_gallery || []}
        onChange={(images) => onChange({ hero_gallery: images })}
        minImages={3}
      />

      {/* 4 SECTIONS DÉTAILLÉES */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="font-bold text-sm text-white flex items-center gap-2">
          <Layers size={16} className="text-[#2a9d8f]" />
          <span>Contenu Détaillé du Traitement (4 Sections Alternées)</span>
        </div>

        {/* Section 1 : Indications */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-cyan-300">Section 1 — Indications & Douleurs Ciblées (Photo Gauche / Texte Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleMediaSelector
              label="Photo Section 1"
              value={item.section1_image || ""}
              onChange={(url) => onChange({ section1_image: url })}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre Section 1"
                value={lang === "en" ? (item.section1_title_en || "") : (item.section1_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section1_title_en: e.target.value } : { section1_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Indications médicales..."
                value={lang === "en" ? (item.section1_text_en || "") : (item.section1_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section1_text_en: e.target.value } : { section1_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Déroulement */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-emerald-300">Section 2 — Déroulement Précis du Geste (Texte Gauche / Photo Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre Section 2"
                value={lang === "en" ? (item.section2_title_en || "") : (item.section2_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section2_title_en: e.target.value } : { section2_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Position, guidage radiologique/échographique, durée..."
                value={lang === "en" ? (item.section2_text_en || "") : (item.section2_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section2_text_en: e.target.value } : { section2_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
            <SingleMediaSelector
              label="Photo Section 2"
              value={item.section2_image || ""}
              onChange={(url) => onChange({ section2_image: url })}
            />
          </div>
        </div>

        {/* Section 3 : Bénéfices */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-yellow-300">Section 3 — Bénéfices Attendus & Suites (Photo Gauche / Texte Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleMediaSelector
              label="Photo Section 3"
              value={item.section3_image || ""}
              onChange={(url) => onChange({ section3_image: url })}
            />
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre Section 3"
                value={lang === "en" ? (item.section3_title_en || "") : (item.section3_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section3_title_en: e.target.value } : { section3_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Soulagement et consignes post-intervention..."
                value={lang === "en" ? (item.section3_text_en || "") : (item.section3_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section3_text_en: e.target.value } : { section3_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Pathologies liées */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="font-semibold text-teal-300">Section 4 — Pathologies Associées (Texte Gauche / Photo Droite)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Titre Section 4"
                value={lang === "en" ? (item.section4_title_en || "") : (item.section4_title_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section4_title_en: e.target.value } : { section4_title_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
              />
              <textarea
                rows={3}
                placeholder="Pathologies cibles traitées..."
                value={lang === "en" ? (item.section4_text_en || "") : (item.section4_text_fr || "")}
                onChange={(e) => onChange(lang === "en" ? { section4_text_en: e.target.value } : { section4_text_fr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
            <SingleMediaSelector
              label="Photo Section 4"
              value={item.section4_image || ""}
              onChange={(url) => onChange({ section4_image: url })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// FORMULAIRE ARTICLES / BLOG (AVEC GALERIE DE 5 PHOTOS POUR LE CARROUSEL)
// ======================================================================
function ArticleForm({ item, onChange, lang }: any) {
  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1">Titre de l'Article [{lang.toUpperCase()}] *</label>
          <input
            type="text"
            value={lang === "en" ? (item.title_en || "") : (item.title_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { title_en: e.target.value } : { title_fr: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Identifiant d'URL (Slug) *</label>
          <input
            type="text"
            value={item.slug || ""}
            onChange={(e) => onChange({ slug: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Catégorie</label>
          <select
            value={item.category || "Innovations"}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          >
            <option value="Innovations">Innovations</option>
            <option value="Traitements">Traitements</option>
            <option value="Conseils Patients">Conseils Patients</option>
            <option value="Vie de l'Institut">Vie de l'Institut</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Auteur</label>
          <input
            type="text"
            value={item.author || ""}
            onChange={(e) => onChange({ author: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Rôle Auteur [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={lang === "en" ? (item.author_role_en || "") : (item.author_role_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { author_role_en: e.target.value } : { author_role_fr: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>
      </div>

      {/* Galerie de photos pour le carrousel */}
      <GalleryMediaSelector
        label="Galerie de Photos Défilantes pour l'Article & l'Accueil (5 Photos recommandées)"
        images={item.gallery_images || []}
        onChange={(images) => onChange({ gallery_images: images, cover_image: images[0] || item.cover_image })}
        minImages={3}
      />

      {/* ========================================================= */}
      {/* PARAMÈTRES D'AFFICHAGE & MISE EN AVANT (ACCUEIL & BLOG) */}
      {/* ========================================================= */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
        <div className="font-bold text-white text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#48cae4]" />
            <span>Mise en avant & Diffusion de l'Actualité</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Toggle 1: Actualité Principale (Haut de page Blog) */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <span>⭐ Actualité mise en évidence (Page Blog)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Place cet article tout en haut en grand format sur la page Actualités.
              </p>
            </div>
            <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => onChange({ is_featured: 1 })}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  item.is_featured === 1
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => onChange({ is_featured: 0 })}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  item.is_featured !== 1
                    ? "bg-slate-800 text-slate-200"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Non
              </button>
            </div>
          </div>

          {/* Toggle 2: Afficher dans le grand panneau d'Accueil */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <span>🏠 Afficher dans le grand panneau de l'Accueil</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Fait défiler les photos et textes de cet article dans la section À la une de l'accueil.
              </p>
            </div>
            <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => onChange({ show_in_home: 1 })}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  (item.show_in_home ?? 1) === 1
                    ? "bg-[#2a9d8f] text-white shadow-md shadow-[#2a9d8f]/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => onChange({ show_in_home: 0 })}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  (item.show_in_home ?? 1) === 0
                    ? "bg-slate-800 text-slate-200"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Non
              </button>
            </div>
          </div>
        </div>

        {/* Champs spécifiques conditionnels Accueil (FR & EN) */}
        {(item.show_in_home ?? 1) === 1 && (
          <div className="p-4 bg-gradient-to-br from-[#2a9d8f]/10 via-slate-900/90 to-slate-950 border border-[#2a9d8f]/30 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-[#48cae4] uppercase tracking-wider flex items-center gap-1.5">
                <span>✨ Textes personnalisés pour l'Accueil (FR & EN)</span>
              </span>
              <span className="text-[10px] text-slate-400 italic">
                (Optionnel : si vide, le titre et résumé normaux sont affichés)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Titre d'Accueil [FR]
                </label>
                <input
                  type="text"
                  placeholder={item.title_fr || "Titre pour l'accueil..."}
                  value={item.home_title_fr || ""}
                  onChange={(e) => onChange({ home_title_fr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Home Title [EN]
                </label>
                <input
                  type="text"
                  placeholder={item.title_en || "Title for home..."}
                  value={item.home_title_en || ""}
                  onChange={(e) => onChange({ home_title_en: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Commentaire / Accroche Accueil [FR]
                </label>
                <textarea
                  rows={2}
                  placeholder={item.summary_fr || "Court commentaire ou accroche pour l'accueil..."}
                  value={item.home_desc_fr || ""}
                  onChange={(e) => onChange({ home_desc_fr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Home Comment / Excerpt [EN]
                </label>
                <textarea
                  rows={2}
                  placeholder={item.summary_en || "Short comment or excerpt for home section..."}
                  value={item.home_desc_en || ""}
                  onChange={(e) => onChange({ home_desc_en: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Résumé Synthétique de l'Article [{lang.toUpperCase()}] *</label>
        <textarea
          rows={3}
          value={lang === "en" ? (item.summary_en || "") : (item.summary_fr || "")}
          onChange={(e) => onChange(lang === "en" ? { summary_en: e.target.value } : { summary_fr: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Corps Complet de l'Article [{lang.toUpperCase()}] *</label>
        <textarea
          rows={8}
          value={lang === "en" ? (item.content_en || "") : (item.content_fr || "")}
          onChange={(e) => onChange(lang === "en" ? { content_en: e.target.value } : { content_fr: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 font-mono text-xs"
        />
      </div>
    </div>
  );
}

// ======================================================================
// FORMULAIRE PAGE D'ACCUEIL
// ======================================================================
function HomePageEditor({ dataFr, dataEn, onChangeFr, onChangeEn, lang }: any) {
  const activeData = lang === "fr" ? dataFr : dataEn;
  const onChange = lang === "fr" ? onChangeFr : onChangeEn;

  return (
    <div className="space-y-6 text-xs p-6 bg-[#0c1a2e] border border-slate-800 rounded-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Édition Page d'Accueil — Section Hero Principal</h3>
        <p className="text-slate-400">Titres, sous-titres et vidéos de fond de la première section du site.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre Principal (Ligne 1) [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={activeData.heroTitle1 || ""}
            onChange={(e) => onChange({ heroTitle1: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre Animé (Ligne 2) [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={activeData.heroTitle2 || ""}
            onChange={(e) => onChange({ heroTitle2: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1">Sous-titre explicatif [{lang.toUpperCase()}]</label>
          <textarea
            rows={3}
            value={activeData.heroSubtitle || ""}
            onChange={(e) => onChange({ heroSubtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Texte Bouton RDV [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={activeData.heroBtn1 || ""}
            onChange={(e) => onChange({ heroBtn1: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Lien Bouton Doctolib</label>
          <input
            type="text"
            value={activeData.heroBtn1Url || "https://www.doctolib.fr"}
            onChange={(e) => onChange({ heroBtn1Url: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// FORMULAIRE À PROPOS
// ======================================================================
function AboutPageEditor({ dataFr, dataEn, onChangeFr, onChangeEn, lang }: any) {
  const activeData = lang === "fr" ? dataFr : dataEn;
  const onChange = lang === "fr" ? onChangeFr : onChangeEn;

  return (
    <div className="space-y-6 text-xs p-6 bg-[#0c1a2e] border border-slate-800 rounded-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Édition Page À Propos & Présentation Clinique</h3>
        <p className="text-slate-400">Présentation des fondateurs, de la vision médicale et de l'institut.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre Principal [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={activeData.aboutTitle || ""}
            onChange={(e) => onChange({ aboutTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Texte de Présentation [{lang.toUpperCase()}]</label>
          <textarea
            rows={5}
            value={activeData.aboutDesc || ""}
            onChange={(e) => onChange({ aboutDesc: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
