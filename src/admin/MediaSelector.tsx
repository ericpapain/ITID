import React, { useState, useRef } from "react";
import { getAuthHeaders, getAdminToken } from "./auth";
import { Upload, Link as LinkIcon, Trash2, Plus, Image as ImageIcon, X, Check, Images } from "lucide-react";

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
  placeholder = "URL de l'image (ex: /images/photo.jpg ou https://...)"
}: SingleMediaSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      delete (headers as any)["Content-Type"]; // laisser le navigateur définir multipart/form-data boundary

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
      throw new Error("Téléversement serveur indisponible");
    } catch {
      // Fallback instantané : conversion FileReader en Data URL Base64
      // Garantit que l'image s'affiche toujours immédiatement et se sauvegarde sans perte
      try {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onChange(reader.result);
          }
          setUploading(false);
        };
        reader.onerror = () => {
          setError("Impossible de lire le fichier image sélectionné.");
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (readErr: any) {
        setError("Erreur de lecture du fichier image.");
        setUploading(false);
      }
    } finally {
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

        {/* Bouton Banque Photos Médicales ITID */}
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
            showGallery
              ? "bg-[#2a9d8f] text-white border-[#2a9d8f]"
              : "bg-[#2a9d8f]/10 hover:bg-[#2a9d8f]/20 text-[#48cae4] border-[#2a9d8f]/30"
          }`}
          title="Sélectionner parmi les photos cliniques ITID officielles"
        >
          <Images size={14} />
          <span>Photos ITID</span>
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
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Chargement...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Depuis PC</span>
            </>
          )}
        </button>
      </div>

      {/* Panneau Sélecteur Photos Cliniques ITID */}
      {showGallery && (
        <div className="p-3 bg-slate-900 border border-[#2a9d8f]/40 rounded-2xl space-y-2 mt-2 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-[11px] font-bold text-[#48cae4] flex items-center gap-1">
              <Images size={12} />
              <span>Photos cliniques & thérapeutiques officielles ITID</span>
            </span>
            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
            {ITID_PRESET_IMAGES.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setShowGallery(false);
                }}
                className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all group cursor-pointer ${
                  value === preset.url
                    ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white"
                    : "bg-slate-950 border-slate-800 hover:border-slate-600 text-slate-300"
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
                <span className="text-[11px] font-medium leading-tight line-clamp-2">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-red-400 text-[11px]">{error}</div>}
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];

    try {
      const headers = getAuthHeaders();
      delete (headers as any)["Content-Type"];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let urlAdded = false;

        try {
          const formData = new FormData();
          formData.append("file", file);
          const token = getAdminToken();
          if (token) {
            formData.append("token", token);
          }

          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            headers,
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              uploadedUrls.push(data.url);
              urlAdded = true;
            }
          }
        } catch {
          urlAdded = false;
        }

        // Fallback Base64 si le téléversement serveur échoue
        if (!urlAdded) {
          const base64Url = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
          if (base64Url) {
            uploadedUrls.push(base64Url);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const addUrlPrompt = () => {
    const url = window.prompt("Entrez l'URL de l'image (ex: https://... ou /images/photo.jpg) :");
    if (url && url.trim()) {
      onChange([...images, url.trim()]);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-slate-200 font-bold text-xs">{label}</label>
          <p className="text-slate-400 text-[11px]">
            {images.length} photo(s) sélectionnée(s) {images.length < minImages && `(recommandé : au moins ${minImages})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <Upload size={13} />
                <span>+ Importer depuis PC</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={addUrlPrompt}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>+ Ajouter par URL</span>
          </button>
        </div>
      </div>

      {/* Grille des images */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-video rounded-xl bg-slate-900 border border-slate-700 overflow-hidden group">
            <img src={img} alt={`Galerie ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
              <span className="text-[10px] text-white font-bold bg-black/70 px-1.5 py-0.5 rounded">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="text-red-400 text-[11px]">{error}</div>}
    </div>
  );
}
