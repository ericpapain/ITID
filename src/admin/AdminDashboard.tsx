import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders, getAdminToken } from "./auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    totalSubscribers: 0,
    visitorsToday: 0,
    activeNow: 0,
    loading: true,
  });

  const [dbInfo, setDbInfo] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [discoveredFiles, setDiscoveredFiles] = useState<any[] | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [autoSnapshot, setAutoSnapshot] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("itid_cms_auto_backup");
      if (raw) {
        setAutoSnapshot(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const handleRestoreAutoSnapshot = async () => {
    if (!autoSnapshot?.backup) return;
    const dateStr = new Date(autoSnapshot.saved_at).toLocaleString("fr-FR");
    if (!window.confirm(`Voulez-vous restaurer vos contenus et textes enrichis mémorisés dans votre navigateur le ${dateStr} ?\n\nCela réinjectera tous les articles, cas cliniques et réglages enregistrés.`)) {
      return;
    }
    setScanLoading(true);
    setRestoreMessage("Restauration de votre sauvegarde navigateur en cours...");
    try {
      const res = await fetch("/api/admin/cms?type=backup&action=restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(autoSnapshot.backup),
      });
      const data = await res.json();
      if (data.success) {
        setRestoreMessage(`🎉 Succès : Vos données enrichies du navigateur ont été réinjectées avec succès !`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert("Erreur de réinjection : " + (data.error || "Inconnu"));
      }
    } catch (e: any) {
      alert("Erreur réseau : " + e.message);
    } finally {
      setScanLoading(false);
    }
  };

  const handleScan = async () => {
    setScanLoading(true);
    setRestoreMessage(null);
    try {
      const token = getAdminToken() || "";
      const res = await fetch(`/api/admin/backup?action=scan&token=${encodeURIComponent(token)}`, {
        headers: getAuthHeaders()
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Réponse non valide du serveur (${res.status}): ${text.slice(0, 150)}`);
      }
      if (data.success && data.found) {
        setDiscoveredFiles(data.found);
      } else {
        alert("Erreur lors du scan : " + (data.error || "Inconnu"));
      }
    } catch (e: any) {
      alert("Erreur lors du scan: " + e.message);
    } finally {
      setScanLoading(false);
    }
  };

  const handleRestoreDiscovered = async (path: string, filename: string, isActive?: boolean) => {
    if (isActive) {
      setRestoreMessage("Vérification de l'intégrité de la base active...");
    } else {
      if (!window.confirm(`Voulez-vous vraiment restaurer les données depuis le fichier de sauvegarde :\n${filename} ?\n\nUne copie de secours de votre base actuelle sera automatiquement conservée.`)) {
        return;
      }
    }
    setScanLoading(true);
    setRestoreMessage(null);
    try {
      const token = getAdminToken() || "";
      const res = await fetch(`/api/admin/backup?action=restore_discovered&token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ path })
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Réponse non valide (${res.status}): ${text.slice(0, 150)}`);
      }
      if (data.success) {
        setRestoreMessage(`✅ ${data.message}`);
        if (!data.already_active) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        alert("Erreur de restauration : " + (data.error || "Inconnu"));
      }
    } catch (e: any) {
      alert("Erreur lors de l'opération: " + e.message);
    } finally {
      setScanLoading(false);
    }
  };

  const handleSeedHistory = async () => {
    if (!window.confirm("Voulez-vous injecter les 504 visites réalistes réparties entre le 18 septembre et aujourd'hui ?")) {
      return;
    }
    setSeedLoading(true);
    setRestoreMessage(null);
    try {
      const token = getAdminToken() || "";
      const res = await fetch(`/api/admin/seed_analytics?force=1&token=${encodeURIComponent(token)}`, {
        headers: getAuthHeaders()
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Réponse non valide (${res.status}): ${text.slice(0, 150)}`);
      }
      if (data.success) {
        setRestoreMessage(`🎉 Reconstitution réussie : ${data.total_sessions} sessions générées (${data.period}) !`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert("Erreur lors de l'injection : " + (data.error || "Inconnu"));
      }
    } catch (e: any) {
      alert("Erreur réseau: " + e.message);
    } finally {
      setSeedLoading(false);
    }
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const [msgRes, subRes, analyticsRes] = await Promise.all([
          fetch("/api/admin/messages?limit=1", { headers: getAuthHeaders() }),
          fetch("/api/admin/newsletter/subscribers?limit=1", { headers: getAuthHeaders() }),
          fetch("/api/admin/analytics/overview", { headers: getAuthHeaders() }),
        ]);

        const msgData = msgRes.ok ? await msgRes.json() : null;
        const subData = subRes.ok ? await subRes.json() : null;
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

        // Fetch unread count
        const unreadRes = await fetch("/api/admin/messages?status=unread&limit=1", { headers: getAuthHeaders() });
        const unreadData = unreadRes.ok ? await unreadRes.json() : null;

        setStats({
          totalMessages: msgData?.pagination?.total || 0,
          unreadMessages: unreadData?.pagination?.total || 0,
          totalSubscribers: subData?.pagination?.total || 0,
          visitorsToday: analyticsData?.kpis?.visitors_today || 0,
          activeNow: analyticsData?.kpis?.active_now || 0,
          loading: false,
        });
      } catch (e) {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Status */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tableau de bord Général</h1>
          <p className="text-sm text-slate-400">
            Vue d'ensemble des interactions patients, abonnés newsletter et gestion des contenus ITID.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Persistance des données active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c1a2e] border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Audience & Visiteurs</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-2xl font-extrabold text-white mb-0.5">
            {stats.loading ? "..." : `${stats.visitorsToday} auj.`}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">{stats.activeNow} actif(s) en direct</div>
          <Link to="/admin/analytics" className="inline-block mt-3 text-xs font-semibold text-[#48cae4] hover:underline">
            Voir les analyses →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1a2e] border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-bold text-[#2a9d8f] uppercase tracking-wider mb-2">Messages non lus</div>
          <div className="text-2xl font-extrabold text-white mb-0.5">
            {stats.loading ? "..." : stats.unreadMessages}
          </div>
          <div className="text-xs text-slate-400">Demandes en attente de traitement</div>
          <Link to="/admin/messages" className="inline-block mt-4 text-xs font-semibold text-[#48cae4] hover:underline">
            Consulter les messages →
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1a2e] border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold text-[#48cae4] uppercase tracking-wider mb-2">Total Messages Reçus</div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats.loading ? "..." : stats.totalMessages}
          </div>
          <div className="text-xs text-slate-400">Depuis tous les formulaires</div>
          <Link to="/admin/messages" className="inline-block mt-4 text-xs font-semibold text-[#48cae4] hover:underline">
            Voir l'historique →
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1a2e] border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Abonnés Newsletter</div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats.loading ? "..." : stats.totalSubscribers}
          </div>
          <div className="text-xs text-slate-400">Contacts actifs vérifiés</div>
          <Link to="/admin/newsletter" className="inline-block mt-4 text-xs font-semibold text-emerald-400 hover:underline">
            Gérer la liste & exporter →
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1a2e] border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Édition CMS Active</div>
          <div className="text-3xl font-extrabold text-white mb-1">7 Pages</div>
          <div className="text-xs text-slate-400">Accueil, Traitements, etc.</div>
          <Link to="/admin/pages" className="inline-block mt-4 text-xs font-semibold text-amber-400 hover:underline">
            Modifier les contenus →
          </Link>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Formulaires */}
        <div className="p-6 rounded-2xl bg-[#0c1a2e] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✉️</span> Gestion des Formulaires
            </h3>
            <Link to="/admin/messages" className="text-xs text-[#2a9d8f] font-semibold hover:underline">
              Ouvrir
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Chaque formulaire (Contact général, Inscriptions formations, Demandes d'informations) est sauvegardé de manière permanente en base de données MySQL et acheminé par email vers contact@itid-france.com.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/messages" className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors">
              Boîte de réception
            </Link>
            <a href="/api/admin/messages/export/csv" download className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors">
              Exporter en CSV
            </a>
          </div>
        </div>

        {/* Module CMS Pages */}
        <div className="p-6 rounded-2xl bg-[#0c1a2e] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📑</span> Éditeur de Contenus (CMS Bilingue)
            </h3>
            <Link to="/admin/pages" className="text-xs text-[#2a9d8f] font-semibold hover:underline">
              Gérer
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Modifiez en direct les textes, images et vidéos de chaque page du site avec gestion bilingue stricte (Français / Anglais) et répercussion instantanée.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/pages?section=hero_media" className="px-3 py-1.5 bg-[#2a9d8f]/20 hover:bg-[#2a9d8f]/40 text-[#48cae4] border border-[#2a9d8f]/30 text-xs font-semibold rounded-lg flex items-center gap-1">
              <span>🎬</span> Médias Défilants
            </Link>
            <Link to="/admin/pages?section=cas_cliniques" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg flex items-center gap-1">
              <span>🔬</span> Cas Cliniques
            </Link>
            <Link to="/admin/pages?section=home" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Accueil (Textes)
            </Link>
            <Link to="/admin/pages?section=pathologies" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Pathologies
            </Link>
            <Link to="/admin/pages?section=traitements" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Traitements
            </Link>
            <Link to="/admin/pages?section=articles" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Blog / Actualités
            </Link>
          </div>
        </div>
      </div>

      {/* Panneau Sauvegarde & Persistance BDD */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-[#0c1a2e] shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛡️</span> Persistance & Récupération de la Base de Données
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={async () => {
                setDbLoading(true);
                try {
                  const token = getAdminToken() || "";
                  const res = await fetch(`/api/admin/backup?action=info&token=${encodeURIComponent(token)}`, {
                    headers: getAuthHeaders()
                  });
                  const text = await res.text();
                  let data: any;
                  try {
                    data = JSON.parse(text);
                  } catch {
                    throw new Error(`Erreur serveur (${res.status}): ${text.slice(0, 150)}`);
                  }
                  setDbInfo(data);
                } catch (e: any) {
                  setDbInfo({ error: e.message || "Impossible de joindre l'API backup." });
                } finally {
                  setDbLoading(false);
                }
              }}
              disabled={dbLoading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {dbLoading ? "Chargement..." : "🔍 Diagnostic DB"}
            </button>
            <button
              onClick={handleScan}
              disabled={scanLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {scanLoading ? "Recherche..." : "🔎 Scanner & Récupérer"}
            </button>
            <button
              onClick={handleSeedHistory}
              disabled={seedLoading}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {seedLoading ? "Génération en cours..." : "📊 Reconstituer 504 Visites (18 Sep - 1 Oct)"}
            </button>
            <Link
              to="/admin/pages?section=backup"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>🛡️</span>
              <span>Sauvegarder / Restaurer le CMS</span>
            </Link>
            <a
              href="/api/admin/backup?action=download"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const token = getAdminToken() || "";
                fetch(`/api/admin/backup?action=download&token=${encodeURIComponent(token)}`, { headers: getAuthHeaders() })
                  .then(async (res) => {
                    if (!res.ok) {
                      const text = await res.text().catch(() => "");
                      alert("Erreur lors du backup : " + (text.slice(0, 150) || `HTTP ${res.status}`));
                      return;
                    }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `itid_backup_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"_")}.sqlite`;
                    a.click();
                    URL.revokeObjectURL(url);
                  })
                  .catch((err) => alert("Erreur réseau: " + err.message));
              }}
            >
              ⬇️ Télécharger Backup SQLite
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          <strong className="text-amber-400">Persistance active :</strong> La base SQLite est hébergée hors du dossier webroot (`itid_data`) pour éviter tout effacement lors des déploiements.
          Si des anciennes données manquent, cliquez sur <strong className="text-indigo-400">"Scanner & Récupérer Anciennes Données"</strong> pour les retrouver sur le serveur et les réinjecter immédiatement.
        </p>

        {/* Bannière de secours navigateur (instantané local) */}
        {autoSnapshot && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-950/70 via-orange-950/50 to-slate-900 border border-amber-500/50 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-lg shadow-amber-950/30">
            <div className="space-y-1">
              <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>⚡ Instantané automatique trouvé dans votre navigateur</span>
                <span className="text-[11px] text-amber-400/80 font-mono">
                  ({new Date(autoSnapshot.saved_at).toLocaleString("fr-FR")})
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Votre navigateur a conservé une copie de vos fiches, textes enrichis et réglages lors de vos dernières modifications.
              </p>
            </div>
            <button
              onClick={handleRestoreAutoSnapshot}
              disabled={scanLoading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🚀 Réinjecter mes contenus du navigateur</span>
            </button>
          </div>
        )}

        {restoreMessage && (
          <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium">
            {restoreMessage}
          </div>
        )}

        {/* Liste des bases trouvées par le scanner */}
        {discoveredFiles && (
          <div className="mb-4 p-4 bg-slate-900/90 border border-indigo-500/40 rounded-xl">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">
              📦 Fichiers Base de Données Trouvés sur le Serveur ({discoveredFiles.length})
            </h4>
            {discoveredFiles.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun autre fichier SQLite détecté sur le serveur.</p>
            ) : (
              <div className="space-y-3">
                {discoveredFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      item.has_custom_enrichment && !item.is_active
                        ? "bg-slate-900/95 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                        : item.is_active
                        ? "bg-slate-900/95 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "bg-slate-800/80 border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>📄 {item.filename}</span>
                        <span className="text-slate-400 text-[11px]">({item.size_kb} Ko — Modifié : {item.modified})</span>
                        {item.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Base Active Actuelle
                          </span>
                        )}
                        {item.has_custom_enrichment && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            🌟 {item.custom_media_count} médias réels (non IA)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRestoreDiscovered(item.path, item.filename, item.is_active)}
                        disabled={scanLoading}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          item.has_custom_enrichment && !item.is_active
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/30"
                            : item.is_active
                            ? "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                        }`}
                      >
                        {item.is_active
                          ? "🛡️ Vérifier cette base"
                          : item.has_custom_enrichment
                          ? "🌟 Restaurer mes photos & textes réels"
                          : "🔄 Restaurer cette sauvegarde"}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 break-all font-mono">{item.path}</div>

                    {item.sample_titles && item.sample_titles.length > 0 && (
                      <div className="text-[11px] text-cyan-300/90 italic pt-0.5 bg-slate-950/40 px-2.5 py-1 rounded-md border border-cyan-500/20">
                        <strong className="text-cyan-400 not-italic">Fiches détectées :</strong> {item.sample_titles.join(" • ")}
                      </div>
                    )}

                    {item.counts && Object.keys(item.counts).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.counts.cms_pathologies !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium">
                            🩺 Pathologies: <strong className="text-white">{item.counts.cms_pathologies}</strong>
                          </span>
                        )}
                        {item.counts.cms_traitements !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-500/30 text-teal-300 text-[10px] font-medium">
                            💉 Traitements: <strong className="text-white">{item.counts.cms_traitements}</strong>
                          </span>
                        )}
                        {item.counts.cms_cas_cliniques !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                            🔬 Cas Cliniques: <strong className="text-white">{item.counts.cms_cas_cliniques}</strong>
                          </span>
                        )}
                        {item.counts.cms_articles !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                            📰 Articles: <strong className="text-white">{item.counts.cms_articles}</strong>
                          </span>
                        )}
                        {item.counts.visitors !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/40 text-slate-300 text-[10px] font-medium">
                            👥 Visiteurs: <strong className="text-white">{item.counts.visitors}</strong>
                          </span>
                        )}
                        {item.counts.contact_messages !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/40 text-slate-300 text-[10px] font-medium">
                            ✉️ Messages: <strong className="text-white">{item.counts.contact_messages}</strong>
                          </span>
                        )}
                        {item.counts.visitor_sessions !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/40 text-slate-300 text-[10px] font-medium">
                            🌐 Sessions: <strong className="text-white">{item.counts.visitor_sessions}</strong>
                          </span>
                        )}
                        {item.counts.newsletter_subscribers !== undefined && (
                          <span className="px-2 py-0.5 rounded bg-slate-700/60 border border-slate-600/40 text-slate-300 text-[10px] font-medium">
                            📬 Newsletters: <strong className="text-white">{item.counts.newsletter_subscribers}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {dbInfo && (
          <div className="mt-3 p-4 bg-slate-900 rounded-xl text-xs font-mono space-y-2">
            {dbInfo.error ? (
              <div className="text-red-400">❌ {dbInfo.error}</div>
            ) : (
              <>
                <div className={`font-semibold text-sm mb-2 ${dbInfo.is_in_webroot ? "text-red-400" : "text-emerald-400"}`}>
                  {dbInfo.is_in_webroot ? "⚠️" : "✅"} {dbInfo.status}
                </div>
                <div className="text-slate-300"><span className="text-slate-500">Driver :</span> {dbInfo.driver}</div>
                {dbInfo.sqlite_path && (
                  <div className="text-slate-300 break-all"><span className="text-slate-500">Chemin DB :</span> {dbInfo.sqlite_path}</div>
                )}
                {dbInfo.file_size_kb !== undefined && (
                  <div className="text-slate-300"><span className="text-slate-500">Taille :</span> {dbInfo.file_size_kb} Ko</div>
                )}
                {dbInfo.file_modified && (
                  <div className="text-slate-300"><span className="text-slate-500">Dernière modif :</span> {dbInfo.file_modified}</div>
                )}
                {dbInfo.record_counts && (
                  <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {Object.entries(dbInfo.record_counts).map(([table, count]) => (
                      <div key={table} className="text-slate-300">
                        <span className="text-slate-500">{table}:</span> <span className="text-white font-bold">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
