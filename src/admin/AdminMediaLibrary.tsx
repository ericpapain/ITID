import React, { useState, useEffect, useRef } from "react";
import { getAuthHeaders, getAdminToken } from "./auth";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  HardDrive
} from "lucide-react";

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  file_hash?: string;
  media_type: "image" | "video" | "document";
  alt_text_fr?: string;
  alt_text_en?: string;
  created_at: string;
}

export default function AdminMediaLibrary() {
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "orphans">("library");
  const [orphansData, setOrphansData] = useState<{ filesWithoutDb: any[]; dbWithoutFiles: any[] } | null>(null);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedias = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const url = activeTab === "orphans"
        ? `/api/admin/media?audit=orphans`
        : `/api/admin/media?type=${filterType === "all" ? "" : filterType}&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setMedias(data.items);
          if (data.orphans) {
            setOrphansData(data.orphans);
          }
        }
      } else {
        setStatusMessage({ type: "error", text: "Impossible de charger les médias depuis le serveur." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Erreur réseau lors de la récupération des médias." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, [filterType, searchQuery, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    const token = getAdminToken();
    if (token) formData.append("token", token);

    try {
      const headers = getAuthHeaders();
      delete (headers as any)["Content-Type"];

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatusMessage({ type: "success", text: `Fichier "${file.name}" téléversé et indexé avec succès.` });
          fetchMedias();
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }
      const errData = await res.json().catch(() => ({}));
      setStatusMessage({ type: "error", text: errData.error || "Échec du téléversement sur le serveur." });
    } catch {
      setStatusMessage({ type: "error", text: "Erreur de connexion au serveur pendant l'envoi." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le média "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setStatusMessage({ type: "success", text: `Média "${name}" supprimé.` });
        fetchMedias();
      } else {
        setStatusMessage({ type: "error", text: "Erreur lors de la suppression du média." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Erreur réseau lors de la suppression." });
    }
  };

  const handleCopyUrl = (url: string, id: number | string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Ko";
    const k = 1024;
    const sizes = ["Octets", "Ko", "Mo", "Go"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Médiathèque Persistante</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
              Hostinger Source Unique
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Gestion centralisée de tous les médias (vidéos d'arrière-plan, images cliniques, bannières, PDF).
            Les fichiers sont enregistrés de façon pérenne sur le stockage persistant et indexés dans la base de données.
          </p>
        </div>

        {/* Bouton d'upload direct */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/mp4,video/webm,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(42,157,143,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{uploading ? "Téléversement..." : "Téléverser un Média"}</span>
          </button>
        </div>
      </div>

      {/* Message de notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
              : "bg-red-950/60 border border-red-500/30 text-red-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Onglets & Barre d'outils */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Onglets */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "library"
                ? "bg-[#2a9d8f] text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <HardDrive size={14} />
            <span>Tous les Médias ({medias.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orphans")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "orphans"
                ? "bg-[#e76f51] text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldAlert size={14} />
            <span>Audit Médias Orphelins</span>
          </button>
        </div>

        {/* Filtres & Recherche (si dans l'onglet bibliothèque) */}
        {activeTab === "library" && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Barre de recherche */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#2a9d8f]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            {/* Filtre Type */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {["all", "video", "image", "document"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                    filterType === t ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t === "all" ? "Tous" : t === "video" ? "Vidéos" : t === "image" ? "Images" : "Documents"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchMedias}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* Contenu : Onglet Médias Orphelins */}
      {activeTab === "orphans" && orphansData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Fichiers sur le disque sans référence en base */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Fichiers physiques sans ligne en base ({orphansData.filesWithoutDb.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Ces fichiers se trouvent dans le dossier <code className="text-[#48cae4]">uploads/</code> mais ne sont pas enregistrés dans la table <code className="text-[#48cae4]">media_files</code>.
              </p>
              {orphansData.filesWithoutDb.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs">
                  ✅ Aucun fichier orphelin détecté sur le disque.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {orphansData.filesWithoutDb.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="text-white font-medium block truncate">{f.filename}</span>
                        <span className="text-slate-500 text-[10px]">{formatFileSize(f.file_size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(f.public_url, `orphan-${i}`)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] hover:text-white"
                      >
                        {copiedId === `orphan-${i}` ? "Copié !" : "Copier URL"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Références DB sans fichier physique */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-red-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={18} className="text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  Références en base sans fichier physique ({orphansData.dbWithoutFiles.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Ces entrées existent en base de données mais le fichier physique est introuvable sur le disque.
              </p>
              {orphansData.dbWithoutFiles.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs">
                  ✅ Toutes les références en base correspondent à des fichiers physiques existants.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {orphansData.dbWithoutFiles.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-red-900/40 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="text-red-300 font-medium block truncate">{item.filename}</span>
                        <span className="text-slate-500 text-[10px]">{item.public_url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.filename)}
                        className="p-1.5 rounded bg-red-950/60 text-red-400 hover:bg-red-900"
                        title="Purger l'entrée DB"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenu : Grille des Médias */}
      {activeTab === "library" && (
        <>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="animate-spin text-[#2a9d8f]" />
              <p className="text-xs text-slate-400">Chargement des médias persistants...</p>
            </div>
          ) : medias.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
              <ImageIcon size={36} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Aucun média trouvé</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Téléversez votre première image ou vidéo pour l'enregistrer de façon persistante.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {medias.map((m) => {
                const isVideo = m.media_type === "video" || m.mime_type.startsWith("video/");
                const isDoc = m.media_type === "document" || m.mime_type === "application/pdf";

                return (
                  <div
                    key={m.id}
                    className="group p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#2a9d8f]/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* En-tête de carte */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isVideo
                              ? "bg-purple-950/60 text-purple-400 border border-purple-500/30"
                              : isDoc
                              ? "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                              : "bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30"
                          }`}
                        >
                          {m.media_type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{formatFileSize(m.file_size)}</span>
                      </div>

                      {/* Aperçu du média */}
                      <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-3 flex items-center justify-center relative">
                        {isVideo ? (
                          <div className="w-full h-full relative group">
                            <video
                              src={m.public_url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                              onMouseOut={(e) => {
                                const v = e.target as HTMLVideoElement;
                                v.pause();
                                v.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                              <Film size={24} className="text-white drop-shadow" />
                            </div>
                          </div>
                        ) : isDoc ? (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                            <FileText size={32} className="text-amber-400 mb-1" />
                            <span className="text-[10px] truncate max-w-[150px]">{m.original_name}</span>
                          </div>
                        ) : (
                          <img
                            src={m.public_url}
                            alt={m.original_name || m.filename}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>

                      {/* Nom et infos */}
                      <h4 className="text-xs font-bold text-white truncate mb-1" title={m.original_name || m.filename}>
                        {m.original_name || m.filename}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mb-3" title={m.public_url}>
                        {m.public_url}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(m.public_url, m.id)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          copiedId === m.id
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {copiedId === m.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId === m.id ? "Copié !" : "Copier URL"}</span>
                      </button>

                      <a
                        href={m.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink size={14} />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, m.original_name || m.filename)}
                        className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
