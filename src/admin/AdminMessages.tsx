import React, { useState, useEffect } from "react";
import { getAuthHeaders } from "./auth";

interface ContactMessage {
  id: number;
  form_name: string;
  name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  metadata: any;
  status: "unread" | "read" | "archived";
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [profileFilter, setProfileFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/messages?limit=100`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  const getProfile = (m: ContactMessage): string => {
    if (m.metadata) {
      if (typeof m.metadata === "object" && m.metadata.category) {
        return m.metadata.category;
      }
      if (typeof m.metadata === "string") {
        try {
          const parsed = JSON.parse(m.metadata);
          if (parsed.category) return parsed.category;
        } catch {}
      }
    }
    const sub = (m.subject || "").toLowerCase();
    if (sub.includes("professionnel") || sub.includes("confraternel") || sub.includes("médecin") || sub.includes("pro")) {
      return "Professionnel de santé";
    }
    if (m.form_name && m.form_name.includes("pro")) {
      return "Professionnel de santé";
    }
    return "Patient";
  };

  const getSubjectBadge = (subject: string | null) => {
    const s = subject || "";
    if (s.includes("urgent") || s.includes("Urgent") || s.includes("🚨")) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
    if (s.includes("Première") || s.includes("évaluation") || s.includes("🩺")) {
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
    if (s.includes("Suivi") || s.includes("Renouvellement") || s.includes("🔄")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
    if (s.includes("interventionnelle") || s.includes("Infiltration") || s.includes("💉")) {
      return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
    if (s.includes("confraternel") || s.includes("Orientation") || s.includes("👨‍⚕️")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    }
    if (s.includes("Devis") || s.includes("ALD") || s.includes("📋")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    if (s.includes("Formations") || s.includes("🎓")) {
      return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  const filteredMessages = messages.filter((m) => {
    if (subjectFilter) {
      const sub = (m.subject || "").toLowerCase();
      if (!sub.includes(subjectFilter.toLowerCase())) return false;
    }
    if (profileFilter) {
      const prof = getProfile(m).toLowerCase();
      if (profileFilter === "pro" && !prof.includes("pro")) return false;
      if (profileFilter === "patient" && prof.includes("pro")) return false;
    }
    return true;
  });

  const updateStatus = async (id: number, newStatus: "unread" | "read" | "archived") => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMessage = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce message de la base de données ?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/messages?id=${id}&action=delete`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de communication avec le serveur.");
    }
  };

  const openMessage = (m: ContactMessage) => {
    setSelectedMessage(m);
    if (m.status === "unread") {
      updateStatus(m.id, "read");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages & Demandes Reçues</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enregistrement sécurisé et filtrage intelligent par objet médical (Urgence, Consultation, Suivi, Infiltrations, Confrères).
          </p>
        </div>

        <a
          href="/api/admin/messages/export/csv"
          download
          className="px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <span>📥 Exporter en CSV</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1a2e] border border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full lg:w-auto flex gap-2">
          <input
            type="text"
            placeholder="Rechercher par nom, email, objet ou contenu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2a9d8f]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white cursor-pointer"
          >
            Rechercher
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Dropdown Filtre par Profil */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Profil :</span>
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#2a9d8f] cursor-pointer"
            >
              <option value="">Tous les profils</option>
              <option value="patient">👤 Patients uniquement</option>
              <option value="pro">🩺 Pros de santé uniquement</option>
            </select>
          </div>

          {/* Dropdown Filtre par Objet */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 whitespace-nowrap">Objet :</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#2a9d8f] cursor-pointer"
            >
              <option value="">Tous les objets</option>
              <option value="urgent">🚨 Rendez-vous urgent</option>
              <option value="première consultation">🩺 Première consultation</option>
              <option value="suivi">🔄 Suivi de traitement</option>
              <option value="interventionnelle">💉 Technique interventionnelle</option>
              <option value="confraternel">👨‍⚕️ Avis confraternel</option>
              <option value="devis">📋 Devis / Prise en charge</option>
              <option value="formations">🎓 Formations ITID</option>
              <option value="autre">💬 Autre demande</option>
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-0.5">Statut :</span>
            {[
              { label: "Tous", val: "" },
              { label: "Non lus", val: "unread" },
              { label: "Lus", val: "read" },
              { label: "Archivés", val: "archived" },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setStatusFilter(f.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
      </div>

      {/* Messages Table */}
      <div className="rounded-2xl bg-[#0c1a2e] border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Chargement des messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Aucun message trouvé pour les critères sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081322] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Expéditeur</th>
                  <th className="p-4">Profil</th>
                  <th className="p-4">Objet / Motif</th>
                  <th className="p-4">Aperçu Message</th>
                  <th className="p-4">Email Hostinger</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMessages.map((m) => {
                  const prof = getProfile(m);
                  const isPro = prof.toLowerCase().includes("pro");

                  return (
                    <tr
                      key={m.id}
                      onClick={() => openMessage(m)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        m.status === "unread" ? "bg-[#2a9d8f]/5 font-semibold text-white" : ""
                      }`}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{m.name || "Visiteur"}</div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                        {m.phone && <div className="text-[10px] text-slate-500">{m.phone}</div>}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <span>🩺</span> Pro de santé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            <span>👤</span> Patient
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap max-w-xs">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getSubjectBadge(m.subject)} truncate max-w-[220px]`}>
                          {m.subject || "Demande générale"}
                        </span>
                      </td>
                    <td className="p-4 max-w-xs truncate">
                      <div className="text-[11px] text-slate-300 truncate">{m.message}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {m.email_sent ? (
                        <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                          <span>✓</span> Envoyé
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-medium" title={m.email_error || "Enregistré en BDD"}>
                          En base (Reçu)
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.status === "unread"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : m.status === "read"
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {m.status === "unread" ? "Non lu" : m.status === "read" ? "Lu" : "Archivé"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-[11px] text-slate-400">
                      {new Date(m.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {m.status !== "archived" ? (
                          <button
                            onClick={() => updateStatus(m.id, "archived")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg cursor-pointer transition-colors"
                            title="Archiver"
                          >
                            Archiver
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(m.id, "read")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg cursor-pointer transition-colors"
                            title="Désarchiver"
                          >
                            Désarchiver
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteMessage(m.id, e)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[11px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                          title="Supprimer définitivement"
                        >
                          <span>🗑️</span>
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0c1a2e] border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a9d8f]">
                  Formulaire : {selectedMessage.form_name}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedMessage.subject || "Message sans objet"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-slate-500">Expéditeur</div>
                  <div className="font-semibold text-white">{selectedMessage.name || "Visiteur"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Profil</div>
                  <div className="font-semibold text-white mt-0.5">
                    {getProfile(selectedMessage).toLowerCase().includes("pro") ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        🩺 Pro de santé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        👤 Patient
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Email</div>
                  <a href={`mailto:${selectedMessage.email}`} className="text-[#48cae4] hover:underline font-semibold">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <div className="text-slate-500">Téléphone</div>
                  <div className="text-white">{selectedMessage.phone || "Non renseigné"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Date de réception</div>
                  <div className="text-white">{new Date(selectedMessage.created_at).toLocaleString("fr-FR")}</div>
                </div>
                <div>
                  <div className="text-slate-500">Statut Envoi</div>
                  <div className="text-white">{selectedMessage.email_sent ? "✓ Envoyé par email" : "Enregistré en BDD"}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Corps du message :</div>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.metadata && (
                <div>
                  <div className="text-slate-400 font-semibold mb-1">Métadonnées / Détails :</div>
                  <pre className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(selectedMessage.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {selectedMessage.status === "unread" ? (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, "read")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
                  >
                    Marquer comme lu
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, "unread")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
                  >
                    Marquer comme non lu
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>🗑️</span> Supprimer ce message
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject || "Votre demande ITID France")}`}
                className="px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <span>✉️ Répondre par Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
