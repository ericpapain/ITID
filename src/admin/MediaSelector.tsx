import React, { useState, useRef } from "react";
import { getAuthHeaders } from "./auth";
import { Upload, Link as LinkIcon, Trash2, Plus, Image as ImageIcon } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers = getAuthHeaders();
      delete (headers as any)["Content-Type"]; // laisser le navigateur définir multipart/form-data boundary

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du téléversement");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
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
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Depuis PC</span>
            </>
          )}
        </button>
      </div>

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
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          headers,
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err: any) {
      setError(err.message);
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
