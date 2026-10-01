import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAdminSession } from "./auth";
import logo from "../logos/logo ITID 3.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.token) {
        setAdminSession(data.token, data.user);
        navigate("/admin/dashboard", { replace: true });
        return;
      } else {
        throw new Error(data?.error || "Identifiants incorrects.");
      }
    } catch (apiErr: any) {
      setError(apiErr.message || "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071322] px-4">
      <div className="w-full max-w-md bg-[#0c1a2e] border border-slate-700/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2a9d8f]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <img src={logo} alt="ITID" className="w-16 h-16 rounded-full mb-3 object-contain border border-[#2a9d8f]/40" />
          <h1 className="text-2xl font-bold text-white tracking-wide">ITID France CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Espace d'Administration & Gestion de Contenus</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse email administrateur</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#2a9d8f] transition-colors"
              placeholder="Votre adresse email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mot de passe</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#2a9d8f] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#2a9d8f] hover:bg-[#238276] text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(42,157,143,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Connexion...</span>
              </>
            ) : (
              "Se connecter au Back-Office"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <a href="/" className="text-xs text-[#48cae4] hover:underline">
            ← Retourner sur le site public
          </a>
        </div>
      </div>
    </div>
  );
}
