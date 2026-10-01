import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "./auth";

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
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tableau de bord Général</h1>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des interactions patients, abonnés newsletter et gestion des contenus ITID.
        </p>
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
            <Link to="/admin/pages?section=home" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Accueil
            </Link>
            <Link to="/admin/pages?section=pathologies" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Pathologies
            </Link>
            <Link to="/admin/pages?section=traitements" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Traitements
            </Link>
            <Link to="/admin/pages?section=blog" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">
              Blog / Actualités
            </Link>
          </div>
        </div>
      </div>

      {/* Panneau Sauvegarde & Persistance BDD */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-[#0c1a2e] shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛡️</span> Persistance & Sauvegarde de la Base de Données
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={async () => {
                setDbLoading(true);
                try {
                  const res = await fetch("/api/admin/backup?action=info", { headers: getAuthHeaders() });
                  const data = await res.json();
                  setDbInfo(data);
                } catch (e) {
                  setDbInfo({ error: "Impossible de joindre l'API backup." });
                } finally {
                  setDbLoading(false);
                }
              }}
              disabled={dbLoading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {dbLoading ? "Chargement..." : "🔍 Diagnostic DB"}
            </button>
            <a
              href="/api/admin/backup?action=download"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors"
              onClick={(e) => {
                // Ajouter le header Authorization via fetch puis déclencher le download
                e.preventDefault();
                fetch("/api/admin/backup?action=download", { headers: getAuthHeaders() })
                  .then(async (res) => {
                    if (!res.ok) { alert("Erreur lors du backup."); return; }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `itid_backup_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"_")}.sqlite`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
              }}
            >
              ⬇️ Télécharger Backup SQLite
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          <strong className="text-amber-400">Important :</strong> À chaque déploiement (push Git + upload FTP), seuls les fichiers PHP et JS sont mis à jour.
          La base de données est stockée dans un dossier séparé hors du webroot et n'est jamais écrasée.
          Téléchargez un backup avant tout déploiement majeur.
        </p>

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
