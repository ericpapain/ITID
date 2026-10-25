import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuthHeaders, getAdminToken } from "./auth";
import { SingleMediaSelector, GalleryMediaSelector } from "./MediaSelector";
import { CmsBackupRestorePanel } from "./CmsBackupRestorePanel";
import { RichContentEditor } from "./RichContentEditor";
import { TRAITEMENTS, PATHOLOGIES } from "../data";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  Eye,
  RefreshCw,
  Layers,
  Sparkles,
  Video,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Play,
  Monitor,
  Image as ImageIcon,
  Film,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  BookOpen,
  Star,
  Sliders,
  User,
  X
} from "lucide-react";
import {
  HeroMediaItem,
  extractYouTubeId,
  detectMediaType,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl
} from "../utils/mediaUtils";

type LangTab = "fr" | "en";

export default function AdminPagesEditor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = searchParams.get("section") || "hero_media";
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
    { id: "hero_media", label: "Médias Défilants (Accueil)", icon: "🎬" },
    { id: "cas_cliniques", label: "Cas Cliniques (Accueil)", icon: "🔬" },
    { id: "pathologies", label: "Pathologies", icon: "🦴" },
    { id: "traitements", label: "Traitements", icon: "💉" },
    { id: "articles", label: "Actualités & Blog", icon: "📰" },
    { id: "home", label: "Textes Page d'Accueil", icon: "🏠" },
    { id: "about", label: "À Propos & Équipe", icon: "🏥" },
    { id: "backup", label: "Sauvegarde & Restauration", icon: "🛡️" },
  ];

  const triggerAutoSnapshot = () => {
    fetch("/api/admin/cms?type=backup&action=export", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.backup) {
          localStorage.setItem(
            "itid_cms_auto_backup",
            JSON.stringify({
              saved_at: new Date().toISOString(),
              backup: d.backup,
            })
          );
        }
      })
      .catch(() => {});
  };

  // Chargement des données selon la section active
  const loadData = async (preferredId?: number) => {
    if (currentSection === "backup") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setSaveMessage(null);

    try {
      if (currentSection === "home" || currentSection === "about" || currentSection === "hero_media") {
        const pageKey = (currentSection === "hero_media" || currentSection === "home") ? "home" : currentSection;
        const res = await fetch(`/api/admin/cms?type=pages&page=${pageKey}`, {
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
              const targetId = preferredId ?? selectedItem?.id;
              const found = targetId ? data.items.find((it: any) => it.id === targetId) : null;
              setSelectedItem(found || data.items[0]);
            } else {
              setSelectedItem(null);
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
    setSelectedItem(null);
    loadData();
  }, [currentSection]);

  // Sauvegarde globale pour Home, Hero Media & About
  const handleSavePage = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const pageKey = (currentSection === "hero_media" || currentSection === "home") ? "home" : currentSection;
      const res = await fetch(`/api/admin/cms?type=pages&page=${pageKey}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content_fr: pageContentFr,
          content_en: pageContentEn,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur de sauvegarde");

      setSaveMessage("✅ Modifications enregistrées avec succès en base de données !");
      setTimeout(() => setSaveMessage(null), 4000);
      triggerAutoSnapshot();
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarde d'un élément (Pathologie, Traitement, Article, Cas Clinique)
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

      const savedId = isNew ? (data.id || itemToSave.id) : itemToSave.id;
      setSaveMessage(`✅ ${isNew ? "Création réussie" : "Modifications enregistrées"} avec succès !`);
      setTimeout(() => setSaveMessage(null), 4000);
      triggerAutoSnapshot();

      // Recharger la liste en conservant la fiche modifiée ou nouvellement créée active
      await loadData(savedId);
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
        section4_image: "/images/spine_isolated.png",
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
        section2_image: "/images/treatments/radiofrequence.jpg",
        section3_title_fr: "Bénéfices Attendus & Suites",
        section3_title_en: "Expected Benefits & Recovery",
        section3_text_fr: "Délai de soulagement et reprise d'activité...",
        section3_text_en: "Pain relief timeline and recovery...",
        section3_image: "/images/glowing_3d_spine.jpg",
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
        summary_fr: "Résumé accrocheur de l'article visible sur la carte...",
        summary_en: "Compelling article summary...",
        content_fr: "Corps complet de l'article médical...",
        content_en: "Full body text of medical article...",
        tags: "#ITID, #Innovations, #Algologie",
        cover_image: "/images/lombalgie.jpg",
        gallery_images: [
          "/images/lombalgie.jpg",
          "/images/glowing_3d_spine.jpg",
          "/images/spine_isolated.png",
          "/images/treatments/infiltrations_rachidiennes.jpg"
        ],
        sections: [
          {
            id: "sec-1",
            image: "/images/lombalgie.jpg",
            title: "Une reconnaissance internationale pour l'écosystème médical ITID",
            content: "L'Institut du Traitement Interventionnel de la Douleur innove continuellement en combinant diagnostic de haute précision et thérapeutiques ciblées sous contrôle de l'imagerie interventionnelle."
          },
          {
            id: "sec-2",
            image: "/images/treatments/infiltrations_rachidiennes.jpg",
            title: "Au cœur des enjeux de la prise en charge de la douleur chronique",
            content: "Nos spécialistes algologues et radiologues interventionnels travaillent de concert pour proposer des alternatives non chirurgicales et ultra-précises aux patients souffrant de douleurs rebelles."
          }
        ],
        is_published: 1,
        show_in_home: 1,
        is_featured: 0
      };
      setSelectedItem(newArt);
    } else if (currentSection === "cas_cliniques") {
      const newCas = {
        title_fr: "Nouveau Cas Clinique",
        title_en: "New Clinical Case",
        category_fr: "Geste Interventionnel",
        category_en: "Interventional Procedure",
        image: "/images/treatments/infiltrations_rachidiennes.jpg",
        traitement_slug: "infiltrations-rachidiennes",
        traitement_name: "Infiltrations Rachidiennes Guidées",
        pathologie_slug: "lombalgie-chronique",
        short_desc_fr: "Description clinique détaillée du cas, indication thérapeutique retenue, déroulement de l'intervention et résultat fonctionnel.",
        short_desc_en: "Detailed clinical case presentation, interventional technique applied and therapeutic outcome.",
        display_order: itemsList.length + 1,
        is_active: 1
      };
      setSelectedItem(newCas);
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
          {/* Bouton Accès Rapide Sauvegarde & Backup */}
          <button
            onClick={() => setSearchParams({ section: "backup" })}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentSection === "backup"
                ? "bg-amber-600 text-white border-amber-500 shadow-md"
                : "bg-slate-900 border-slate-700 text-amber-300 hover:border-amber-500/50 hover:bg-slate-800"
            }`}
            title="Centre de Sauvegarde & Restauration CMS"
          >
            <span>🛡️</span>
            <span className="hidden sm:inline">Sauvegarde & Backup</span>
          </button>

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

          {(currentSection === "home" || currentSection === "about" || currentSection === "hero_media") && (
            <button
              onClick={handleSavePage}
              disabled={saving}
              className="px-5 py-2.5 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer les modifications</span>}
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
              currentSection="pathologies"
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
              currentSection="traitements"
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
              currentSection="articles"
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

          {/* Rubrique MÉDIAS DÉFILANTS ACCUEIL (IMAGES / VIDÉOS) */}
          {currentSection === "hero_media" && (
            <HeroMediaDedicatedPageEditor
              dataFr={pageContentFr}
              dataEn={pageContentEn}
              onChangeFr={(data: any) => setPageContentFr((prev: any) => ({ ...prev, ...data }))}
              onChangeEn={(data: any) => setPageContentEn((prev: any) => ({ ...prev, ...data }))}
              onSave={handleSavePage}
              saving={saving}
              lang={lang}
            />
          )}

          {/* Rubrique CAS CLINIQUES (ACCUEIL) */}
          {currentSection === "cas_cliniques" && (
            <MasterDetailEditor
              title="Cas Cliniques (Slider Page d'Accueil)"
              currentSection="cas_cliniques"
              items={itemsList}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onAddNew={handleAddNew}
              onDelete={handleDeleteItem}
              onSave={handleSaveItem}
              saving={saving}
              lang={lang}
              renderForm={(item: any, onChange: any) => (
                <CasCliniqueForm item={item} onChange={onChange} lang={lang} />
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

          {/* Rubrique SAUVEGARDE & RESTAURATION CMS */}
          {currentSection === "backup" && (
            <CmsBackupRestorePanel
              lang={lang}
              onRestored={() => loadData()}
            />
          )}
        </div>
      )}
    </div>
  );
}

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ======================================================================
// COMPOSANT MASTER-DETAIL GÉNÉRIQUE (LISTE GAUCHE / FORMULAIRE DROITE)
// ======================================================================
function MasterDetailEditor({ title, items, selectedItem, onSelect, onAddNew, onDelete, onSave, saving, lang, renderForm, currentSection }: any) {
  const [formData, setFormData] = useState<any>(selectedItem || {});

  useEffect(() => {
    setFormData(selectedItem || {});
  }, [selectedItem]);

  const handleChange = (updatedFields: any) => {
    setFormData((prev: any) => ({ ...prev, ...updatedFields }));
  };

  const publicLink = (() => {
    if (!formData || !formData.slug) return null;
    if (currentSection === "pathologies") return `/pathologies/${formData.slug}`;
    if (currentSection === "traitements") return `/traitements/${formData.slug}`;
    if (currentSection === "articles") return `/actualites/${formData.slug}`;
    return null;
  })();

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
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {(it.cover_image || it.image || (it.gallery_images && it.gallery_images[0])) ? (
                      <img
                        src={it.cover_image || it.image || it.gallery_images[0]}
                        alt=""
                        onError={(e) => { e.currentTarget.src = "/images/lombalgie.jpg"; }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      it.icon || "📄"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{displayTitle}</span>
                      {it.is_featured === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          ⭐ À la une
                        </span>
                      )}
                      {(it.show_in_home ?? 1) === 1 && it.slug && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 shrink-0">
                          🏠 Accueil
                        </span>
                      )}
                      {it.is_active === 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                          ⛔ Masqué
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-2">
                      <span className="truncate">{it.slug ? `/${it.slug}` : (lang === "en" ? (it.category_en || it.category_fr) : (it.category_fr || it.category_en))}</span>
                      {it.date_published && (
                        <span className="text-slate-400 font-mono text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 flex items-center gap-1">
                          <Calendar size={10} className="text-[#48cae4]" /> {it.date_published}
                        </span>
                      )}
                    </div>
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

              <div className="flex items-center gap-2">
                {publicLink && (
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-[#48cae4] border border-[#2a9d8f]/30 hover:border-[#48cae4] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Voir la page publique en direct dans un nouvel onglet"
                  >
                    <ExternalLink size={13} />
                    <span>Voir en direct</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onSave(formData)}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer les modifications</span>}
                </button>
              </div>
            </div>

            {renderForm(formData, handleChange)}

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {publicLink ? (
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#48cae4] hover:underline font-semibold"
                >
                  <ExternalLink size={13} />
                  <span>Accéder à la page en direct : {publicLink}</span>
                </a>
              ) : <div />}
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
            onChange={(e) => {
              const newTitle = e.target.value;
              const updates: any = lang === "en" ? { title_en: newTitle } : { title_fr: newTitle };
              if (lang === "fr" && (!item.slug || item.slug.startsWith("nouvelle-pathologie-") || item.slug.startsWith("pathologie-"))) {
                const auto = slugify(newTitle);
                if (auto) updates.slug = auto;
              }
              onChange(updates);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-300 font-semibold">Identifiant d'URL (Slug) *</label>
            <button
              type="button"
              onClick={() => {
                const auto = slugify(item.title_fr || item.title_en || "");
                if (auto) onChange({ slug: auto });
              }}
              className="text-[10px] text-[#48cae4] hover:underline flex items-center gap-1 cursor-pointer"
              title="Générer un slug propre depuis le titre"
            >
              <span>🪄 Auto-Slug</span>
            </button>
          </div>
          <input
            type="text"
            value={item.slug || ""}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            placeholder="ex: lombalgie-chronique"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4] font-mono"
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

      {/* SECTIONS DÉTAILLÉES DYNAMIQUES (AJOUT / SUPPRESSION / RÉORDONNER / POSITION IMAGE) */}
      <DynamicSectionsManager
        sections={getEntitySections(item, defaultPathologyBadges)}
        onChangeSections={(next) => syncEntitySections(next, onChange)}
        lang={lang}
        title="Contenu Détaillé de la Pathologie (Sections Dynamiques)"
        subtitle="Ajoutez ou supprimez des sections, changez leur ordre et définissez la disposition de l'image (Gauche, Droite ou Pleine largeur)."
        defaultBadges={defaultPathologyBadges}
        placeholder="Explications médicales et physiopathologiques..."
      />
    </div>
  );
}

// Badges par défaut suggérés
const defaultPathologyBadges = [
  "Comprendre la Pathologie",
  "Diagnostic & Quand Consulter",
  "Traitements Interventionnels ITID",
  "Prévention & Conseils au Quotidien",
  "Recherche & Approches Futures",
  "Conseils & Prise en Charge"
];

const defaultTreatmentBadges = [
  "Indications & Douleurs Ciblées",
  "Déroulement Précis du Geste",
  "Bénéfices Attendus & Suites",
  "Pathologies Associées Prises en Charge",
  "Conseils Post-Intervention",
  "Suivi Thérapeutique"
];

interface DynamicSectionItem {
  id: string;
  badge?: string;
  title_fr?: string;
  title_en?: string;
  text_fr?: string;
  text_en?: string;
  image?: string;
  image_position?: "left" | "right" | "none";
}

// Extraction et normalisation des sections
function getEntitySections(item: any, defaultBadges: string[]): DynamicSectionItem[] {
  if (Array.isArray(item.sections) && item.sections.length > 0) {
    return item.sections;
  }
  const synthesized: DynamicSectionItem[] = [];
  for (let i = 1; i <= 4; i++) {
    const titleFr = item[`section${i}_title_fr`];
    const titleEn = item[`section${i}_title_en`];
    const textFr = item[`section${i}_text_fr`];
    const textEn = item[`section${i}_text_en`];
    const image = item[`section${i}_image`];
    const pos = item[`section${i}_image_position`] || (i % 2 === 1 ? "left" : "right");
    const badge = item[`section${i}_badge`] || defaultBadges[i - 1] || `Section ${i}`;

    if (titleFr || titleEn || textFr || textEn || image || i <= 2) {
      synthesized.push({
        id: `sec-${i}-${Date.now()}`,
        badge,
        title_fr: titleFr || "",
        title_en: titleEn || "",
        text_fr: textFr || "",
        text_en: textEn || "",
        image: image || "",
        image_position: pos
      });
    }
  }
  return synthesized.length > 0 ? synthesized : [
    {
      id: `sec-1-${Date.now()}`,
      badge: defaultBadges[0] || "Section 1",
      title_fr: "",
      title_en: "",
      text_fr: "",
      text_en: "",
      image: "",
      image_position: "left"
    }
  ];
}

// Synchronisation réversible avec les colonnes SQL section1_* à section4_*
function syncEntitySections(nextSections: DynamicSectionItem[], onChange: (data: any) => void) {
  const payload: any = {
    sections: nextSections,
    sections_json: JSON.stringify(nextSections)
  };
  for (let i = 1; i <= 4; i++) {
    const sec = nextSections[i - 1];
    if (sec) {
      payload[`section${i}_title_fr`] = sec.title_fr || "";
      payload[`section${i}_title_en`] = sec.title_en || "";
      payload[`section${i}_text_fr`] = sec.text_fr || "";
      payload[`section${i}_text_en`] = sec.text_en || "";
      payload[`section${i}_image`] = sec.image || "";
      payload[`section${i}_image_position`] = sec.image_position || (i % 2 === 1 ? "left" : "right");
      payload[`section${i}_badge`] = sec.badge || "";
    } else {
      payload[`section${i}_title_fr`] = "";
      payload[`section${i}_title_en`] = "";
      payload[`section${i}_text_fr`] = "";
      payload[`section${i}_text_en`] = "";
      payload[`section${i}_image`] = "";
      payload[`section${i}_image_position`] = "none";
      payload[`section${i}_badge`] = "";
    }
  }
  onChange(payload);
}

// ======================================================================
// COMPOSANT RÉUTILISABLE GESTIONNAIRE DYNAMIQUE DE SECTIONS (AJOUT / SUPPRESSION)
// ======================================================================
function DynamicSectionsManager({
  sections,
  onChangeSections,
  lang,
  title = "Contenu Détaillé de la Page",
  subtitle = "Ajoutez, supprimez, réordonnez vos sections et configurez la position de l'image (Gauche, Droite ou Pleine Largeur).",
  defaultBadges = [],
  placeholder = "Rédigez le contenu médical..."
}: {
  sections: DynamicSectionItem[];
  onChangeSections: (next: DynamicSectionItem[]) => void;
  lang: "fr" | "en";
  title?: string;
  subtitle?: string;
  defaultBadges?: string[];
  placeholder?: string;
}) {
  const handleAdd = () => {
    const newIdx = sections.length;
    const defaultBadge = defaultBadges[newIdx] || `Section #${newIdx + 1}`;
    const newSec: DynamicSectionItem = {
      id: "sec-" + Date.now(),
      badge: defaultBadge,
      title_fr: "",
      title_en: "",
      text_fr: "",
      text_en: "",
      image: "",
      image_position: newIdx % 2 === 0 ? "left" : "right"
    };
    onChangeSections([...sections, newSec]);
  };

  const handleUpdate = (idx: number, patch: Partial<DynamicSectionItem>) => {
    const next = [...sections];
    next[idx] = { ...next[idx], ...patch };
    onChangeSections(next);
  };

  const handleRemove = (idx: number) => {
    if (sections.length <= 1) {
      if (!confirm("Voulez-vous supprimer cette unique section ?")) return;
    }
    const next = sections.filter((_, i) => i !== idx);
    onChangeSections(next);
  };

  const handleMove = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    onChangeSections(next);
  };

  const badgeColors = [
    "text-cyan-300 border-cyan-500/30 bg-cyan-950/40",
    "text-emerald-300 border-emerald-500/30 bg-emerald-950/40",
    "text-yellow-300 border-yellow-500/30 bg-yellow-950/40",
    "text-teal-300 border-teal-500/30 bg-teal-950/40",
    "text-blue-300 border-blue-500/30 bg-blue-950/40",
    "text-purple-300 border-purple-500/30 bg-purple-950/40",
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <Layers size={17} className="text-[#2a9d8f]" />
            <span>{title}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#2a9d8f]/20 text-[#2a9d8f] border border-[#2a9d8f]/40 font-bold">
              {sections.length} {sections.length > 1 ? "sections" : "section"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Ajouter une section</span>
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-700 rounded-2xl text-center space-y-3 bg-slate-950/40">
          <Layers size={32} className="mx-auto text-slate-500 opacity-60" />
          <p className="text-slate-400 text-xs">
            Aucune section configurée pour l'instant. Cliquez ci-dessous pour ajouter votre première section.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-[#2a9d8f]/10 border border-[#2a9d8f]/40 text-[#2a9d8f] hover:bg-[#2a9d8f]/20 text-xs rounded-xl font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Ajouter la section #1</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((sec, idx) => {
            const currentPos = sec.image_position || (idx % 2 === 0 ? "left" : "right");
            const colorClass = badgeColors[idx % badgeColors.length];
            const currentTitle = lang === "en" ? (sec.title_en || "") : (sec.title_fr || "");
            const currentText = lang === "en" ? (sec.text_en || "") : (sec.text_fr || "");

            return (
              <div
                key={sec.id || idx}
                className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition-colors"
              >
                {/* Entête de la section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${colorClass}`}>
                      Section #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Badge / Thème (ex: Pour qui ?)"
                      value={sec.badge || ""}
                      onChange={(e) => handleUpdate(idx, { badge: e.target.value })}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:border-[#2a9d8f] outline-none"
                    />
                  </div>

                  {/* Boutons Position & Actions Réordonner / Supprimer */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Sélecteur position image */}
                    <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdate(idx, { image_position: "left" })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          currentPos === "left"
                            ? "bg-[#2a9d8f] text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Image positionnée à Gauche"
                      >
                        ⬅️ Gauche
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(idx, { image_position: "right" })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          currentPos === "right"
                            ? "bg-[#2a9d8f] text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Image positionnée à Droite"
                      >
                        Droite ➡️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(idx, { image_position: "none" })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          currentPos === "none"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="Aucune image : Texte sur toute la largeur (100%)"
                      >
                        🚫 Aucune
                      </button>
                    </div>

                    {/* Flèches monter / descendre */}
                    <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Monter cette section"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === sections.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Descendre cette section"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-1"
                        title="Supprimer cette section"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulaire de la section */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Titre de la Section #{idx + 1} [{lang.toUpperCase()}]
                    </label>
                    <input
                      type="text"
                      placeholder={`Ex: Titre de la section ${idx + 1}`}
                      value={currentTitle}
                      onChange={(e) =>
                        handleUpdate(
                          idx,
                          lang === "en"
                            ? { title_en: e.target.value }
                            : { title_fr: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white text-sm focus:border-[#2a9d8f] outline-none"
                    />
                  </div>

                  {currentPos !== "none" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className={currentPos === "left" ? "order-1" : "order-2"}>
                        <SingleMediaSelector
                          label={`Photo Section #${idx + 1} (${currentPos === "left" ? "Affichée à Gauche" : "Affichée à Droite"})`}
                          value={sec.image || ""}
                          onChange={(url) => handleUpdate(idx, { image: url })}
                        />
                      </div>
                      <div className={`space-y-1 ${currentPos === "left" ? "order-2" : "order-1"}`}>
                        <RichContentEditor
                          label={`Contenu Section #${idx + 1} [${lang.toUpperCase()}]`}
                          placeholder={placeholder}
                          value={currentText}
                          onChange={(val) =>
                            handleUpdate(
                              idx,
                              lang === "en"
                                ? { text_en: val }
                                : { text_fr: val }
                            )
                          }
                          minHeight="170px"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>
                          <strong>Image désactivée :</strong> Le texte occupera automatiquement toute la largeur disponible (100%) sans espace vide.
                        </span>
                      </div>
                      <RichContentEditor
                        label={`Contenu Pleine Largeur Section #${idx + 1} [${lang.toUpperCase()}]`}
                        placeholder={placeholder}
                        value={currentText}
                        onChange={(val) =>
                          handleUpdate(
                            idx,
                            lang === "en"
                              ? { text_en: val }
                              : { text_fr: val }
                          )
                        }
                        minHeight="170px"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ======================================================================
// FORMULAIRE TRAITEMENT (BILINGUE + RECTO/VERSO + 4 SECTIONS AVEC POSITION IMAGE)
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
            onChange={(e) => {
              const newTitle = e.target.value;
              const updates: any = lang === "en" ? { title_en: newTitle } : { title_fr: newTitle };
              if (lang === "fr" && (!item.slug || item.slug.startsWith("traitement-") || item.slug.startsWith("nouveau-traitement-"))) {
                const auto = slugify(newTitle);
                if (auto) updates.slug = auto;
              }
              onChange(updates);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-300 font-semibold">Identifiant d'URL (Slug) *</label>
            <button
              type="button"
              onClick={() => {
                const auto = slugify(item.title_fr || item.title_en || "");
                if (auto) onChange({ slug: auto });
              }}
              className="text-[10px] text-[#48cae4] hover:underline flex items-center gap-1 cursor-pointer"
              title="Générer un slug propre depuis le titre"
            >
              <span>🪄 Auto-Slug</span>
            </button>
          </div>
          <input
            type="text"
            value={item.slug || ""}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            placeholder="ex: radiofrequence"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4] font-mono"
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

      {/* SECTIONS DÉTAILLÉES DYNAMIQUES (AJOUT / SUPPRESSION / RÉORDONNER / POSITION IMAGE) */}
      <DynamicSectionsManager
        sections={getEntitySections(item, defaultTreatmentBadges)}
        onChangeSections={(next) => syncEntitySections(next, onChange)}
        lang={lang}
        title="Contenu Détaillé du Traitement (Sections Dynamiques)"
        subtitle="Ajoutez ou supprimez des sections, changez leur ordre et définissez la disposition de l'image (Gauche, Droite ou Pleine largeur)."
        defaultBadges={defaultTreatmentBadges}
        placeholder="Indications médicales validées, protocole interventionnel, bénéfices attendus..."
      />
    </div>
  );
}


// ======================================================================
// COMPOSANT UPLOADER IMAGE AVEC PREVIEW & BOUTON TÉLÉCHARGER DU PC
// ======================================================================
function ArticleImageUploader({
  value,
  onChange,
  label,
  placeholder = "URL de l'image ou cliquer sur 'Télécharger du PC'"
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getAdminToken();
      if (token) formData.append("token", token);

      const headers = getAuthHeaders();
      delete (headers as any)["Content-Type"];

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers,
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          onChange(data.url);
          setUploading(false);
          return;
        }
      }

      // Fallback local base64 si l'API backend n'est pas dispo en dev
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      // Fallback direct base64
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-slate-200 font-semibold text-xs">{label}</label>}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-slate-900/90 border border-slate-700 rounded-sm pl-9 pr-3 py-2 text-xs text-white focus:border-[#48cae4] focus:ring-1 focus:ring-[#48cae4] outline-none transition-all placeholder:text-slate-500"
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto px-3.5 py-2 text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 border border-[#48cae4]/40 bg-[#48cae4]/10 hover:bg-[#48cae4]/20 text-[#48cae4] hover:text-white whitespace-nowrap disabled:opacity-50 transition-all font-semibold cursor-pointer shadow-sm"
          >
            {uploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#48cae4]/40 border-t-[#48cae4] rounded-full animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <Upload size={14} className="text-[#48cae4]" />
                <span>Télécharger du PC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {value && (
        <div className="mt-2.5 p-1.5 bg-[#0a0d0f] rounded-sm border border-slate-800 inline-block max-w-[220px] relative group">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-black/50">
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded transition-colors"
              title="Supprimer l'image"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

// ======================================================================
// FORMULAIRE ARTICLES / BLOG (REFONTE INSPIRÉE DU CMS AVEC SECTIONS G/D)
// ======================================================================
function ArticleForm({ item, onChange, lang }: any) {
  const [customCatMode, setCustomCatMode] = useState(false);

  // Sections dynamiques alternées G/D
  const sections: any[] = Array.isArray(item.sections) ? item.sections : [];

  const handleAddSection = () => {
    const isImageLeft = sections.length % 2 === 0;
    const newSec = {
      id: "sec-" + Date.now(),
      image: "",
      title: "",
      title_fr: "",
      title_en: "",
      content: "",
      content_fr: "",
      content_en: "",
      image_position: isImageLeft ? "left" : "right",
      disposition: isImageLeft ? "image-left" : "image-right"
    };
    onChange({ sections: [...sections, newSec] });
  };

  const handleUpdateSection = (index: number, updatedFields: any) => {
    const next = [...sections];
    next[index] = { ...next[index], ...updatedFields };
    onChange({ sections: next });
  };

  const handleRemoveSection = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    onChange({ sections: next });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange({ sections: next });
  };

  const predefinedCategories = [
    "INNOVATION & THÉRAPIES",
    "ÉVÉNEMENTS & CONGRÈS",
    "CAS CLINIQUES & RECHERCHE",
    "CONSEILS PATIENTS",
    "VIE DE L'INSTITUT",
    "STRATÉGIE & PARTENARIATS"
  ];

  return (
    <div className="space-y-8 text-xs text-slate-200">
      {/* En-tête style CMS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="eyebrow mb-1.5 flex items-center gap-2 text-[#48cae4] text-xs font-semibold tracking-wider uppercase">
            <BookOpen size={14} className="text-[#48cae4]" />
            <span>CMS · Articles & Publications</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Gestion du <span className="text-[#48cae4]">Blog & Actualités ITID</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Créez, modifiez et enrichissez vos articles avec images, sections alternées G/D, mise en avant à la une et carrousel d'accueil.
          </p>
        </div>
      </div>

      {/* Boîte principale du formulaire */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-sm p-6 relative overflow-hidden space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-full bg-[#48cae4]/10 border border-[#48cae4]/30 flex items-center justify-center text-[#48cae4] shrink-0">
            <Edit3 size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Modifier l'article de blog</h3>
            <p className="text-[11px] text-slate-400">
              Remplissez les informations et ajoutez autant d'images et sections alternées que nécessaire.
            </p>
          </div>
        </div>

        {/* Titre et Slug */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-white block">
              Titre de l'article [{lang.toUpperCase()}] <span className="text-[#48cae4]">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Prise en charge interventionnelle de la lombalgie chronique rebelle"
              className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
              required
              value={lang === "en" ? (item.title_en || "") : (item.title_fr || "")}
              onChange={(e) => {
                const newTitle = e.target.value;
                const updates: any = lang === "en" ? { title_en: newTitle } : { title_fr: newTitle };
                if (lang === "fr" && (!item.slug || item.slug.startsWith("article-") || item.slug.startsWith("nouvel-article-"))) {
                  const auto = slugify(newTitle);
                  if (auto) updates.slug = auto;
                }
                onChange(updates);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-white block">
                Slug d'URL <span className="text-[#48cae4]">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const auto = slugify(item.title_fr || item.title_en || "");
                  if (auto) onChange({ slug: auto });
                }}
                className="text-[10px] text-[#48cae4] hover:underline flex items-center gap-1 cursor-pointer"
                title="Générer un slug propre depuis le titre"
              >
                <span>🪄 Auto-Slug</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="ex: lombalgie-chronique-recherche"
              className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2.5 text-xs text-[#48cae4] font-mono outline-none transition-colors"
              required
              value={item.slug || ""}
              onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            />
          </div>
        </div>

        {/* Catégorie, Date, Temps de lecture */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-white">Catégorie</label>
              <button
                type="button"
                onClick={() => setCustomCatMode(!customCatMode)}
                className="text-[11px] text-[#48cae4] hover:underline font-medium cursor-pointer"
              >
                {customCatMode ? "← Liste prédéfinie" : "+ Saisie personnalisée"}
              </button>
            </div>
            {customCatMode ? (
              <input
                type="text"
                placeholder="Nouvelle catégorie..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
                value={item.category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            ) : (
              <select
                value={item.category || predefinedCategories[0]}
                onChange={(e) => {
                  if (e.target.value === "CUSTOM") {
                    setCustomCatMode(true);
                  } else {
                    onChange({ category: e.target.value });
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
              >
                {predefinedCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="CUSTOM">+ Autre catégorie personnalisée...</option>
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-white">Date de publication</label>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const formatted = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                  onChange({ date_published: formatted });
                }}
                className="text-[10px] text-[#48cae4] hover:underline font-normal cursor-pointer"
              >
                Aujourd'hui
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Ex: 15 Octobre 2026"
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3 py-2 text-xs text-white outline-none transition-colors font-medium"
                value={item.date_published || ""}
                onChange={(e) => onChange({ date_published: e.target.value })}
              />
              <input
                type="date"
                title="Choisir dans le calendrier"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const parts = e.target.value.split("-");
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    const formatted = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                    onChange({ date_published: formatted });
                  }
                }}
                className="w-8 h-8 p-1 bg-slate-800 border border-slate-700 rounded-sm text-slate-300 cursor-pointer text-xs shrink-0 hover:bg-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-white block">
              Temps de lecture
            </label>
            <input
              type="text"
              placeholder="Ex: 4 min"
              className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
              value={lang === "en" ? (item.read_time_en || "") : (item.read_time_fr || "")}
              onChange={(e) => onChange(lang === "en" ? { read_time_en: e.target.value } : { read_time_fr: e.target.value })}
            />
          </div>
        </div>

        {/* Auteur et Rôle */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-white block">Auteur</label>
            <input
              type="text"
              placeholder="Ex: Dr. Marc Moreau"
              className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
              value={item.author || ""}
              onChange={(e) => onChange({ author: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-white block">
              Rôle de l'Auteur [{lang.toUpperCase()}]
            </label>
            <input
              type="text"
              placeholder="Ex: Algologue / Radiologue interventionnel"
              className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
              value={lang === "en" ? (item.author_role_en || "") : (item.author_role_fr || "")}
              onChange={(e) => onChange(lang === "en" ? { author_role_en: e.target.value } : { author_role_fr: e.target.value })}
            />
          </div>
        </div>

        {/* Image principale de couverture */}
        <div className="space-y-2 pt-2">
          <ArticleImageUploader
            label="Image principale de couverture *"
            value={item.cover_image || ""}
            onChange={(url) => onChange({ cover_image: url })}
            placeholder="URL de l'image de couverture ou cliquer sur 'Télécharger du PC'"
          />
        </div>

        {/* Résumé / Extrait d'accroche */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-white block">
            Résumé / Extrait d'accroche [{lang.toUpperCase()}] <span className="text-[#48cae4]">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Court résumé de l'article visible sur la carte et en haut d'article..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2.5 text-xs text-white outline-none transition-colors resize-none leading-relaxed"
            required
            value={lang === "en" ? (item.summary_en || "") : (item.summary_fr || "")}
            onChange={(e) => onChange(lang === "en" ? { summary_en: e.target.value } : { summary_fr: e.target.value })}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-white block">
            Tags (séparés par des virgules)
          </label>
          <input
            type="text"
            placeholder="Ex: #ITID, #Innovation, #Lombalgie, #Algologie, #Recherche"
            className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3.5 py-2 text-xs text-white outline-none transition-colors"
            value={item.tags || ""}
            onChange={(e) => onChange({ tags: e.target.value })}
          />
        </div>

        {/* Toggles : Slider Accueil & Actualité Principale */}
        <div className="p-5 rounded-sm border border-[#48cae4]/40 bg-[#48cae4]/5 grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#48cae4]" />
              <span className="text-xs uppercase tracking-wider font-bold text-white">
                Afficher dans le slider d'accueil ?
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Si OUI, cet article glissera dans le carrousel dynamique de la page d'accueil.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChange({ show_in_home: 1 })}
                className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  (item.show_in_home ?? 1) === 1
                    ? "bg-[#48cae4] text-slate-950 shadow-md shadow-[#48cae4]/20"
                    : "bg-black/40 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                <Check size={14} /> Oui
              </button>
              <button
                type="button"
                onClick={() => onChange({ show_in_home: 0 })}
                className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  (item.show_in_home ?? 1) === 0
                    ? "bg-slate-700 text-white shadow-md"
                    : "bg-black/40 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                <X size={14} /> Non
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#48cae4]" />
              <span className="text-xs uppercase tracking-wider font-bold text-white">
                Actualité Principale (À la une du Blog) ?
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Si OUI, il sera mis en valeur dans la grande zone du haut de page du Blog (Image gauche, texte droite).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChange({ is_featured: 1 })}
                className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.is_featured === 1
                    ? "bg-[#48cae4] text-slate-950 shadow-md shadow-[#48cae4]/20"
                    : "bg-black/40 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                <Check size={14} /> Oui
              </button>
              <button
                type="button"
                onClick={() => onChange({ is_featured: 0 })}
                className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.is_featured !== 1
                    ? "bg-slate-700 text-white shadow-md"
                    : "bg-black/40 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                <X size={14} /> Non
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* SECTIONS & IMAGES DE L'ARTICLE (ALTERNANCE G/D) */}
        {/* ====================================================================== */}
        <div className="space-y-5 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-[#48cae4]" />
                <span>Sections & Images de l'article (Alternance G/D)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajoutez autant d'images et de paragraphes que vous le souhaitez. Ils s'afficheront sur la page de lecture complète de façon alternée (Image à gauche → Image à droite → etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSection}
              className="px-3.5 py-1.5 rounded-sm bg-[#48cae4]/10 hover:bg-[#48cae4]/20 border border-[#48cae4]/40 text-[#48cae4] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus size={14} /> Ajouter une image / section
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-700 rounded-sm text-center space-y-3 bg-slate-950/40">
              <p className="text-slate-400 text-xs">
                Aucune section alternée pour l'instant. Cliquez ci-dessous pour ajouter votre premier bloc image/texte.
              </p>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 bg-[#48cae4]/10 border border-[#48cae4]/40 text-[#48cae4] hover:bg-[#48cae4]/20 text-xs rounded-sm font-semibold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus size={14} /> Ajouter la section #1
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sec, idx) => {
                const imgPos = sec.image_position || (idx % 2 === 0 ? "left" : "right");
                return (
                  <div
                    key={sec.id || idx}
                    className="p-4 rounded-sm border border-slate-700/80 bg-black/40 space-y-4 relative group hover:border-[#48cae4]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#48cae4]/20 text-[#48cae4] border border-[#48cae4]/30 font-bold">
                          Section #{idx + 1}
                        </span>
                        
                        {/* Sélecteur Position Image Gauche / Droite / Aucune */}
                        <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded p-0.5 text-[11px]">
                          <span className="text-[10px] text-slate-400 font-semibold px-1.5 uppercase">Image :</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSection(idx, { image_position: "left" })}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              imgPos === "left"
                                ? "bg-[#48cae4] text-[#0c1a2e] font-bold shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Gauche
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSection(idx, { image_position: "right" })}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              imgPos === "right"
                                ? "bg-[#48cae4] text-[#0c1a2e] font-bold shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Droite
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSection(idx, { image_position: "none" })}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              imgPos === "none"
                                ? "bg-amber-400 text-[#0c1a2e] font-bold shadow-xs"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Aucune
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "up")}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Monter cette section"
                          >
                            <ArrowUp size={14} />
                          </button>
                        )}
                        {idx < sections.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "down")}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Descendre cette section"
                          >
                            <ArrowDown size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          className="text-slate-400 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"
                          title="Supprimer cette section"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className={imgPos === "none" ? "space-y-3" : "grid md:grid-cols-2 gap-4"}>
                      {/* Colonne Image (si non masquée) */}
                      {imgPos !== "none" && (
                        <div className="space-y-2">
                          <ArticleImageUploader
                            label={`Image de cette section (${imgPos === "left" ? "Gauche" : "Droite"})`}
                            value={sec.image || ""}
                            onChange={(url) => handleUpdateSection(idx, { image: url })}
                            placeholder="URL de l'image ou cliquer sur 'Télécharger du PC'"
                          />
                        </div>
                      )}

                      {/* Colonne Contenu / Éditeur Riche */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-semibold text-white block mb-1">
                            Sous-titre de la section [{lang.toUpperCase()}]
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Opportunités thérapeutiques et perspectives"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-[#48cae4] rounded-sm px-3 py-2 text-xs text-white outline-none transition-colors"
                            value={lang === "en" ? (sec.title_en ?? sec.title ?? "") : (sec.title_fr ?? sec.title ?? "")}
                            onChange={(e) =>
                              handleUpdateSection(
                                idx,
                                lang === "en"
                                  ? { title_en: e.target.value }
                                  : { title_fr: e.target.value, title: e.target.value }
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-semibold text-white block mb-1">
                            Texte détaillé / Éditeur Riche [{lang.toUpperCase()}]
                          </label>
                          <RichContentEditor
                            value={lang === "en" ? (sec.content_en ?? sec.content ?? "") : (sec.content_fr ?? sec.content ?? "")}
                            onChange={(val) =>
                              handleUpdateSection(
                                idx,
                                lang === "en"
                                  ? { content_en: val }
                                  : { content_fr: val, content: val }
                              )
                            }
                            placeholder="Rédigez le texte de la section, insérez tableaux, gras, listes, liens internes..."
                            minHeight="140px"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Galerie défilante 5 photos */}
        <div className="pt-4 border-t border-slate-800">
          <GalleryMediaSelector
            label="Galerie de Photos Défilantes pour l'Article & l'Accueil (5 Photos recommandées)"
            images={item.gallery_images || []}
            onChange={(images) => onChange({ gallery_images: images, cover_image: images[0] || item.cover_image })}
            minImages={3}
          />
        </div>

        {/* Corps complémentaire / Synthèse (Optionnel) */}
        <div className="pt-4 border-t border-slate-800 space-y-1.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-white block">
            Texte de conclusion / Corps complémentaire [{lang.toUpperCase()}]
          </label>
          <RichContentEditor
            value={lang === "en" ? (item.content_en || "") : (item.content_fr || "")}
            onChange={(val) => onChange(lang === "en" ? { content_en: val } : { content_fr: val })}
            placeholder="Texte de synthèse ou conclusion de l'article (tableaux, liens internes vers traitements...)..."
            minHeight="140px"
          />
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// PAGE DÉDIÉE : GESTION DES MÉDIAS DÉFILANTS ACCUEIL (PHOTOS, VIDÉOS, YOUTUBE)
// ======================================================================
function HeroMediaDedicatedPageEditor({
  dataFr,
  dataEn,
  onChangeFr,
  onChangeEn,
  onSave,
  saving,
  lang
}: any) {
  const activeData = lang === "fr" ? dataFr : dataEn;
  const heroMediaList: HeroMediaItem[] =
    activeData.heroMediaList || dataFr.heroMediaList || dataEn.heroMediaList || [];

  const handleUpdateMediaList = (newList: HeroMediaItem[]) => {
    onChangeFr({ heroMediaList: newList });
    onChangeEn({ heroMediaList: newList });
  };

  const totalDuration = heroMediaList.reduce((acc, m) => acc + (m.duration || (m.type === "image" ? 7 : 12)), 0);

  return (
    <div className="space-y-6">
      {/* Barre d'en-tête de la rubrique */}
      <div className="p-6 bg-gradient-to-r from-[#0c1a2e] via-[#10243e] to-[#0c1a2e] border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎬</span>
            <h2 className="text-xl font-bold text-white">Médias Défilants en Arrière-Plan (Page d'Accueil)</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 font-bold">
              Carrousel Fond Actif
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Ajoutez, réordonnez ou supprimez les visuels d'arrière-plan de la section principale.
            Vous pouvez téléverser des photos et des vidéos depuis votre PC (MP4/WebM), ajouter des liens YouTube ou des URLs externes.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f]"></span>
              <span className="font-semibold">{heroMediaList.length} média(s) configuré(s)</span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>⏱️ Durée totale d'un cycle complet :</span>
                <span className="font-mono text-white font-bold">{totalDuration} secondes</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer les Médias</span>}
        </button>
      </div>

      {/* Gestionnaire complet */}
      <HeroMediaLoopManager
        mediaList={heroMediaList}
        onChange={handleUpdateMediaList}
        heroTitle1={activeData.heroTitle1 || "Institut du Traitement"}
        heroTitle2={activeData.heroTitle2 || "Interventionnel de la Douleur"}
      />

      {/* Barre de sauvegarde basse */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <span className="text-xs text-slate-400">
          N'oubliez pas d'enregistrer après avoir ajouté, supprimé ou réordonné vos médias.
        </span>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <span>💾 Enregistrer les Médias de l'Accueil</span>}
        </button>
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

  // Liste de médias partagée entre FR et EN
  const heroMediaList: HeroMediaItem[] =
    activeData.heroMediaList || dataFr.heroMediaList || dataEn.heroMediaList || [];

  const handleUpdateMediaList = (newList: HeroMediaItem[]) => {
    onChangeFr({ heroMediaList: newList });
    onChangeEn({ heroMediaList: newList });
  };

  return (
    <div className="space-y-8">
      {/* 1. Titres et Textes de la section Hero */}
      <div className="space-y-6 text-xs p-6 bg-[#0c1a2e] border border-slate-800 rounded-3xl shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>✍️</span>
            <span>Titres & Appels à l'action — Hero Principal</span>
          </h3>
          <p className="text-slate-400">
            Personnalisez les textes affichés au premier plan du site [{lang.toUpperCase()}].
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Titre Principal (Ligne 1) [{lang.toUpperCase()}]
            </label>
            <input
              type="text"
              value={activeData.heroTitle1 || ""}
              onChange={(e) => onChange({ heroTitle1: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Titre Animé (Ligne 2) [{lang.toUpperCase()}]
            </label>
            <input
              type="text"
              value={activeData.heroTitle2 || ""}
              onChange={(e) => onChange({ heroTitle2: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">
              Sous-titre explicatif [{lang.toUpperCase()}]
            </label>
            <textarea
              rows={3}
              value={activeData.heroSubtitle || ""}
              onChange={(e) => onChange({ heroSubtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Texte Bouton RDV [{lang.toUpperCase()}]
            </label>
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

      {/* 2. Gestionnaire des Médias d'Arrière-Plan (Vidéos, YouTube, Images) */}
      <HeroMediaLoopManager
        mediaList={heroMediaList}
        onChange={handleUpdateMediaList}
        heroTitle1={activeData.heroTitle1 || "Institut du Traitement"}
        heroTitle2={activeData.heroTitle2 || "Interventionnel de la Douleur"}
      />
    </div>
  );
}

// ======================================================================
// COMPOSANT ICÔNE YOUTUBE PERSONNALISÉ
// ======================================================================
function YouTubeIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ======================================================================
// COMPOSANT GESTIONNAIRE DES MÉDIAS DE FOND EN BOUCLE (IMAGES, MP4, YOUTUBE)
// ======================================================================
function HeroMediaLoopManager({
  mediaList,
  onChange,
  heroTitle1,
  heroTitle2
}: {
  mediaList: HeroMediaItem[];
  onChange: (newList: HeroMediaItem[]) => void;
  heroTitle1: string;
  heroTitle2: string;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "youtube" | "url">("upload");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [durationInput, setDurationInput] = useState<number>(7);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewIdx, setPreviewIdx] = useState(0);

  const currentMediaList: HeroMediaItem[] =
    Array.isArray(mediaList) && mediaList.length > 0
      ? mediaList
      : [
          {
            id: "default-video-1",
            type: "video",
            url: "/images/video-fond.mp4",
            title: "Vidéo Fond Institut (Originale)",
            duration: 12
          },
          {
            id: "default-img-1",
            type: "image",
            url: "/images/lombalgie.jpg",
            title: "Plateau Interventionnel Guidé",
            duration: 7
          },
          {
            id: "default-img-2",
            type: "image",
            url: "/images/glowing_3d_spine.jpg",
            title: "Plateau Technique & Imagerie",
            duration: 7
          }
        ];

  // Upload depuis l'ordinateur (Images et Vidéos, support sélection multiple)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadStatus(null);

    const token = getAdminToken();
    const headers = getAuthHeaders();
    delete (headers as any)["Content-Type"];

    const newItems: HeroMediaItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus(`Téléversement de ${file.name} (${i + 1}/${files.length})...`);

        const formData = new FormData();
        formData.append("file", file);
        if (token) {
          formData.append("token", token);
        }

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers,
          body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Erreur lors de l'envoi de ${file.name}`);
        }

        const detectedType = detectMediaType(data.url);
        newItems.push({
          id: "media-" + Date.now() + "-" + i,
          type: detectedType,
          url: data.url,
          title: files.length === 1 && titleInput.trim() ? titleInput.trim() : file.name.replace(/\.[^/.]+$/, ""),
          duration: durationInput || (detectedType === "image" ? 7 : 12)
        });
      }

      onChange([...currentMediaList, ...newItems]);
      setTitleInput("");
      setUploadStatus(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Ajout lien YouTube
  const handleAddYouTube = () => {
    setError(null);
    const ytId = extractYouTubeId(youtubeInput);
    if (!ytId) {
      setError("Lien YouTube non valide. Collez un lien comme https://www.youtube.com/watch?v=... ou https://youtu.be/...");
      return;
    }

    const newMedia: HeroMediaItem = {
      id: "yt-" + Date.now(),
      type: "youtube",
      url: `https://www.youtube.com/watch?v=${ytId}`,
      title: titleInput.trim() || `Vidéo YouTube (${ytId})`,
      duration: durationInput || 12
    };

    onChange([...currentMediaList, newMedia]);
    setYoutubeInput("");
    setTitleInput("");
  };

  // Ajout URL web externe
  const handleAddUrl = () => {
    setError(null);
    if (!urlInput.trim()) {
      setError("Veuillez renseigner une URL valide");
      return;
    }

    const detected = detectMediaType(urlInput);
    const newMedia: HeroMediaItem = {
      id: "url-" + Date.now(),
      type: detected,
      url: urlInput.trim(),
      title: titleInput.trim() || (detected === "video" ? "Vidéo Web" : "Image Web"),
      duration: durationInput || (detected === "image" ? 6 : 10)
    };

    onChange([...currentMediaList, newMedia]);
    setUrlInput("");
    setTitleInput("");
  };

  // Suppression d'un média avec confirmation
  const handleDelete = (index: number) => {
    const itemToDelete = currentMediaList[index];
    const itemLabel = itemToDelete?.title || `Média #${index + 1}`;
    if (!window.confirm(`Voulez-vous vraiment supprimer "${itemLabel}" du défilement ?`)) {
      return;
    }
    const updated = currentMediaList.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Déplacement ordre
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMediaList.length) return;
    const updated = [...currentMediaList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  // Modification d'un champ d'un média
  const handleUpdateItem = (index: number, fields: Partial<HeroMediaItem>) => {
    const updated = [...currentMediaList];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  };

  const activePreviewMedia = currentMediaList[previewIdx % currentMediaList.length] || currentMediaList[0];
  const previewYtId = activePreviewMedia ? extractYouTubeId(activePreviewMedia.url) : null;

  return (
    <div className="space-y-6 text-xs p-6 bg-[#0c1a2e] border border-slate-800 rounded-3xl shadow-xl">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>🎞️</span>
            <span>Médias de Fond Défilants en Boucle (Hero Principal)</span>
          </h3>
          <p className="text-slate-400">
            Ajoutez autant d'images ou de vidéos que souhaité (upload PC, lien YouTube ou URL). Elles s'enchaînent en boucle fluide derrière la section principale.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 font-bold text-xs whitespace-nowrap self-start sm:self-auto">
          {currentMediaList.length} média(s) en boucle
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {uploadStatus && (
        <div className="p-3 bg-blue-950/60 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin text-blue-400" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Onglets d'Ajout de Nouveaux Médias */}
      <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <span className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Plus size={14} className="text-[#2a9d8f]" />
            <span>Ajouter un Média à la Boucle</span>
          </span>
          <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "upload" ? "bg-[#2a9d8f] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload size={13} />
              <span>Depuis mon PC (Photos & Vidéos)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("youtube")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "youtube" ? "bg-[#ef4444] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <YouTubeIcon size={13} />
              <span>Lien YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "url" ? "bg-[#3b82f6] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <LinkIcon size={13} />
              <span>URL Web</span>
            </button>
          </div>
        </div>

        {/* Tab 1 : Upload PC (Photo ou Vidéo MP4/WEBM/MOV) */}
        {activeTab === "upload" && (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-slate-300 font-semibold mb-1">
                  Titre / Légende (Optionnel)
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="ex: Vidéo intervention au bloc ou photo IRM"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Durée (sec)
                </label>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={durationInput}
                  onChange={(e) => setDurationInput(parseInt(e.target.value, 10) || 7)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-mono text-xs"
                />
              </div>

              <div className="md:col-span-5 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/ogg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 px-4 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Téléversement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Choisir Photos ou Vidéos sur mon PC</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              💡 Accepte tous les fichiers : Photos (JPG, PNG, WEBP) et Vidéos (MP4, WEBM, MOV) jusqu'à 50 Mo. Vous pouvez sélectionner plusieurs fichiers à la fois.
            </p>
          </div>
        )}

        {/* Tab 2 : Lien YouTube */}
        {activeTab === "youtube" && (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="block text-slate-300 font-semibold mb-1">
                  Lien de la vidéo YouTube *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-[#ef4444] focus:outline-none"
                  />
                  <YouTubeIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-slate-300 font-semibold mb-1">
                  Titre du média (Optionnel)
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="ex: Présentation Clinique ITID"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleAddYouTube}
                  className="w-full py-2 px-3 bg-[#ef4444] hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Plus size={14} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {extractYouTubeId(youtubeInput) && (
              <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-lg border border-red-500/30">
                <img
                  src={getYouTubeThumbnailUrl(extractYouTubeId(youtubeInput)!)}
                  alt="Aperçu YouTube"
                  className="w-20 h-12 object-cover rounded-md"
                />
                <div className="text-[11px] text-slate-300">
                  <div className="font-bold text-red-400">Vidéo YouTube Détectée</div>
                  <div className="text-slate-400 font-mono text-[10px]">ID: {extractYouTubeId(youtubeInput)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3 : URL Web externe */}
        {activeTab === "url" && (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="block text-slate-300 font-semibold mb-1">
                  URL distante de l'image ou vidéo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="/uploads/... ou https://.../video.mp4"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-[#3b82f6] focus:outline-none"
                  />
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-slate-300 font-semibold mb-1">
                  Titre (Optionnel)
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="ex: Imagerie Médicale HD"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="w-full py-2 px-3 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Plus size={14} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des Médias de la Boucle (Réordonnables et Supprimables) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            Ordre de passage des médias dans le fond :
          </span>
          <span className="text-[11px] text-slate-400">
            Utilisez les flèches pour changer l'ordre d'affichage
          </span>
        </div>

        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {currentMediaList.map((m, index) => {
            const ytId = extractYouTubeId(m.url);
            const isVideo = !ytId && (m.type === "video" || m.url.endsWith(".mp4") || m.url.endsWith(".webm") || m.url.endsWith(".mov"));

            return (
              <div
                key={m.id || index}
                className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Miniature & Informations */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-20 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center group">
                    {ytId ? (
                      <>
                        <img
                          src={getYouTubeThumbnailUrl(ytId)}
                          alt={m.title || "YouTube"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <YouTubeIcon size={18} className="text-red-500" />
                        </div>
                      </>
                    ) : isVideo ? (
                      <>
                        <video
                          src={m.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Film size={16} className="text-purple-400" />
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={m.url}
                          alt={m.title || "Image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 px-1 rounded bg-black/60 text-[9px] text-emerald-400 font-bold">
                          IMG
                        </div>
                      </>
                    )}
                  </div>

                  {/* Détails du média */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">#{index + 1}</span>
                      <input
                        type="text"
                        value={m.title || ""}
                        onChange={(e) => handleUpdateItem(index, { title: e.target.value })}
                        placeholder="Titre du média..."
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-[#2a9d8f] focus:outline-none font-bold text-white text-xs px-1 py-0.5 truncate flex-1"
                      />
                      {ytId ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                          ▶️ YouTube
                        </span>
                      ) : isVideo ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                          🎬 Vidéo MP4
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          🖼️ Photo
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate px-1">
                      {m.url}
                    </div>
                  </div>
                </div>

                {/* Réglages durée, téléchargement PC & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Durée :</span>
                    <input
                      type="number"
                      min={3}
                      max={60}
                      value={m.duration || (isVideo || ytId ? 12 : 7)}
                      onChange={(e) => handleUpdateItem(index, { duration: parseInt(e.target.value, 10) || 7 })}
                      className="w-12 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-white text-xs"
                    />
                    <span>sec</span>
                  </div>

                  {/* Boutons d'ordonnancement & Téléchargement */}
                  <div className="flex items-center gap-1">
                    {/* Téléchargement direct sur PC */}
                    {!ytId && m.url && (
                      <a
                        href={m.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-[#2a9d8f] text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Télécharger ce média sur mon PC"
                      >
                        <Download size={13} />
                      </a>
                    )}

                    {/* Lien direct YouTube */}
                    {ytId && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Ouvrir la vidéo sur YouTube"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Monter dans la boucle"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === currentMediaList.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Descendre dans la boucle"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer ce média de la boucle"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aperçu en direct du Hero de l'accueil */}
      <div className="p-5 bg-gradient-to-br from-[#071322] to-[#0a1628] rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Monitor size={14} className="text-[#2a9d8f]" />
            <span>Aperçu en Direct de la Section Principale (Hero)</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              Média {((previewIdx % currentMediaList.length) + 1)} / {currentMediaList.length}
            </span>
            <button
              type="button"
              onClick={() => setPreviewIdx((prev) => (prev + 1) % currentMediaList.length)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Play size={10} />
              <span>Suivant</span>
            </button>
          </div>
        </div>

        {/* Cadre de simulation de la section Hero */}
        <div className="relative w-full h-[280px] md:h-[340px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center text-center p-6 bg-slate-950">
          {/* Média d'arrière-plan actif */}
          {activePreviewMedia && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {previewYtId ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewYtId)}
                  title="YouTube Preview"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] object-cover opacity-50"
                  frameBorder="0"
                />
              ) : activePreviewMedia.type === "video" || activePreviewMedia.url.endsWith(".mp4") ? (
                <video
                  src={activePreviewMedia.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover opacity-50"
                />
              ) : (
                <img
                  src={activePreviewMedia.url}
                  alt="Aperçu image"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/40 via-transparent to-[#0a1628]/90" />
            </div>
          )}

          {/* Superposition Titres Hero */}
          <div className="relative z-10 max-w-lg space-y-2 pointer-events-none">
            <span className="inline-block py-0.5 px-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] text-[#48cae4] font-bold uppercase tracking-wider">
              {activePreviewMedia?.title || "Média d'Arrière-Plan"}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
              {heroTitle1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48cae4]">
                {heroTitle2}
              </span>
            </h2>
            <div className="flex justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-[#2a9d8f] text-white font-bold text-[10px]">
                Prendre Rendez-vous
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-white font-bold text-[10px] border border-slate-700">
                Découvrir l'expertise
              </span>
            </div>
          </div>
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

// ======================================================================
// FORMULAIRE CAS CLINIQUE (BILINGUE + TRAITEMENT ASSOCIÉ + PHOTO + LIVE PREVIEW)
// ======================================================================
function CasCliniqueForm({ item, onChange, lang }: any) {
  const currentTitle = lang === "en" ? (item.title_en || "") : (item.title_fr || "");
  const currentCategory = lang === "en" ? (item.category_en || "") : (item.category_fr || "");
  const currentDesc = lang === "en" ? (item.short_desc_en || "") : (item.short_desc_fr || "");

  const [isFlippedPreview, setIsFlippedPreview] = useState(false);

  // Traitements & Pathologies pour association obligatoire
  const treatmentOptions = [
    { slug: "infiltrations-rachidiennes", name: "Infiltrations Rachidiennes Guidées" },
    { slug: "infiltrations-articulaires", name: "Infiltrations Articulaires Échoguidées" },
    { slug: "perfusion-lidocaine", name: "Perfusions de Lidocaïne / Kétamine" },
    { slug: "stimulation-ganglion-dorsal", name: "Stimulation du Ganglion Spinal (DRG)" },
    { slug: "cryoneurolyse", name: "Cryoneurolyse Percutanée" },
    { slug: "rtms", name: "Stimulation Magnétique Transcrânienne (rTMS)" },
    { slug: "blocs-anesthesiques", name: "Blocs Anesthésiques Diagnostiques & Thérapeutiques" },
    { slug: "radiofrequence", name: "Radiofréquence Pulsée & Thermique" },
    { slug: "toxine-botulique", name: "Injections de Toxine Botulique" },
    { slug: "tens", name: "Neurostimulation Transcutanée (TENS)" },
    { slug: "catheter-perinerveux", name: "Cathéters Périnerveux & Bloc Continu" },
    { slug: "patch-capsaicine", name: "Patch de Capsaïcine Haute Concentration (8%)" },
    { slug: "hypnovr", name: "Réalité Virtuelle Thérapeutique (HypnoVR)" },
    { slug: "stimulation-medullaire", name: "Stimulation Médullaire Haute Définition" }
  ];

  const pathologyOptions = [
    { slug: "lombalgie-chronique", name: "Lombalgie chronique & Sciatique" },
    { slug: "nevralgie-arnold", name: "Névralgie d'Arnold (Occipitale)" },
    { slug: "sdrc", name: "Syndrome Douloureux Régional Complexe (SDRC)" },
    { slug: "endometriose", name: "Endométriose & Douleurs Pelviennes" },
    { slug: "douleurs-articulaires", name: "Douleurs Articulaires & Arthrose" },
    { slug: "fibromyalgie", name: "Fibromyalgie & Sensibilisation Centrale" },
    { slug: "douleurs-neuropathiques", name: "Douleurs Neuropathiques Périphériques" },
    { slug: "douleurs-post-op", name: "Douleurs Chroniques Post-Chirurgicales" },
    { slug: "migraines", name: "Migraines & Céphalées Réfractaires" }
  ];

  const selectedTreatment = treatmentOptions.find(t => t.slug === item.traitement_slug) || treatmentOptions[0];

  return (
    <div className="space-y-6 text-xs">
      {/* Association Métier Obligatoire : Cas Clinique -> Traitement & Pathologie */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-[#48cae4]/40 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
          <span>💉</span>
          <span>Liaison Métier Centrale : Traitement Associé (Obligatoire)</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          Chaque cas clinique de l'accueil est directement rattaché à un traitement interventionnel précis.
          Le bouton <strong>« En savoir plus »</strong> et la fiche détaillée redirigeront automatiquement vers la page de ce traitement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-white font-semibold mb-1">
              Traitement Médical Associé *
            </label>
            <select
              value={item.traitement_slug || "infiltrations-rachidiennes"}
              onChange={(e) => {
                const found = treatmentOptions.find(t => t.slug === e.target.value);
                onChange({
                  traitement_slug: e.target.value,
                  traitement_name: found ? found.name : e.target.value
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-[#48cae4]/60 rounded-xl text-white font-bold text-xs focus:border-[#48cae4] outline-none"
            >
              {treatmentOptions.map((tr) => (
                <option key={tr.slug} value={tr.slug}>
                  {tr.name} (/traitements/{tr.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">
              Pathologie Concernée
            </label>
            <select
              value={item.pathologie_slug || "lombalgie-chronique"}
              onChange={(e) => onChange({ pathologie_slug: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold text-xs focus:border-[#2a9d8f] outline-none"
            >
              {pathologyOptions.map((pa) => (
                <option key={pa.slug} value={pa.slug}>
                  {pa.name} (/pathologies/{pa.slug})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Information bilingue & Statut */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Titre selon langue */}
        <div className="md:col-span-6">
          <label className="block text-slate-300 font-semibold mb-1">
            Titre du Cas Clinique [{lang.toUpperCase()}] *
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) =>
              onChange(lang === "en" ? { title_en: e.target.value } : { title_fr: e.target.value })
            }
            placeholder={lang === "en" ? "e.g. Guided Lumbar Infiltration" : "ex: Infiltration Lombaire Guidée"}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:border-[#2a9d8f] focus:outline-none transition-all"
          />
        </div>

        {/* Catégorie selon langue */}
        <div className="md:col-span-6">
          <label className="block text-slate-300 font-semibold mb-1">
            Sous-titre / Geste / Catégorie [{lang.toUpperCase()}] *
          </label>
          <input
            type="text"
            value={currentCategory}
            onChange={(e) =>
              onChange(lang === "en" ? { category_en: e.target.value } : { category_fr: e.target.value })
            }
            placeholder={lang === "en" ? "e.g. Spine & Low Back Pain" : "ex: Rachis & Lombalgie"}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[#48cae4] font-medium text-sm focus:border-[#2a9d8f] focus:outline-none transition-all"
          />
        </div>

        {/* Ordre d'affichage & Statut visible */}
        <div className="md:col-span-6">
          <label className="block text-slate-300 font-semibold mb-1">
            Ordre d'apparition dans le défilement (1, 2, 3...)
          </label>
          <input
            type="number"
            min={0}
            value={item.display_order ?? 0}
            onChange={(e) => onChange({ display_order: parseInt(e.target.value, 10) || 0 })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-[#2a9d8f] focus:outline-none"
          />
        </div>

        <div className="md:col-span-6 flex flex-col justify-end">
          <label className="block text-slate-300 font-semibold mb-1">Visibilité sur le site</label>
          <button
            type="button"
            onClick={() => onChange({ is_active: item.is_active === 0 ? 1 : 0 })}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              (item.is_active ?? 1) === 1
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            <span>{(item.is_active ?? 1) === 1 ? "✅ Visible sur l'Accueil" : "⛔ Masqué de l'Accueil"}</span>
            <span className="text-[10px] underline">Cliquer pour changer</span>
          </button>
        </div>
      </div>

      {/* Description clinique complète avec éditeur riche */}
      <div className="space-y-2">
        <RichContentEditor
          label={`Description Clinique Détaillée du Cas [${lang.toUpperCase()}] *`}
          placeholder="Ex: Patient de 54 ans présentant une lombosciatique L5-S1 hyperalgique résistante. Geste d'infiltration foraminale réalisé sous contrôle scopique millimétrique..."
          value={currentDesc}
          onChange={(val) => onChange(lang === "en" ? { short_desc_en: val } : { short_desc_fr: val })}
          minHeight="160px"
        />
      </div>

      {/* Sélecteur de média pour la photo du cas clinique */}
      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
        <SingleMediaSelector
          label="Photo du Cas Clinique (Upload fichier local ou URL Web) *"
          value={item.image || ""}
          onChange={(url) => onChange({ image: url })}
        />
      </div>

      {/* Aperçu en direct (Live Simulation) avec Flip interactif */}
      <div className="p-5 bg-gradient-to-br from-[#071322] to-[#0a1628] rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>👁️</span>
            <span>Aperçu Interactif en Direct (Carte Recto / Verso)</span>
          </span>
          <button
            type="button"
            onClick={() => setIsFlippedPreview(!isFlippedPreview)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            <span>{isFlippedPreview ? "Voir Recto" : "Voir Verso (Flip)"}</span>
          </button>
        </div>

        <div className="flex justify-center p-4 bg-slate-950/50 rounded-xl">
          <div className="relative w-[300px] h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-[1mm] bg-white/10 backdrop-blur-md">
            {!isFlippedPreview ? (
              // Face Avant
              <div className="relative w-full h-full rounded-[calc(1rem-1mm)] overflow-hidden bg-[#0a1628]">
                <img
                  src={item.image && !item.image.includes("unsplash.com") ? item.image : "/images/treatments/infiltrations_rachidiennes.jpg"}
                  alt={currentTitle || "Aperçu"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1628]/30 to-[#0a1628]/95" />

                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] font-bold text-cyan-300">
                    Recto
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
                  <span className="inline-block py-1 px-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[11px] font-semibold text-[#48cae4] tracking-widest uppercase">
                    {currentCategory || "Geste Thérapeutique"}
                  </span>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">
                    {currentTitle || "Cas Clinique"}
                  </h3>
                  <div className="pt-2">
                    <span className="text-[11px] text-cyan-300 flex items-center gap-1">
                      <span>🔗</span>
                      <span>Lié à : {selectedTreatment.name}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Face Arrière
              <div className="relative w-full h-full rounded-[calc(1rem-1mm)] p-6 bg-gradient-to-br from-[#10243e] to-[#0c1a2e] flex flex-col justify-between text-white">
                <div className="space-y-3 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                      Verso (Détails)
                    </span>
                    <span className="text-[10px] text-slate-400">ITID Clinique</span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {currentTitle || "Cas Clinique"}
                  </h4>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                    {currentDesc ? (
                      <div dangerouslySetInnerHTML={{ __html: currentDesc }} />
                    ) : (
                      <span className="italic text-slate-500">Aucune description saisie...</span>
                    )}
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-400">Traitement appliqué :</div>
                    <div className="font-bold text-[#48cae4]">{selectedTreatment.name}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] text-center font-bold text-xs shadow-md">
                    Voir la fiche du traitement →
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


