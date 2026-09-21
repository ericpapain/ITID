import React, { useState } from "react";

export default function AdminMediaLibrary() {
  const [medias, setMedias] = useState([
    {
      id: "hero_video",
      name: "Vidéo Hero Principale (Accueil)",
      type: "video",
      currentUrl: "/videos/hero.mp4",
      section: "Accueil (Hero)",
      weight: "14.1 Mo",
    },
    {
      id: "parcours_video",
      name: "Vidéo Parcours Patient",
      type: "video",
      currentUrl: "/videos/parcours-patient.mp4",
      section: "Accueil (Parcours)",
      weight: "23.2 Mo",
    },
    {
      id: "interventions_video",
      name: "Vidéo Gestes & Blocs",
      type: "video",
      currentUrl: "/videos/video-intervention.mp4",
      section: "Accueil (Masonry)",
      weight: "15.4 Mo",
    },
    {
      id: "pathologies_video",
      name: "Vidéo d'Ambiance Pathologies",
      type: "video",
      currentUrl: "/videos/pathologie-2.mp4",
      section: "Page Pathologies",
      weight: "14.0 Mo",
    },
    {
      id: "logo_itid",
      name: "Logo Officiel ITID France",
      type: "image",
      currentUrl: "/logos/logo ITID 3.png",
      section: "Header & Footer",
      weight: "1.1 Mo",
    },
  ]);

  const [editId, setEditId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const handleUpdate = (id: string) => {
    if (!newUrl.trim()) return;
    setMedias((prev) =>
      prev.map((m) => (m.id === id ? { ...m, currentUrl: newUrl.trim() } : m))
    );
    setEditId(null);
    setNewUrl("");
    alert("URL du média mise à jour avec succès.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bibliothèque Médias & Vidéos</h1>
        <p className="text-xs text-slate-400 mt-1">
          Inventaire et gestion des vidéos d'arrière-plan et images clés du site.
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medias.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-[#0c1a2e] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-[#48cae4]">
                  {m.type}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{m.weight}</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{m.name}</h3>
              <p className="text-xs text-[#2a9d8f] mb-3">Emplacement : {m.section}</p>

              {/* Preview */}
              <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-3 flex items-center justify-center">
                {m.type === "video" ? (
                  <div className="text-center text-slate-500 text-xs">
                    <span className="text-2xl block mb-1">🎬</span>
                    <span className="text-[10px] truncate max-w-[200px] block px-2 text-slate-400">{m.currentUrl}</span>
                  </div>
                ) : (
                  <img src={m.currentUrl} alt={m.name} className="w-full h-full object-contain p-2" />
                )}
              </div>

              <div className="text-[11px] text-slate-400 truncate mb-4">
                <strong>Source :</strong> {m.currentUrl}
              </div>
            </div>

            <div>
              {editId === m.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Nouvelle URL ou chemin local"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(m.id)}
                      className="flex-1 py-1.5 bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs font-bold rounded-lg"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditId(m.id);
                    setNewUrl(m.currentUrl);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Remplacer l'URL du média
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
