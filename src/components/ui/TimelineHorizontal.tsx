import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export interface Milestone {
  date: string;
  title: string;
  description: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    date: "Étape 01",
    title: "Orientation médicale",
    description: "Votre médecin traitant, un spécialiste ou un service hospitalier adresse une demande de prise en charge à l’ITID.",
  },
  {
    date: "Étape 02",
    title: "Consultation d’évaluation",
    description: "Un médecin algologue analyse votre situation, retrace l’histoire de votre douleur et étudie les examens déjà réalisés.",
  },
  {
    date: "Étape 03",
    title: "Plan de traitement personnalisé",
    description: "Une stratégie thérapeutique adaptée est construite avec vous : infiltrations, perfusions, neuromodulation, cryoneurolyse et approches complémentaires.",
  },
  {
    date: "Étape 04",
    title: "Suivi et réévaluation",
    description: "Les résultats sont régulièrement évalués afin d’adapter les traitements et maintenir la coordination avec vos différents médecins.",
  },
];

// Positions horizontales précises et alternance haut/bas
const STEP_CONFIG = [
  { left: 14, side: "top" as const },
  { left: 38, side: "bottom" as const },
  { left: 62, side: "top" as const },
  { left: 86, side: "bottom" as const },
];

export function TimelineHorizontal({
  milestones = DEFAULT_MILESTONES,
  className,
}: {
  milestones?: Milestone[];
  className?: string;
}) {
  const steps = milestones.slice(0, 4);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Animation séquentielle de l'étape 1 à l'étape 4 en boucle fluide
  useEffect(() => {
    if (selectedMilestone) return; // Pause pendant la consultation plein écran
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedMilestone, steps.length]);

  // Fermeture par touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMilestone(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeLeft = STEP_CONFIG[activeStep]?.left ?? 14;

  return (
    <div className={cn("relative w-full my-2", className)}>
      {/* =========================================================================
          VERSION DESKTOP & TABLETTE (Progression fluide, zoom, couleur et plein écran)
          ========================================================================= */}
      <div className="hidden md:block relative h-[390px] w-full select-none">
        {/* Ligne de base grise discrète */}
        <div className="absolute left-[6%] right-[6%] top-1/2 h-[2px] -translate-y-1/2 bg-white/10 pointer-events-none" />

        {/* Faisceau lumineux de progression qui va d'étape en étape */}
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#2a9d8f] to-[#48d1c2] pointer-events-none transition-all duration-700 ease-out shadow-[0_0_12px_rgba(72,209,194,0.6)]"
          style={{ width: `${activeLeft}%` }}
        />

        {/* Curseur comète sur la ligne à la position active */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out z-30"
          style={{ left: `${activeLeft}%` }}
        >
          <div className="h-4 w-4 rounded-full bg-[#48d1c2] blur-[3px] opacity-70 animate-ping" />
        </div>

        {/* 4 Étapes */}
        {steps.map((milestone, i) => {
          const config = STEP_CONFIG[i] || {
            left: 14 + i * 24,
            side: i % 2 === 0 ? ("top" as const) : ("bottom" as const),
          };
          const isTop = config.side === "top";
          const isActive = i === activeStep;

          return (
            <React.Fragment key={milestone.date + i}>
              {/* Point circulaire sur la ligne (s'illumine à l'activation) */}
              <div
                className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${config.left}%` }}
                onClick={() => {
                  setActiveStep(i);
                  setSelectedMilestone(milestone);
                }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-500",
                    isActive
                      ? "h-6 w-6 border-2 border-[#48d1c2] bg-[#48d1c2] shadow-[0_0_18px_rgba(72,209,194,0.9)] scale-110"
                      : "h-4 w-4 border-2 border-[#48d1c2]/40 bg-[#0c1a2e]"
                  )}
                >
                  <span
                    className={cn(
                      "rounded-full transition-all duration-500",
                      isActive ? "h-2 w-2 bg-[#0c1a2e]" : "h-1 w-1 bg-[#48d1c2]"
                    )}
                  />
                </div>
              </div>

              {/* Ligne verticale reliant la carte au point */}
              <div
                className={cn(
                  "absolute z-10 w-[2px] -translate-x-1/2 pointer-events-none transition-all duration-500",
                  isActive
                    ? "bg-[#48d1c2] shadow-[0_0_10px_rgba(72,209,194,0.8)] opacity-100"
                    : "bg-[#48d1c2]/30 opacity-40"
                )}
                style={
                  isTop
                    ? { left: `${config.left}%`, bottom: "50%", height: "20px" }
                    : { left: `${config.left}%`, top: "50%", height: "20px" }
                }
              />

              {/* Carte avec ZOOM ACCENTUÉ et COULEUR VIBRANTE au passage */}
              <div
                className={cn(
                  "absolute w-[230px] lg:w-[255px] xl:w-[270px] -translate-x-1/2 cursor-pointer transition-all duration-500 ease-out",
                  isActive ? "z-30" : "z-10"
                )}
                style={
                  isTop
                    ? { left: `${config.left}%`, bottom: "calc(50% + 20px)" }
                    : { left: `${config.left}%`, top: "calc(50% + 20px)" }
                }
                onClick={() => {
                  setActiveStep(i);
                  setSelectedMilestone(milestone);
                }}
              >
                <div
                  className={cn(
                    "relative rounded-2xl p-4 lg:p-5 backdrop-blur-md transition-all duration-500",
                    isActive
                      ? "scale-[1.14] border-2 border-[#48d1c2] bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#134e4a] text-white shadow-[0_0_45px_rgba(72,209,194,0.6),0_20px_45px_rgba(0,0,0,0.8)] ring-2 ring-[#48d1c2]/50"
                      : "scale-100 border border-[#48d1c2]/20 bg-[#0c1a2e]/90 shadow-[0_10px_28px_rgba(0,0,0,0.5)] opacity-70 hover:opacity-95 hover:border-[#48d1c2]/50"
                  )}
                >
                  {/* Petit badge étape */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "block text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all duration-500",
                        isActive
                          ? "bg-[#48d1c2] text-[#071926] shadow-sm font-extrabold"
                          : "text-[#48cae4]/80 bg-white/5"
                      )}
                    >
                      {milestone.date}
                    </span>
                    {/* Indicateur discret d'agrandissement */}
                    <span
                      className={cn(
                        "text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full transition-all font-semibold",
                        isActive
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-slate-500 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      Détails ⤢
                    </span>
                  </div>

                  {/* Titre avec mise en avant colorée */}
                  <h3
                    className={cn(
                      "text-sm lg:text-base font-bold mb-1.5 leading-snug transition-colors duration-500",
                      isActive ? "text-white drop-shadow-sm font-extrabold" : "text-slate-200"
                    )}
                  >
                    {milestone.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={cn(
                      "text-xs lg:text-sm leading-relaxed line-clamp-3 transition-colors duration-500",
                      isActive ? "text-cyan-50 font-medium drop-shadow-sm" : "text-slate-400"
                    )}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* =========================================================================
          VERSION MOBILE (Verticale animée et cliquable)
          ========================================================================= */}
      <div className="block md:hidden relative pl-8 py-2 space-y-5">
        {/* Ligne verticale continue */}
        <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#48d1c2] via-[#2a9d8f] to-[#48d1c2]/30 pointer-events-none" />

        {steps.map((milestone, i) => {
          const isActive = i === activeStep;
          return (
            <div
              key={milestone.date + i}
              className="relative cursor-pointer"
              onClick={() => {
                setActiveStep(i);
                setSelectedMilestone(milestone);
              }}
            >
              {/* Point sur la ligne verticale */}
              <div
                className={cn(
                  "absolute -left-8 top-5 flex -translate-x-1/2 items-center justify-center rounded-full z-10 transition-all duration-500",
                  isActive
                    ? "h-6 w-6 border-2 border-[#48d1c2] bg-[#48d1c2] shadow-[0_0_12px_rgba(72,209,194,0.8)]"
                    : "h-5 w-5 border-2 border-[#48d1c2]/50 bg-[#0c1a2e]"
                )}
              >
                <span
                  className={cn(
                    "rounded-full transition-all duration-500",
                    isActive ? "h-2 w-2 bg-[#0c1a2e]" : "h-1.5 w-1.5 bg-[#48d1c2]"
                  )}
                />
              </div>

              {/* Carte mobile avec zoom accentué et couleur active vibrante */}
              <div
                className={cn(
                  "rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all duration-500",
                  isActive
                    ? "scale-[1.05] border-2 border-[#48d1c2] bg-gradient-to-br from-[#164e63] via-[#0e7490] to-[#134e4a] text-white shadow-[0_0_35px_rgba(72,209,194,0.5)] ring-2 ring-[#48d1c2]/50"
                    : "scale-100 border border-[#48d1c2]/20 bg-[#0c1a2e]/95 opacity-75"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "block text-xs uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors duration-500",
                      isActive ? "bg-[#48d1c2] text-[#071926] font-black" : "text-[#48cae4] bg-white/5"
                    )}
                  >
                    {milestone.date}
                  </span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white font-semibold" : "text-[#48cae4] bg-white/10"
                  )}>
                    Détails ⤢
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {milestone.title}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed",
                  isActive ? "text-cyan-50 font-medium" : "text-slate-300"
                )}>
                  {milestone.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL PLEIN ÉCRAN (Arrière-plan flouté au clic sur n'importe quelle carte)
          ========================================================================= */}
      {selectedMilestone && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedMilestone(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl border-2 border-[#48d1c2] bg-[#0c1a2e] p-7 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(72,209,194,0.3)] text-left transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermeture */}
            <button
              onClick={() => setSelectedMilestone(null)}
              className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-lg"
              aria-label="Fermer"
            >
              ✕
            </button>

            {/* Badge de l'étape */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#48d1c2]/20 border border-[#48d1c2]/50 text-xs md:text-sm font-bold uppercase tracking-widest text-[#48cae4] mb-4">
              <span className="h-2 w-2 rounded-full bg-[#48d1c2] animate-pulse" />
              {selectedMilestone.date}
            </div>

            {/* Titre en grand */}
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
              {selectedMilestone.title}
            </h3>

            {/* Description détaillée */}
            <p className="text-base md:text-lg text-slate-200 leading-relaxed">
              {selectedMilestone.description}
            </p>

            {/* Pied de modal avec bouton de fermeture */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Appuyez sur Échap ou cliquez à l'extérieur pour fermer
              </span>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-6 py-2.5 rounded-full bg-[#2a9d8f] hover:bg-[#48d1c2] text-white font-semibold text-sm transition-colors shadow-lg"
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
