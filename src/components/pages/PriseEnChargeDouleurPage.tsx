import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Calendar, Stethoscope, Activity, FileText, Clock, HelpCircle, ShieldAlert } from "lucide-react";
import { SEOHead } from "../seo/SEOHead";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";

export function PriseEnChargeDouleurPage() {
  const { t } = useTranslation();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Qu'est-ce qu'une douleur chronique ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Une douleur est dite chronique lorsqu'elle persiste ou récidive au-delà de 3 mois, devenant une pathologie autonome qui ne répond plus aux antalgiques usuels et nécessite une approche multidisciplinaire."
        }
      },
      {
        "@type": "Question",
        "name": "Quelle est la différence entre douleur aiguë et douleur chronique ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La douleur aiguë est un signal d'alarme transitoire lié à une lésion ou une inflammation récente. La douleur chronique, quant à elle, persiste après la cicatrisation tissulaire en raison d'une sensibilisation anormale du système nerveux central et périphérique."
        }
      },
      {
        "@type": "Question",
        "name": "Quelles sont les étapes du parcours de soins à l'ITID ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le parcours comprend 4 étapes : 1) La consultation d'évaluation avec un médecin algologue, 2) Le choix concerté d'une stratégie thérapeutique personnalisée, 3) La réalisation du geste interventionnel sous guidage d'imagerie, 4) Le suivi régulier et l'évaluation de l'efficacité fonctionnelle."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0c1a2e] text-white">
      <SEOHead
        title="Prise en Charge de la Douleur Chronique à Troyes — ITID"
        description="Découvrez le parcours de soins et les protocoles spécialisés de prise en charge de la douleur chronique à l'ITID Troyes (10). Diagnostic, gestes interventionnels guidés et suivi coordonné."
        canonical="https://itid-france.com/prise-en-charge-douleur-chronique"
        breadcrumbs={[
          { name: "Prise en Charge Douleur Chronique", item: "/prise-en-charge-douleur-chronique" }
        ]}
        jsonLd={faqSchema}
      />

      {/* Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0e223d] via-[#0c1a2e] to-[#0a1626]">
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase mb-6">
            Parcours de Soins & Thérapeutiques Multimodales
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Prise en Charge de la Douleur Chronique <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] via-[#48cae4] to-[#90e0ef]">
              à Troyes et dans l'Aube
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light mb-8">
            Une approche globale, individualisée et mini-invasive pour rompre le cercle vicieux de la douleur persistante et restaurer durablement la qualité de vie.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href={DOCTOLIB_APPOINTMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_4px_20px_rgba(72,202,228,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Calendar size={16} />
              <span>Prendre rendez-vous sur Doctolib</span>
            </a>
          </div>
        </div>
      </section>

      {/* Comprendre la Douleur Chronique */}
      <section className="py-16 max-w-5xl mx-auto px-6 space-y-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Définition Médicale</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Qu'est-ce que la douleur chronique ?
            </h2>
            <p className="text-slate-300 font-light leading-relaxed text-sm">
              Contrairement à la douleur aiguë qui prévient d'une menace corporelle immédiate, la <strong>douleur chronique</strong> persiste au-delà de 3 mois. Elle n'est plus un simple symptôme, mais devient une pathologie à part entière.
            </p>
            <p className="text-slate-300 font-light leading-relaxed text-sm">
              Elle s'accompagne d'un phénomène de sensibilisation centrale (le système nerveux amplifie les signaux douloureux) et engendre des retentissements physiques, psychologiques et socioprofessionnels majeurs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e2138] border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-[#48cae4]">Quand consulter un spécialiste de la douleur ?</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span>Douleur évoluant depuis plus de 3 à 6 mois malgré les traitements de première ligne.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span>Sensations de brûlures, décharges électriques, engourdissements (douleur neuropathique).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span>Échec ou intolérance aux antalgiques majeurs (opioïdes, anti-inflammatoires).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span>Altération du sommeil, anxiété réactionnelle et limitation des mouvements quotidiens.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Les 4 étapes du parcours */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Organisation des Soins</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Le parcours patient à l'ITID Troyes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {[
              {
                num: "01",
                title: "Évaluation Initiale",
                desc: "Analyse approfondie de vos antécédents, de vos imageries et de la typologie exacte de votre douleur avec un algologue."
              },
              {
                num: "02",
                title: "Décision Thérapeutique",
                desc: "Proposition d'un protocole sur-mesure combinant gestes interventionnels ciblés et optimisation médicamenteuse."
              },
              {
                num: "03",
                title: "Geste Guidé",
                desc: "Réalisation du traitement interventionnel sous contrôle scopique ou échographique millimétrique en conditions stériles."
              },
              {
                num: "04",
                title: "Suivi & Réévaluation",
                desc: "Mesure objective du soulagement à court et moyen terme, réajustement thérapeutique et coordination avec votre médecin."
              }
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#0e213b] border border-white/10 relative space-y-3">
                <span className="text-3xl font-bold font-mono text-cyan-400/40">{step.num}</span>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Approche multimodale */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#10243e] via-[#0d1d32] to-[#091523] border border-cyan-500/30 space-y-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Une palette thérapeutique multimodale complète
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            À l'ITID, nous ne nous limitons pas à un seul type de réponse. En fonction de l'origine de votre douleur (mécanique, inflammatoire, neuropathique ou nociplastique), plusieurs solutions peuvent être associées :
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-cyan-300 block text-sm">Gestes Interventionnels</strong>
              <p className="text-slate-300">Infiltrations épidurales, radiofréquence, cryoneurolyse et blocs nerveux périphériques.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-cyan-300 block text-sm">Neuromodulation</strong>
              <p className="text-slate-300">Stimulation magnétique transcrânienne (rTMS), TENS et stimulation du ganglion spinal (DRG).</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-cyan-300 block text-sm">Thérapies Psycho-corporelles</strong>
              <p className="text-slate-300">Hypnose médicale et réalité virtuelle thérapeutique (HypnoVR) pour moduler la perception centrale.</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/traitements"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white font-bold text-xs hover:brightness-110 transition-all"
            >
              <span>Découvrir tous les traitements</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/centre-douleur-troyes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 transition-all"
            >
              <span>Centre ITID à Troyes</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#08121e] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Questions Fréquentes</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Comprendre la prise en charge
            </h2>
          </div>

          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0c1a2e] border border-white/10 space-y-2">
                <h3 className="text-base font-bold text-cyan-200">
                  {faq.name}
                </h3>
                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
export default PriseEnChargeDouleurPage;
