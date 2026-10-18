import React, { useState, useEffect, useRef } from "react";
import { getAuthHeaders, getAdminToken } from "./auth";
import {
  Download,
  Upload,
  Database,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock
} from "lucide-react";

interface CmsBackupRestorePanelProps {
  lang?: "fr" | "en";
  onRestored?: () => void;
}

export function CmsBackupRestorePanel({ lang = "fr", onRestored }: CmsBackupRestorePanelProps) {
  const [loading, setLoading] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [restoringJson, setRestoringJson] = useState(false);
  const [restoringZip, setRestoringZip] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [liveCounts, setLiveCounts] = useState<any>(null);
  const [autoSnapshot, setAutoSnapshot] = useState<any>(null);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

  // Charger le statut actuel des données et l'instantané local
  const refreshStatus = async () => {
    setLoading(true);
    try {
      // 1. Charger les comptes réels depuis l'API CMS
      const res = await fetch("/api/admin/cms?type=backup&action=export", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.backup?.counts) {
          setLiveCounts(result.backup.counts);
          // Mémoriser automatiquement un instantané local dans le navigateur pour sécurité
          try {
            localStorage.setItem(
              "itid_cms_auto_backup",
              JSON.stringify({
                saved_at: new Date().toISOString(),
                backup: result.backup,
              })
            );
          } catch {}
        }
      }

      // 2. Vérifier si un instantané local existe dans localStorage
      try {
        const localRaw = localStorage.getItem("itid_cms_auto_backup");
        if (localRaw) {
          setAutoSnapshot(JSON.parse(localRaw));
        }
      } catch {}
    } catch (e: any) {
      console.warn("Erreur chargement statut backup:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  // 1. Télécharger la sauvegarde JSON complète
  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms?type=backup&action=export", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      const backupData = data.backup || data;

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_");
      a.href = url;
      a.download = `itid_cms_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Sauvegarde complète JSON téléchargée avec succès sur votre ordinateur !",
      });
    } catch (e: any) {
      setMessage({
        type: "error",
        text: `Échec du téléchargement JSON : ${e.message}`,
      });
    } finally {
      setDownloadingJson(false);
    }
  };

  // 2. Télécharger l'archive ZIP de toutes les images
  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms?type=backup&action=export_images", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur HTTP ${res.status}: ${text.slice(0, 120)}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_");
      a.href = url;
      a.download = `itid_images_backup_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Archive ZIP de toutes les photos téléchargée avec succès !",
      });
    } catch (e: any) {
      setMessage({
        type: "error",
        text: `Échec du téléchargement des images : ${e.message}`,
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  // 3. Restaurer depuis un fichier JSON sélectionné
  const handleRestoreJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Voulez-vous vraiment restaurer le contenu CMS depuis le fichier :\n${file.name} ?\n\nToutes les fiches et pages actuelles seront synchronisées.`)) {
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
      return;
    }

    setRestoringJson(true);
    setMessage(null);
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Le fichier sélectionné n'est pas un JSON valide.");
      }

      const res = await fetch("/api/admin/cms?type=backup&action=restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(parsed),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || `Erreur HTTP ${res.status}`);
      }

      setMessage({
        type: "success",
        text: `✅ ${result.message || "Restauration terminée avec succès !"}`
      });

      await refreshStatus();
      if (onRestored) onRestored();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `Erreur de restauration JSON : ${err.message}`,
      });
    } finally {
      setRestoringJson(false);
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
    }
  };

  // 4. Restaurer depuis l'instantané automatique local (sans fichier)
  const handleRestoreAutoSnapshot = async () => {
    if (!autoSnapshot?.backup) {
      alert("Aucun instantané automatique disponible.");
      return;
    }

    const savedDate = new Date(autoSnapshot.saved_at).toLocaleString("fr-FR");
    if (!window.confirm(`Restaurer le dernier instantané automatique du ${savedDate} ?\n\nCela réinjectera tous les articles, cas cliniques et réglages mémorisés dans votre navigateur.`)) {
      return;
    }

    setRestoringJson(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms?type=backup&action=restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(autoSnapshot.backup),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || `Erreur HTTP ${res.status}`);
      }

      setMessage({
        type: "success",
        text: `✅ Instantané automatique restauré avec succès !`,
      });

      await refreshStatus();
      if (onRestored) onRestored();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `Erreur lors de la réinjection : ${err.message}`,
      });
    } finally {
      setRestoringJson(false);
    }
  };

  // 5. Restaurer une archive ZIP d'images
  const handleRestoreZipFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Voulez-vous extraire et réinjecter les images depuis :\n${file.name} ?\n\nLes images seront placées dans le dossier public/uploads/ du serveur.`)) {
      if (zipFileInputRef.current) zipFileInputRef.current.value = "";
      return;
    }

    setRestoringZip(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("zip", file);

      const token = getAdminToken() || "";
      const res = await fetch(`/api/admin/cms?type=backup&action=restore_images&token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || `Erreur HTTP ${res.status}`);
      }

      setMessage({
        type: "success",
        text: `✅ ${result.message || "Archive d'images extraite avec succès !"}`
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `Erreur d'extraction ZIP : ${err.message}`,
      });
    } finally {
      setRestoringZip(false);
      if (zipFileInputRef.current) zipFileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Bannière d'Explication & Sécurité Git */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0c1a2e] to-slate-900 border border-[#2a9d8f]/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#2a9d8f]/20 text-[#48cae4]">
                <ShieldCheck size={24} />
              </span>
              <h2 className="text-xl font-bold text-white">
                Centre de Sauvegarde & Restauration CMS & Médias
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Ne perdez jamais vos ajouts lors d'un déploiement Git. Sauvegardez vos articles, cas cliniques, médias et photos en un seul clic, et restaurez-les instantanément après chaque mise à jour.
            </p>
          </div>

          <button
            onClick={refreshStatus}
            disabled={loading}
            className="self-start md:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Rafraîchir les compteurs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Compteurs Actuels des Données */}
        {liveCounts && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Articles Blog</span>
              <p className="text-lg font-bold text-[#48cae4] mt-0.5">{liveCounts.articles ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cas Cliniques</span>
              <p className="text-lg font-bold text-[#2a9d8f] mt-0.5">{liveCounts.cas_cliniques ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pathologies</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{liveCounts.pathologies ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Traitements</span>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">{liveCounts.traitements ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pages Globales</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{liveCounts.pages ?? 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Message de notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 ${
            message.type === "success"
              ? "bg-emerald-950/70 border border-emerald-500/50 text-emerald-200"
              : message.type === "error"
              ? "bg-red-950/70 border border-red-500/50 text-red-200"
              : "bg-blue-950/70 border border-blue-500/50 text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {message.type === "error" && <AlertTriangle size={16} className="text-red-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grille Principale des 4 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1 : EXPORT DONNÉES JSON */}
        <div className="p-6 rounded-3xl bg-[#0c1a2e] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <FileJson size={22} />
              </span>
              <h3 className="text-base font-bold text-white">
                1. Sauvegarde des Données CMS (JSON)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exporte en un seul fichier JSON horodaté l'intégralité des articles, cas cliniques, médias défilants du Hero, textes bilingues et fiches médicales.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Format universel .json</span>
            <button
              onClick={handleDownloadJson}
              disabled={downloadingJson}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloadingJson ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{downloadingJson ? "Génération..." : "Télécharger Backup (.json)"}</span>
            </button>
          </div>
        </div>

        {/* Module 2 : EXPORT ARCHIVE IMAGES ZIP */}
        <div className="p-6 rounded-3xl bg-[#0c1a2e] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Archive size={22} />
              </span>
              <h3 className="text-base font-bold text-white">
                2. Archive de toutes les Photos (.ZIP)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compresse et télécharge sur votre ordinateur une copie exacte de toutes les photos et fichiers médias que vous avez téléversés dans le CMS.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Archive physique .zip</span>
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloadingZip ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{downloadingZip ? "Compression..." : "Télécharger Images (.zip)"}</span>
            </button>
          </div>
        </div>

        {/* Module 3 : RESTAURATION FICHIER JSON */}
        <div className="p-6 rounded-3xl bg-[#0c1a2e] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <RotateCcw size={22} />
              </span>
              <h3 className="text-base font-bold text-white">
                3. Restaurer le CMS depuis un Fichier JSON
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Après un déploiement Git ou si vos données ont été écrasées : sélectionnez votre fichier de sauvegarde pour réinjecter immédiatement tous vos contenus.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Fichier .json requis</span>
            <div>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreJsonFile}
                className="hidden"
                id="cms-json-restore-input"
              />
              <label
                htmlFor="cms-json-restore-input"
                className={`px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                  restoringJson ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {restoringJson ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{restoringJson ? "Restauration..." : "Choisir un fichier JSON"}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Module 4 : RÉINJECTION ARCHIVE ZIP */}
        <div className="p-6 rounded-3xl bg-[#0c1a2e] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Upload size={22} />
              </span>
              <h3 className="text-base font-bold text-white">
                4. Réinjecter les Photos (.ZIP)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Envoyez votre archive ZIP pour réextraire en masse toutes vos photos dans le dossier <code className="text-[#48cae4]">public/uploads/</code> du serveur.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Archive .zip requise</span>
            <div>
              <input
                ref={zipFileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={handleRestoreZipFile}
                className="hidden"
                id="cms-zip-restore-input"
              />
              <label
                htmlFor="cms-zip-restore-input"
                className={`px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                  restoringZip ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {restoringZip ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{restoringZip ? "Extraction..." : "Uploader Archive ZIP"}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Module 5 : INSTANTANÉ AUTOMATIQUE DU NAVIGATEUR */}
      {autoSnapshot && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-teal-500/40 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="text-sm font-bold text-white">
                  Instantané Automatique Mémorisé dans votre Navigateur
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Enregistré le <strong className="text-teal-300">{new Date(autoSnapshot.saved_at).toLocaleString("fr-FR")}</strong> ({autoSnapshot.backup?.counts?.articles || 0} articles, {autoSnapshot.backup?.counts?.cas_cliniques || 0} cas cliniques).
              </p>
            </div>

            <button
              onClick={handleRestoreAutoSnapshot}
              disabled={restoringJson}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {restoringJson ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              <span>Restaurer l'instantané automatique</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default CmsBackupRestorePanel;
