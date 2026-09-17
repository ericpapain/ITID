import { motion } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import { useState } from "react";
import { TRAITEMENTS } from "../../data";
import { CardFlip } from "../ui/CardFlip";
import { ContentNavigator } from "../ui/ContentNavigator";
import { ArrowRight } from "lucide-react";
import { Particles } from "../animations/Particles";
import bgVideo from "../../images/video_intervention_ITID.mp4";
import { useTranslation } from "react-i18next";

function TreatmentFrontFace({ title, desc, img }: { title: string, desc: string, img: string }) {
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[26px]">
        <img src={img} alt={title} className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a2e] via-[#0c1a2e]/60 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full justify-end pb-4 overflow-hidden">
        <div className="translate-y-12 transition-all duration-500 ease-out group-hover:translate-y-0">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug drop-shadow-lg text-center px-2" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <p className="mt-4 text-[18px] text-gray-300 leading-relaxed text-center px-4 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100 line-clamp-3">
            {desc}
          </p>
        </div>
      </div>
    </>
  );
}

function TreatmentBackFace({ desc }: { desc: string }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <h3 className="text-xl font-semibold tracking-tight text-[#48cae4]">
          En savoir plus
        </h3>
        <p className="mt-3 text-[18px] text-gray-300 leading-relaxed whitespace-pre-line">
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
  const { t } = useTranslation();
  const items = TRAITEMENTS.map(item => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc)
  }));
  const [highlightedTitle, setHighlightedTitle] = useState<string | null>(null);

  const handleSelect = (item: any) => {
    setHighlightedTitle(item.title);
    
    // Smooth scroll to the element
    setTimeout(() => {
      const element = document.getElementById(`traitement-${item.title}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Remove highlight after a few seconds
    setTimeout(() => {
      setHighlightedTitle((current) => current === item.title ? null : current);
    }, 4000);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen text-[#1a3a5c] relative overflow-hidden">
      
      {/* Interactive Particles Constellation Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video 
          src={bgVideo} 
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 90% at 50% 0%, rgba(42,157,143,0.15), transparent 60%), radial-gradient(90% 80% at 50% 100%, rgba(72,209,194,0.10), transparent 65%)"
          }}
        />
        <Particles quantity={180} connectDistance={120} repelRadius={140} />
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        {/* Barre supérieure : Retour (gauche) & Sélecteur (droite) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 relative z-50">
          <ShimmerButton
            as="Link"
            to="/"
          >
            ← Retour à l'accueil
          </ShimmerButton>

          <div className="w-full sm:w-72 md:w-80 text-left">
            <ContentNavigator 
              items={items}
              placeholder="Choisir un traitement"
              onSelect={handleSelect}
              theme="light"
            />
          </div>
        </div>
        
        {/* Header Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#1a3a5c] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Tous nos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a5080] to-[#2a9d8f]">
              Traitements
            </span>
          </h2>
          
          <p className="text-lg leading-relaxed text-gray-600 font-light mb-10">
            Découvrez en détail les techniques interventionnelles guidées par imagerie proposées par l'ITID. Des solutions minimalement invasives pour votre soulagement.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div 
              key={t.title}
              id={`traitement-${t.title}`}
              className={`transition-all duration-700 rounded-3xl ${highlightedTitle === t.title ? 'scale-[1.03] ring-4 ring-[#48cae4] drop-shadow-[0_0_30px_rgba(72,202,228,0.5)] z-20 relative' : ''}`}
            >
              <CardFlip 
                className="w-full h-[500px]" 
                front={<TreatmentFrontFace title={t.title} desc={t.desc} img={t.img} />} 
                back={<TreatmentBackFace desc={t.desc} />} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
