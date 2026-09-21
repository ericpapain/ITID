import React, { useState, useEffect } from "react";
import { getAuthHeaders } from "./auth";

interface Subscriber {
  id: number;
  email: string;
  first_name: string | null;
  status: "pending" | "subscribed" | "unsubscribed";
  source: string;
  consent_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Campaign Modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSummary, setCampaignSummary] = useState("");
  const [campaignUrl, setCampaignUrl] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/newsletter/subscribers?limit=50";
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const handleUnsubscribe = async (id: number) => {
    if (!window.confirm("Confirmer la désinscription manuelle de cet abonné ?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}/unsubscribe`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "unsubscribed" } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingCampaign) return;

    setSendingCampaign(true);
    setCampaignResult(null);

    try {
      const res = await fetch("/api/newsletter/trigger-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": "itid_dev_cron_secret_12345",
        },
        body: JSON.stringify({
          subject: campaignSubject,
          contentTitle: campaignTitle,
          contentSummary: campaignSummary,
          contentUrl: campaignUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de l'envoi de la campagne");
      }

      setCampaignResult(`✅ ${data.message}`);
      setCampaignSubject("");
      setCampaignTitle("");
      setCampaignSummary("");
      setCampaignUrl("");
    } catch (err: any) {
      setCampaignResult(`❌ ${err.message}`);
    } finally {
      setSendingCampaign(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion de la Newsletter</h1>
          <p className="text-xs text-slate-400 mt-1">
            Liste des abonnés, désinscriptions conformes RGPD et déclenchement de campagnes de diffusion.
          </p>
        </div>

        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowCampaignModal(true)}
            className="px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>📢 Envoyer une Campagne</span>
          </button>
          <a
            href="/api/admin/newsletter/subscribers/export/csv"
            download
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <span>📥 Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1a2e] border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <input
            type="text"
            placeholder="Rechercher par adresse email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSubscribers()}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2a9d8f]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Statut :</span>
          {[
            { label: "Tous", val: "" },
            { label: "Abonnés", val: "subscribed" },
            { label: "En attente", val: "pending" },
            { label: "Désinscrits", val: "unsubscribed" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setStatusFilter(f.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.val
                  ? "bg-[#2a9d8f] text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0c1a2e] border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Chargement des abonnés...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Aucun abonné trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081322] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Consentement</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white whitespace-nowrap">
                      {s.email}
                      {s.first_name && <span className="ml-2 text-slate-400 font-normal">({s.first_name})</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === "subscribed"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : s.status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {s.status === "subscribed"
                          ? "Actif"
                          : s.status === "pending"
                          ? "En attente"
                          : "Désinscrit"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">{s.source}</td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(s.consent_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {s.status === "subscribed" && (
                        <button
                          onClick={() => handleUnsubscribe(s.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-[11px] rounded-lg transition-colors"
                        >
                          Désinscrire
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0c1a2e] border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Diffuser une Campagne Newsletter</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {campaignResult && (
              <div className="mb-4 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white">
                {campaignResult}
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Objet de l'email *</label>
                <input
                  type="text"
                  required
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="ex: ITID France — Nouvelle avancée sur la neuromodulation"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre de la publication *</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="ex: Prise en charge moderne des douleurs neuropathiques"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Résumé / Message d'introduction</label>
                <textarea
                  rows={3}
                  value={campaignSummary}
                  onChange={(e) => setCampaignSummary(e.target.value)}
                  placeholder="Résumé envoyé aux abonnés dans le corps du message..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lien de redirection (URL)</label>
                <input
                  type="url"
                  value={campaignUrl}
                  onChange={(e) => setCampaignUrl(e.target.value)}
                  placeholder="https://itid-france.com/actualites/..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2a9d8f]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={sendingCampaign}
                  className="px-5 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold rounded-xl flex items-center gap-2"
                >
                  {sendingCampaign ? "Envoi en cours..." : "Lancer la diffusion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
