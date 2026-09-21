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
  const [search, setSearch] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/messages?limit=50`;
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
            Enregistrement sécurisé de tous les formulaires (Contact, Devis, Inscriptions formations).
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
      <div className="p-4 rounded-2xl bg-[#0c1a2e] border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex gap-2">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou contenu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2a9d8f]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
          >
            Rechercher
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 mr-1">Statut :</span>
          {[
            { label: "Tous", val: "" },
            { label: "Non lus", val: "unread" },
            { label: "Lus", val: "read" },
            { label: "Archivés", val: "archived" },
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

      {/* Messages Table */}
      <div className="rounded-2xl bg-[#0c1a2e] border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Chargement des messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Aucun message trouvé pour les critères sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081322] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Expéditeur</th>
                  <th className="p-4">Formulaire</th>
                  <th className="p-4">Message / Objet</th>
                  <th className="p-4">Email Hostinger</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {messages.map((m) => (
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-[#48cae4] border border-slate-700">
                        {m.form_name}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <div className="text-white truncate">{m.subject || "Sans objet"}</div>
                      <div className="text-[11px] text-slate-400 truncate">{m.message}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {m.email_sent ? (
                        <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                          <span>✓</span> Envoyé
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-medium" title={m.email_error || "En attente"}>
                          ⚠️ En base (SMTP en attente)
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
                      {m.status !== "archived" ? (
                        <button
                          onClick={() => updateStatus(m.id, "archived")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg"
                        >
                          Archiver
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(m.id, "read")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg"
                        >
                          Désarchiver
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
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-500">Expéditeur</div>
                  <div className="font-semibold text-white">{selectedMessage.name || "Visiteur"}</div>
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
              <div className="flex gap-2">
                {selectedMessage.status === "unread" ? (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, "read")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg"
                  >
                    Marquer comme lu
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, "unread")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg"
                  >
                    Marquer comme non lu
                  </button>
                )}
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
