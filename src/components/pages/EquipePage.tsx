import { useState } from "react";
import { TransitionLink } from "../ui/TransitionLink";
import { TeamRingGallery } from "../ui/TeamRingGallery";
import { TEAM_ROLES } from "../../data";

import equipepaintImg from "../../images/equipepaint.png";
import equipePhoto from "../../images/equipebloc.jpg";

export function EquipePage() {
  const [teamFilter, setTeamFilter] = useState("Tous");

  return (
    <div className="pt-32 pb-12 min-h-screen relative overflow-hidden text-[#1a3a5c]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={equipepaintImg} alt="Fond Equipe ITID" className="w-full h-full object-cover opacity-15 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/95" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <TransitionLink
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
        >
          ←  Retour à l'accueil
        </TransitionLink>
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>L'équipe ITID</h2>
          <p className="text-base leading-relaxed max-w-2xl text-gray-600">
            Rencontrez nos médecins, infirmières, psychologues et thérapeutes engagés pour vous.
          </p>
        </div>

        <div className="relative mb-10 max-w-xs">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all appearance-none cursor-pointer bg-white"
            style={{ color: "#1a3a5c" }}
          >
            {["Tous", ...Array.from(new Set(TEAM_ROLES.map(t => t.role)))].map(filter => (
              <option key={filter} value={filter}>{filter === "Tous" ? "Toutes les spécialités" : filter}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="w-full relative rounded-[32px] overflow-hidden shadow-lg mb-12 border border-black/5">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/90 via-[#1a3a5c]/20 to-transparent z-10 mix-blend-multiply"></div>
          <img src={equipePhoto} alt="L'équipe ITID" className="w-full h-[350px] md:h-[550px] object-cover object-center" />
          <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20">
            <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-3" style={{ fontFamily: "var(--font-display)" }}>Une force unie</h3>
            <p className="text-white/95 text-base md:text-xl font-medium drop-shadow-md max-w-2xl leading-relaxed">
              L'excellence de nos soins repose sur la synergie de nos spécialistes. Une approche pluridisciplinaire au service de votre bien-être.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {["Medecin", "Infirmière", "Secretaire"].map((cat) => {
            const filteredRoles = TEAM_ROLES.filter(t => t.category === cat && (teamFilter === "Tous" || t.role === teamFilter));
            if (filteredRoles.length === 0) return null;

            const title = cat === "Medecin" ? "Équipe Médicale" : cat === "Infirmière" ? "Équipe Paramédicale" : "Secrétariat & Accueil";

            return (
              <TeamRingGallery key={cat} roles={filteredRoles} categoryTitle={title} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
