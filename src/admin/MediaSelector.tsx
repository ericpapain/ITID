import React, { useState, useRef, useEffect } from "react";
import { getAuthHeaders, getAdminToken } from "./auth";
import { Upload, Link as LinkIcon, Trash2, Plus, Image as ImageIcon, X, Check, Images, HardDrive, RefreshCw } from "lucide-react";

export const ITID_PRESET_IMAGES = [
  { label: "Infiltration Rachidienne", url: "/images/treatments/infiltrations_rachidiennes.jpg" },
  { label: "Radiofréquence", url: "/images/treatments/radiofrequence.jpg" },
  { label: "Bloc Anesthésique", url: "/images/treatments/blocs_anesthesiques.jpg" },
  { label: "Réalité Virtuelle HypnoVR", url: "/images/treatments/hypnovr.jpg" },
  { label: "Cryoneurolyse", url: "/images/treatments/cryoneurolyse.jpg" },
  { label: "Perfusion Lidocaïne", url: "/images/treatments/perfusion_lidocaine.jpg" },
  { label: "Stimulation Ganglion Dorsal", url: "/images/treatments/stimulation_ganglion_dorsal.jpg" },
  { label: "Infiltration Articulaire", url: "/images/treatments/infiltrations_articulaires.jpg" },
  { label: "Lombalgie & Rachis", url: "/images/lombalgie.jpg" },
  { label: "Migraine & Céphalées", url: "/images/migraine.jpg" },
  { label: "Névralgie d'Arnold", url: "/images/nevralgie_arnold.jpg" },
  { label: "SDRC Algodystrophie", url: "/images/sdrc.jpg" },
  { label: "Endométriose", url: "/images/endometriose.jpg" },
  { label: "Fibromyalgie", url: "/images/fibromyalgie.jpg" },
  { label: "Douleurs Neuropathiques", url: "/images/douleurs_neuropathiques.jpg" },
  { label: "Douleurs Articulaires", url: "/images/douleurs_articulaires.jpg" },
  { label: "Colonne 3D Isolée", url: "/images/spine_isolated.jpg" },
  { label: "Rachis Lumineux 3D", url: "/images/glowing_3d_spine.jpg" }
];

interface SingleMediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export function SingleMediaSelector({
  value,
  onChange,
  label,
  placeholder = "URL de l'image (ex: /uploads/... ou /images/...)"
}: SingleMediaSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [dbMediaList, setDbMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les médias de la médiathèque quand la galerie s'ouvre
  useEffect(() => {
    if (showGallery && dbMediaList.length === 0) {
      setLoadingMedia(true);
      fetch("/api/admin/media?type=image", { headers: getAuthHeaders() })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.items)) {
            setDbMediaList(data.items);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMedia(false));
    }
  }, [showGallery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const token = getAdminToken();
    if (token) {
      formData.append("token", token);
    }

    try {
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
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Échec du téléversement sur le serveur.");
    } catch {
      setError("Erreur de connexion au serveur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-slate-300 font-semibold text-xs">{label}</label>}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Preview Miniature */}
        <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative group">
          {value ? (
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={22} className="text-slate-600" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
              title="Supprimer l'image"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Input URL */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#2a9d8f]"
          />
          <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        {/* Bouton Médiathèque & Photos Officielles */}
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
            showGallery
              ? "bg-[#2a9d8f] text-slate-950 border-[#2a9d8f]"
              : "bg-[#2a9d8f]/10 hover:bg-[#2a9d8f]/20 text-[#48cae4] border-[#2a9d8f]/30"
          }`}
          title="Sélectionner depuis la médiathèque ou les photos officielles"
        >
          <Images size={14} />
          <span>Médiathèque</span>
        </button>

        {/* Bouton Upload depuis PC */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <RefreshCw size={14} className="animate-spin text-[#48cae4]" />
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Téléverser</span>
            </>
          )}
        </button>
      </div>

      {/* Galerie Sélecteur */}
      {showGallery && (
        <div className="mt-2 p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <HardDrive size={13} className="text-[#2a9d8f]" />
              Médiathèque & Banques Photos Officielles
            </span>
            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Fermer ✕
            </button>
          </div>

          {/* Médias de la Médiathèque DB si existants */}
          {dbMediaList.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Fichiers Récemment Téléversés
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {dbMediaList.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange(m.public_url);
                      setShowGallery(false);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      value === m.public_url
                        ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white"
                        : "bg-slate-950 border-slate-800 hover:border-slate-600 text-slate-300"
                    }`}
                  >
                    <img src={m.public_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <span className="text-[10px] font-medium leading-tight truncate">{m.original_name || m.filename}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photos Médicales Prédéfinies */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Photos Cliniques ITID Officielles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ITID_PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setShowGallery(false);
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                    value === preset.url
                      ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white"
                      : "bg-slate-950 border-slate-800 hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  <span className="text-[10px] font-medium leading-tight truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <div className="text-red-400 text-[11px] font-medium">{error}</div>}
    </div>
  );
}

interface GalleryMediaSelectorProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  minImages?: number;
}

export function GalleryMediaSelector({
  images = [],
  onChange,
  label = "Galerie d'images (pour le carrousel défilant)",
  minImages = 3
}: GalleryMediaSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];
    let hasFailure = false;

    try {
      const headers = getAuthHeaders();
      delete (headers as any)["Content-Type"];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        const token = getAdminToken();
        if (token) formData.append("token", token);

        try {
          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            headers,
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              uploadedUrls.push(data.url);
            } else {
              hasFailure = true;
            }
          } else {
            hasFailure = true;
          }
        } catch {
          hasFailure = true;
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }

      if (hasFailure) {
        setError("Certains fichiers n'ont pas pu être téléversés sur le serveur.");
      }
    } catch {
      setError("Erreur de connexion pendant le téléversement de la galerie.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const addPresetImage = (url: string) => {
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-slate-200 font-semibold text-xs">{label}</label>
          <span className="text-[11px] text-slate-400">
            {images.length} image{images.length > 1 ? "s" : ""} dans la galerie (minimum recommandé : {minImages})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-1.5 rounded-xl bg-[#2a9d8f]/10 hover:bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Images size={13} />
            <span>Ajouter Photo ITID</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploading ? <RefreshCw size={13} className="animate-spin text-[#48cae4]" /> : <Upload size={13} />}
            <span>{uploading ? "Envoi..." : "Téléverser"}</span>
          </button>
        </div>
      </div>

      {/* Grille des images actuelles */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className="group relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
          >
            <img src={imgUrl} alt={`Galerie ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-1 rounded-lg bg-red-600/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
                title="Retirer cette image"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-slate-300">
              #{index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Presets rapides */}
      {showPresets && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white">Choisir une photo officielle à ajouter :</span>
            <button type="button" onClick={() => setShowPresets(false)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {ITID_PRESET_IMAGES.map((p) => {
              const alreadySelected = images.includes(p.url);
              return (
                <button
                  key={p.url}
                  type="button"
                  disabled={alreadySelected}
                  onClick={() => addPresetImage(p.url)}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    alreadySelected
                      ? "opacity-40 border-slate-800 bg-slate-900 cursor-not-allowed"
                      : "border-slate-800 hover:border-[#2a9d8f] bg-slate-900/60"
                  }`}
                >
                  <img src={p.url} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                  <span className="text-[10px] text-slate-300 truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="text-red-400 text-[11px] font-medium">{error}</div>}
    </div>
  );
}
