import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuthHeaders } from "./auth";

type LangTab = "fr" | "en";

export default function AdminPagesEditor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = searchParams.get("section") || "home";
  const [lang, setLang] = useState<LangTab>("fr");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // État local des sections FR et EN
  const [contentFr, setContentFr] = useState<any>({});
  const [contentEn, setContentEn] = useState<any>({});

  // Option d'envoi automatique de newsletter lors de la publication d'un article
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  const sectionsList = [
    { id: "home", label: "Page d'Accueil", icon: "🏠" },
    { id: "pathologies", label: "Pathologies", icon: "🦴" },
    { id: "traitements", label: "Traitements", icon: "💉" },
    { id: "blog", label: "Actualités & Blog", icon: "📰" },
    { id: "formations", label: "Formations Médicales", icon: "🎓" },
    { id: "about", label: "À Propos & Équipe", icon: "🏥" },
  ];

  // Chargement des données de la section
  useEffect(() => {
    async function loadSection() {
      setLoading(true);
      setSaveMessage(null);
      try {
        const res = await fetch(`/api/content/${currentSection}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setContentFr(data.content_fr || getDefaultData(currentSection, "fr"));
          setContentEn(data.content_en || getDefaultData(currentSection, "en"));
        } else {
          setContentFr(getDefaultData(currentSection, "fr"));
          setContentEn(getDefaultData(currentSection, "en"));
        }
      } catch {
        setContentFr(getDefaultData(currentSection, "fr"));
        setContentEn(getDefaultData(currentSection, "en"));
      } finally {
        setLoading(false);
      }
    }

    loadSection();
  }, [currentSection]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const payload: any = {
        content_fr: contentFr,
        content_en: contentEn,
      };

      if (currentSection === "blog" && notifyNewsletter) {
        payload.notifyNewsletter = true;
        payload.articleInfo = {
          title: contentFr.latestArticleTitle || "Nouvel article médical ITID",
          summary: contentFr.latestArticleSummary || "Découvrez notre nouvelle publication.",
          url: "https://itid-france.com/actualites",
        };
      }

      const res = await fetch(`/api/content/${currentSection}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }

      setSaveMessage("✅ Modifications enregistrées avec succès en base de données !");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const activeContent = lang === "fr" ? contentFr : contentEn;
  const setActiveContent = (updater: any) => {
    if (lang === "fr") {
      setContentFr(updater);
    } else {
      setContentEn(updater);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Éditeur de Pages & Contenus (CMS)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestion intégrale et bilingue des textes, médias et vidéos de toutes les pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Double onglet linguistique strict FR / EN */}
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

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <span>💾 Enregistrer la page</span>
            )}
          </button>
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

      {/* Navigation entre sections */}
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

      {/* Editor Content Area */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0c1a2e] border border-slate-800 shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Chargement du contenu...</div>
        ) : (
          <div>
            {currentSection === "home" && (
              <HomeEditor
                data={activeContent}
                lang={lang}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}

            {currentSection === "pathologies" && (
              <PathologiesEditor
                data={activeContent}
                lang={lang}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}

            {currentSection === "traitements" && (
              <TraitementsEditor
                data={activeContent}
                lang={lang}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}

            {currentSection === "blog" && (
              <BlogEditor
                data={activeContent}
                lang={lang}
                notifyNewsletter={notifyNewsletter}
                setNotifyNewsletter={setNotifyNewsletter}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}

            {currentSection === "formations" && (
              <FormationsEditor
                data={activeContent}
                lang={lang}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}

            {currentSection === "about" && (
              <AboutEditor
                data={activeContent}
                lang={lang}
                onChange={(updated: any) => setActiveContent((prev: any) => ({ ...prev, ...updated }))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sous-éditeurs par page
// -------------------------------------------------------------

function HomeEditor({ data, lang, onChange }: any) {
  return (
    <div className="space-y-8 text-xs">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Section 1 — Hero Principal</h3>
        <p className="text-slate-400">Titre principal, sous-titre et vidéo de fond.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre principal (Ligne 1) [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={data.heroTitle1 || ""}
            onChange={(e) => onChange({ heroTitle1: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre animé (Ligne 2) [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={data.heroTitle2 || ""}
            onChange={(e) => onChange({ heroTitle2: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1">Sous-titre explicatif [{lang.toUpperCase()}]</label>
          <textarea
            rows={2}
            value={data.heroSubtitle || ""}
            onChange={(e) => onChange({ heroSubtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Texte Bouton CTA 1</label>
          <input
            type="text"
            value={data.heroBtn1 || ""}
            onChange={(e) => onChange({ heroBtn1: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Lien Bouton CTA 1 (Doctolib)</label>
          <input
            type="text"
            value={data.heroBtn1Url || "https://www.doctolib.fr"}
            onChange={(e) => onChange({ heroBtn1Url: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div className="md:col-span-2 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="font-semibold text-white mb-2">Paramètres Vidéo de fond (Hero)</div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Chemin ou URL de la vidéo (ex: /videos/hero.mp4)"
              value={data.heroVideoUrl || ""}
              onChange={(e) => onChange({ heroVideoUrl: e.target.value })}
              className="flex-1 w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={data.heroVideoLoop !== false}
                onChange={(e) => onChange({ heroVideoLoop: e.target.checked })}
                className="w-4 h-4 rounded text-[#2a9d8f] focus:ring-0"
              />
              <span>Lecture en boucle (Loop)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 pt-6 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Section 2 — Parcours Patient</h3>
      </div>
      <div>
        <label className="block text-slate-300 font-semibold mb-1">Titre de la section Parcours [{lang.toUpperCase()}]</label>
        <input
          type="text"
          value={data.parcoursTitle || ""}
          onChange={(e) => onChange({ parcoursTitle: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
        />
      </div>
    </div>
  );
}

function PathologiesEditor({ data, lang, onChange }: any) {
  const items = data.items || [];

  const updateItem = (index: number, field: string, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange({ items: next });
  };

  const addItem = () => {
    const newItem = {
      title: "Nouvelle Pathologie",
      desc: "Description clinique de la pathologie...",
      icon: "🩺",
      color: "#2a9d8f",
      wikipediaUrl: "",
    };
    onChange({ items: [newItem, ...items] });
  };

  const removeItem = (index: number) => {
    if (!window.confirm("Supprimer cette pathologie ?")) return;
    onChange({ items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Gestion des Fiches Pathologies ({items.length})</h3>
          <p className="text-slate-400">Présentes dans le carrousel 3D et dans la vue détaillée.</p>
        </div>
        <button
          onClick={addItem}
          className="px-3 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Ajouter une Pathologie</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative group">
            <button
              onClick={() => removeItem(idx)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-sm"
              title="Supprimer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={item.icon || "🩺"}
                onChange={(e) => updateItem(idx, "icon", e.target.value)}
                className="w-12 text-center py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg"
              />
              <input
                type="text"
                placeholder="Nom de la pathologie"
                value={item.title || ""}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Description clinique [{lang.toUpperCase()}]</label>
              <textarea
                rows={3}
                value={item.desc || ""}
                onChange={(e) => updateItem(idx, "desc", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Lien Wikipédia / Ressource"
                value={item.wikipediaUrl || ""}
                onChange={(e) => updateItem(idx, "wikipediaUrl", e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-[11px] text-slate-300"
              />
              <input
                type="text"
                placeholder="Couleur thème (ex: #2a9d8f)"
                value={item.color || "#2a9d8f"}
                onChange={(e) => updateItem(idx, "color", e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-[11px] text-slate-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TraitementsEditor({ data, lang, onChange }: any) {
  const items = data.items || [];

  const updateItem = (index: number, field: string, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange({ items: next });
  };

  const addItem = () => {
    const newItem = {
      num: String(items.length + 1).padStart(2, "0"),
      title: "Nouveau Traitement",
      desc: "Description du geste interventionnel...",
      icon: "💉",
    };
    onChange({ items: [...items, newItem] });
  };

  const removeItem = (index: number) => {
    if (!window.confirm("Supprimer ce geste interventionnel ?")) return;
    onChange({ items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Traitements & Gestes Interventionnels ({items.length})</h3>
          <p className="text-slate-400">Présents sur la page /traitements avec cartes recto/verso interactives.</p>
        </div>
        <button
          onClick={addItem}
          className="px-3 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Ajouter un Traitement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative group">
            <button
              onClick={() => removeItem(idx)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={item.num || "01"}
                onChange={(e) => updateItem(idx, "num", e.target.value)}
                className="w-12 text-center py-2 bg-slate-950 border border-slate-700 rounded-xl font-bold text-[#48cae4]"
              />
              <input
                type="text"
                placeholder="Intitulé du traitement"
                value={item.title || ""}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Description du geste [{lang.toUpperCase()}]</label>
              <textarea
                rows={3}
                value={item.desc || ""}
                onChange={(e) => updateItem(idx, "desc", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogEditor({ data, lang, notifyNewsletter, setNotifyNewsletter, onChange }: any) {
  return (
    <div className="space-y-6 text-xs">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Actualités & Publications Médicales</h3>
        <p className="text-slate-400">Gestion des articles de blog et déclenchement automatique de newsletter.</p>
      </div>

      <div className="p-4 bg-slate-900 border border-[#2a9d8f]/30 rounded-2xl space-y-3">
        <div className="font-semibold text-white">Publication d'un nouvel article :</div>
        <div className="space-y-3">
          <div>
            <label className="block text-slate-300 mb-1">Titre de l'article [{lang.toUpperCase()}]</label>
            <input
              type="text"
              value={data.latestArticleTitle || ""}
              onChange={(e) => onChange({ latestArticleTitle: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Résumé synthétique [{lang.toUpperCase()}]</label>
            <textarea
              rows={3}
              value={data.latestArticleSummary || ""}
              onChange={(e) => onChange({ latestArticleSummary: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewsletter}
                onChange={(e) => setNotifyNewsletter(e.target.checked)}
                className="w-4 h-4 rounded text-[#2a9d8f]"
              />
              <span>📢 Envoyer automatiquement une notification newsletter à tous les abonnés lors de l'enregistrement</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormationsEditor({ data, lang, onChange }: any) {
  return (
    <div className="space-y-6 text-xs">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">Formations & E-Learning</h3>
        <p className="text-slate-400">Présentation du cursus et informations de lancement.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre de la page [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={data.formationsTitle || "Formations Médicales & Masterclasses"}
            onChange={(e) => onChange({ formationsTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Description introductive [{lang.toUpperCase()}]</label>
          <textarea
            rows={3}
            value={data.formationsDesc || ""}
            onChange={(e) => onChange({ formationsDesc: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>
      </div>
    </div>
  );
}

function AboutEditor({ data, lang, onChange }: any) {
  return (
    <div className="space-y-6 text-xs">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white mb-1">À Propos & Présentation Clinique</h3>
        <p className="text-slate-400">Textes fondateurs, historique et coordonnées.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Titre de la section [{lang.toUpperCase()}]</label>
          <input
            type="text"
            value={data.aboutTitle || "L'Excellence Médicale au Service du Patient"}
            onChange={(e) => onChange({ aboutTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Paragraphe descriptif [{lang.toUpperCase()}]</label>
          <textarea
            rows={4}
            value={data.aboutDesc || ""}
            onChange={(e) => onChange({ aboutDesc: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
          />
        </div>
      </div>
    </div>
  );
}

function getDefaultData(section: string, lang: "fr" | "en") {
  if (section === "home") {
    return lang === "fr"
      ? {
          heroTitle1: "Institut du Traitement",
          heroTitle2: "Interventionnel de la Douleur",
          heroSubtitle: "Centre d'excellence pour l'évaluation et le traitement de pointe des douleurs chroniques rebelles.",
          heroBtn1: "Prendre Rendez-vous",
          heroBtn1Url: "https://www.doctolib.fr",
          heroVideoUrl: "/videos/hero.mp4",
          heroVideoLoop: true,
          parcoursTitle: "Votre parcours à l'ITID",
        }
      : {
          heroTitle1: "Institute for Interventional",
          heroTitle2: "Pain Treatment",
          heroSubtitle: "Center of excellence for advanced assessment and targeted intervention for refractory chronic pain.",
          heroBtn1: "Book Appointment",
          heroBtn1Url: "https://www.doctolib.fr",
          heroVideoUrl: "/videos/hero.mp4",
          heroVideoLoop: true,
          parcoursTitle: "Your journey at ITID",
        };
  }
  if (section === "pathologies") {
    return {
      items: [
        { title: "Lombalgies chroniques", desc: "Douleurs du bas du dos rebelles aux traitements usuels.", icon: "🦴", color: "#48d1c2" },
        { title: "Névralgie d'Arnold", desc: "Céphalées et douleurs nerveuses occipitales sévères.", icon: "⚡", color: "#2a9d8f" },
        { title: "SDRC", desc: "Syndrome douloureux régional complexe post-traumatique.", icon: "🔥", color: "#e76f51" },
        { title: "Endométriose", desc: "Douleurs pelviennes chroniques invalidantes.", icon: "🌸", color: "#e9c46a" },
        { title: "Douleurs articulaires", desc: "Arthrose et arthropathies résistantes.", icon: "🦿", color: "#f4a261" },
      ],
    };
  }
  if (section === "traitements") {
    return {
      items: [
        { num: "01", title: "Infiltrations épidurales & rachidiennes", desc: "Sous guidage radiologique pour une précision millimétrique.", icon: "💉" },
        { num: "02", title: "Radiofréquence pulsée", desc: "Neuromodulation ciblée pour inhiber les messages douloureux.", icon: "⚡" },
        { num: "03", title: "Cryoneurolyse", desc: "Application contrôlée de froid thérapeutique sur les nerfs périphériques.", icon: "❄️" },
        { num: "04", title: "Stimulation médullaire", desc: "Implantation d'électrodes de haute technologie pour soulager les douleurs rebelles.", icon: "⚙️" },
      ],
    };
  }
  return {};
}
