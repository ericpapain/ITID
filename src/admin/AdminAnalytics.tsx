import React, { useState, useEffect } from "react";
import { getAuthHeaders } from "./auth";
import {
  Users,
  Eye,
  Clock,
  Compass,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Activity,
  Download,
  Search,
  Calendar,
  ChevronRight,
  X,
  RefreshCw,
  MapPin,
  Laptop,
} from "lucide-react";

interface KpiData {
  visitors_today: number;
  visitors_week: number;
  visitors_month: number;
  unique_visitors: number;
  total_sessions: number;
  page_views: number;
  avg_duration_seconds: number;
  pages_per_session: number;
  active_now: number;
}

interface TimeseriesPoint {
  label: string;
  visitors: number;
  sessions: number;
  page_views: number;
}

interface TopPage {
  page_path: string;
  page_title: string | null;
  views: number;
  unique_visitors: number;
  avg_duration: number;
}

interface GeoItem {
  country?: string;
  country_code?: string;
  city?: string;
  visitors: number;
  percentage?: number;
}

interface VisitorItem {
  id: number;
  visitor_token: string;
  first_seen_at: string;
  last_seen_at: string;
  total_sessions: number;
  total_page_views: number;
  total_duration_seconds: number;
  last_ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system: string | null;
  language: string | null;
}

interface VisitorJourneyPage {
  id: number;
  page_path: string;
  page_title: string | null;
  entered_at: string;
  left_at: string | null;
  duration_seconds: number;
}

interface VisitorSessionItem {
  id: number;
  started_at: string;
  last_activity_at: string;
  duration_seconds: number;
  page_views: number;
  entry_page: string | null;
  exit_page: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system: string | null;
  pages_journey: VisitorJourneyPage[];
}

export default function AdminAnalytics() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [geoData, setGeoData] = useState<{ countries: GeoItem[]; cities: GeoItem[] }>({
    countries: [],
    cities: [],
  });
  const [devicesData, setDevicesData] = useState<any>({ devices: [], browsers: [], operating_systems: [] });
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"today" | "yesterday" | "7d" | "30d" | "90d">("7d");

  // Filtres visiteurs
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");

  // Fiche Visiteur détaillée
  const [selectedVisitor, setSelectedVisitor] = useState<{ visitor: VisitorItem; sessions: VisitorSessionItem[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/analytics/overview", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.kpis) setKpis(data.kpis);
        if (data.active_sessions) setActiveSessions(data.active_sessions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTimeseries = async (range: string) => {
    try {
      const res = await fetch(`/api/admin/analytics/timeseries?range=${range}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTimeseries(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopPages = async () => {
    try {
      const res = await fetch("/api/admin/analytics/top-pages", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTopPages(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGeo = async () => {
    try {
      const res = await fetch("/api/admin/analytics/geo", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setGeoData({ countries: data.countries || [], cities: data.cities || [] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/admin/analytics/devices", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDevicesData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVisitors = async () => {
    try {
      let url = `/api/admin/analytics/visitors?limit=25`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (countryFilter) url += `&country=${encodeURIComponent(countryFilter)}`;
      if (deviceFilter) url += `&device=${encodeURIComponent(deviceFilter)}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchTimeseries(timeRange),
      fetchTopPages(),
      fetchGeo(),
      fetchDevices(),
      fetchVisitors(),
    ]);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // Heartbeat auto-refresh de l'aperçu toutes les 30s
    const timer = setInterval(() => {
      fetchOverview();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTimeseries(timeRange);
  }, [timeRange]);

  const openVisitorDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelectedVisitor(null);
    try {
      const res = await fetch(`/api/admin/analytics/visitors/${id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSelectedVisitor(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHour = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Calcul du max pour le graphique SVG
  const maxVisitors = Math.max(1, ...timeseries.map((t) => t.visitors));

  return (
    <div className="space-y-8">
      {/* 1. Header principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>📈</span>
            <span>Analytics & Suivi des Visiteurs</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Données d'audience et parcours de navigation en temps réel (ITID France).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Visiteurs actifs en direct */}
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{kpis?.active_now ?? 0} visiteurs actifs en direct</span>
          </div>

          {/* Bouton de rafraîchissement */}
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Export CSV */}
          <a
            href="/api/admin/analytics/export/csv"
            download
            className="px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </a>
        </div>
      </div>

      {/* 2. Les 6 KPIs Majeurs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Visiteurs aujourd'hui",
            val: kpis?.visitors_today ?? "-",
            sub: `${kpis?.visitors_week ?? "-"} cette semaine`,
            icon: Users,
            color: "text-emerald-400",
            border: "border-emerald-500/20",
          },
          {
            label: "Visiteurs uniques",
            val: kpis?.unique_visitors ?? "-",
            sub: `${kpis?.visitors_month ?? "-"} ce mois`,
            icon: Activity,
            color: "text-cyan-400",
            border: "border-cyan-500/20",
          },
          {
            label: "Sessions totales",
            val: kpis?.total_sessions ?? "-",
            sub: "depuis le lancement",
            icon: Compass,
            color: "text-blue-400",
            border: "border-blue-500/20",
          },
          {
            label: "Pages vues",
            val: kpis?.page_views ?? "-",
            sub: "au total",
            icon: Eye,
            color: "text-purple-400",
            border: "border-purple-500/20",
          },
          {
            label: "Durée moyenne",
            val: kpis ? formatDuration(kpis.avg_duration_seconds) : "-",
            sub: "par session",
            icon: Clock,
            color: "text-amber-400",
            border: "border-amber-500/20",
          },
          {
            label: "Pages / session",
            val: kpis?.pages_per_session ?? "-",
            sub: "profondeur de visite",
            icon: Globe,
            color: "text-rose-400",
            border: "border-rose-500/20",
          },
        ].map((k, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl bg-[#0a1628] border ${k.border} shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-0.5">{k.val}</div>
              <div className="text-[11px] text-slate-500 truncate">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Graphique Visiteurs & Pages Vues dans le temps */}
      <div className="p-6 rounded-2xl bg-[#0a1628] border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📊</span>
              <span>Visiteurs et Activité dans le temps</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Évolution du trafic selon la plage sélectionnée</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#071322] border border-slate-800 self-start sm:self-auto">
            {(
              [
                { id: "today", label: "Aujourd'hui" },
                { id: "yesterday", label: "Hier" },
                { id: "7d", label: "7 jours" },
                { id: "30d", label: "30 jours" },
                { id: "90d", label: "90 jours" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === t.id
                    ? "bg-[#2a9d8f] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Représentation graphique SVG responsive */}
        {timeseries.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs">
            <span>Aucune donnée enregistrée sur cette période</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 px-2 overflow-x-auto">
              {timeseries.map((pt, idx) => {
                const heightPct = Math.max(10, Math.round((pt.visitors / maxVisitors) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-[28px] max-w-[60px] flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {pt.visitors}v
                    </div>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#1a3a5c] to-[#2a9d8f] group-hover:to-[#48cae4] transition-all cursor-pointer relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-t-md transition-colors" />
                    </div>
                    <div className="text-[9px] text-slate-500 truncate w-full text-center">
                      {pt.label.includes("-") ? pt.label.slice(5) : pt.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2a9d8f]"></span>
                  <span>Visiteurs uniques</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Données calculées côté serveur</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Pages les plus visitées & Géolocalisation */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="p-6 rounded-2xl bg-[#0a1628] border border-slate-800 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>📄</span>
            <span>Pages les plus visitées</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">Volume de vues et durée moyenne passée sur chaque page</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Page</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Vues</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Visiteurs</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Temps moy.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topPages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      Aucune page vue enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  topPages.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate" title={p.page_path}>
                        <div>{p.page_path}</div>
                        {p.page_title && <div className="text-[10px] text-slate-400 truncate">{p.page_title}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#48cae4]">{p.views}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">{p.unique_visitors}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {formatDuration(p.avg_duration)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Géolocalisation (Pays & Villes) */}
        <div className="p-6 rounded-2xl bg-[#0a1628] border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>🌍</span>
              <span>Origine géographique (Pays & Villes)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">Géolocalisation IP approximative (conforme RGPD)</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Pays */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Top Pays</h3>
                <div className="space-y-2">
                  {geoData.countries.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3">Aucune donnée pays</div>
                  ) : (
                    geoData.countries.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/40">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <span className="text-sm">📍</span>
                          <span>{c.country || "Inconnu"}</span>
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-cyan-400">{c.visitors}</span>
                          <span className="text-[10px] text-slate-500 ml-1">({c.percentage}%)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Villes */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Top Villes</h3>
                <div className="space-y-2">
                  {geoData.cities.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3">Aucune donnée ville</div>
                  ) : (
                    geoData.cities.slice(0, 5).map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/40">
                        <span className="font-medium text-white truncate max-w-[100px]" title={v.city}>
                          {v.city || "Inconnue"}
                        </span>
                        <span className="font-bold text-[#2a9d8f]">{v.visitors}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Répartition Appareils */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Appareils & Navigateurs</h3>
            <div className="grid grid-cols-3 gap-3">
              {devicesData.devices && devicesData.devices.map((d: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 text-center">
                  <div className="text-base mb-1">
                    {d.device_type === "mobile" ? "📱" : d.device_type === "tablet" ? "📟" : "💻"}
                  </div>
                  <div className="text-[11px] font-semibold text-white capitalize">{d.device_type}</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{d.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tableau des Visiteurs avec Fiche de Parcours */}
      <div className="p-6 rounded-2xl bg-[#0a1628] border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>👥</span>
              <span>Historique Récent des Visiteurs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consultez le parcours de navigation individuel et la chronologie de chaque visiteur
            </p>
          </div>

          {/* Recherche & Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchVisitors()}
                placeholder="Rechercher IP, ville, token..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2a9d8f]"
              />
            </div>

            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setTimeout(fetchVisitors, 50);
              }}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
            >
              <option value="">Tous appareils</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablette</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 font-semibold">Dernière visite</th>
                <th className="py-3 px-3 font-semibold">Visiteur</th>
                <th className="py-3 px-3 font-semibold">Localisation</th>
                <th className="py-3 px-3 font-semibold">IP</th>
                <th className="py-3 px-3 font-semibold">Appareil / Nav.</th>
                <th className="py-3 px-3 font-semibold text-center">Sessions</th>
                <th className="py-3 px-3 font-semibold text-center">Pages</th>
                <th className="py-3 px-3 font-semibold text-right">Temps total</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Aucun visiteur trouvé.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(v.last_seen_at)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        #{v.visitor_token.slice(0, 10)}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-white font-medium">{v.city || "-"}</span>
                      {v.country && <span className="text-slate-400 text-[10px] ml-1">({v.country})</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {v.last_ip_address || "Masquée"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="capitalize text-white font-medium">{v.device_type || "Desktop"}</span>
                      <span className="text-slate-400 text-[10px] ml-1.5">
                        {v.browser} • {v.operating_system}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-cyan-400">{v.total_sessions}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#2a9d8f]">{v.total_page_views}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      {formatDuration(v.total_duration_seconds)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openVisitorDetail(v.id)}
                        className="px-2.5 py-1 rounded bg-[#2a9d8f]/20 hover:bg-[#2a9d8f]/40 text-[#48cae4] hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <span>Parcours</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal / Fiche de Détail du Visiteur avec Parcours Chronologique */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a1628] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0c1a2e]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#2a9d8f] text-white text-xs font-mono font-bold">
                    VISITEUR #{selectedVisitor.visitor.visitor_token.slice(0, 12)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedVisitor.visitor.device_type?.toUpperCase()} • {selectedVisitor.visitor.browser} • {selectedVisitor.visitor.operating_system}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>📍 {selectedVisitor.visitor.city || "Troyes"}, {selectedVisitor.visitor.country || "France"}</span>
                  <span>• Première visite : {formatDate(selectedVisitor.visitor.first_seen_at)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Synthèse + Parcours */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Cartes stats du visiteur */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase">Sessions</div>
                  <div className="text-xl font-bold text-white mt-0.5">{selectedVisitor.visitor.total_sessions}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase">Pages Vues</div>
                  <div className="text-xl font-bold text-[#48cae4] mt-0.5">{selectedVisitor.visitor.total_page_views}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase">Temps Cumulé</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {formatDuration(selectedVisitor.visitor.total_duration_seconds)}
                  </div>
                </div>
              </div>

              {/* Parcours chronologique des sessions */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Parcours de navigation chronologique
                </h3>

                {selectedVisitor.sessions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 text-center text-xs text-slate-500">
                    Aucune session détaillée enregistrée.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedVisitor.sessions.map((sess, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                          <span className="font-semibold text-emerald-400">
                            Session #{sess.id} — Début : {formatDate(sess.started_at)}
                          </span>
                          <span className="text-slate-400 font-mono">
                            Durée : {formatDuration(sess.duration_seconds)} ({sess.page_views} pages)
                          </span>
                        </div>

                        {/* Arbre chronologique des pages */}
                        <div className="pl-3 border-l-2 border-[#2a9d8f]/50 space-y-3 pt-1">
                          {sess.pages_journey && sess.pages_journey.length > 0 ? (
                            sess.pages_journey.map((pj, pIdx) => (
                              <div key={pIdx} className="flex items-start justify-between text-xs group">
                                <div className="flex items-start gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#48cae4] mt-1 shrink-0"></span>
                                  <div>
                                    <div className="font-bold text-white group-hover:text-[#48cae4] transition-colors">
                                      {formatHour(pj.entered_at)} — {pj.page_path}
                                    </div>
                                    {pj.page_title && (
                                      <div className="text-[11px] text-slate-400">{pj.page_title}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 text-right shrink-0">
                                  {pj.duration_seconds > 0 ? formatDuration(pj.duration_seconds) : "< 5s"}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-500 italic">Page d'entrée : {sess.entry_page || "/"}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0c1a2e] flex justify-end">
              <button
                onClick={() => setSelectedVisitor(null)}
                className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
