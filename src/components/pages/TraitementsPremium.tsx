import { motion } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { useState } from "react";
import { TRAITEMENTS } from "../../data";
import { CardFlip } from "../ui/CardFlip";
import { ArrowRight } from "lucide-react";
import { Particles } from "../animations/Particles";

function TreatmentFrontFace({ title, img }: { title: string, img: string }) {
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[26px]">
        <img src={img} alt={title} className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] via-[#0c1a2e]/40 to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full items-center justify-end pb-4">
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug drop-shadow-lg text-center px-2" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
      </div>
    </>
  );
}

function TreatmentBackFace({ desc }: { desc: string }) {
  return (
    <>
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-[#48cae4]">
          En savoir plus
        </h3>
        <p className="mt-3 text-[15px] text-gray-300 leading-relaxed">
          {desc}
        </p>
      </div>

      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#48cae4]/20 border border-[#48cae4]/50 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(72,202,228,0.3)] transition-colors duration-200 hover:bg-[#48cae4]/40"
      >
        Prendre rendez-vous
        <ArrowRight size={15} strokeWidth={2.25} />
      </button>
    </>
  );
}

export function TraitementsPremium() {
  const [traitFilter, setTraitFilter] = useState("");

  const filteredTraitements = TRAITEMENTS.filter(t => 
    t.title.toLowerCase().includes(traitFilter.toLowerCase()) || 
    t.desc.toLowerCase().includes(traitFilter.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 min-h-screen text-[#1a3a5c] relative overflow-hidden">
      
      {/* Interactive Particles Constellation Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 90% at 50% 0%, rgba(42,157,143,0.15), transparent 60%), radial-gradient(90% 80% at 50% 100%, rgba(72,209,194,0.10), transparent 65%)"
          }}
        />
        <Particles quantity={180} connectDistance={120} repelRadius={140} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <TransitionLink
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}
        >
          ←  Retour à l'accueil
        </TransitionLink>
        
        {/* Header Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 glass text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#48cae4] animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1a3a5c]">Expertise Interventionnelle</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#1a3a5c] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Tous nos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a5080] to-[#2a9d8f]">
              Traitements
            </span>
          </h2>
          
          <p className="text-lg leading-relaxed text-gray-600 font-light mb-10">
            Découvrez en détail les techniques interventionnelles guidées par imagerie proposées par l'ITID. Des solutions minimalement invasives pour votre soulagement.
          </p>
          
          <div className="relative max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Rechercher un traitement (ex: infiltration)..." 
              value={traitFilter}
              onChange={(e) => setTraitFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-[#1a3a5c]/20 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 bg-white/70 text-[#1a3a5c] placeholder-gray-500 transition-all shadow-md"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔒</span>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTraitements.map((t) => (
            <div key={t.title}>
              <CardFlip 
                className="w-full h-[450px]" 
                front={<TreatmentFrontFace title={t.title} img={t.img} />} 
                back={<TreatmentBackFace desc={t.desc} />} 
              />
            </div>
          ))}
          
          {filteredTraitements.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 glass rounded-3xl border border-white/10">
              <div className="text-4xl mb-4">💉</div>
              <p className="text-lg">Aucun traitement ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
