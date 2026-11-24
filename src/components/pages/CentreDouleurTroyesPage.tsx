import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, MapPin, Phone, Calendar, Clock, ShieldCheck, Stethoscope, Activity, CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { SEOHead } from "../seo/SEOHead";
import { ShimmerButton } from "../ui/ShimmerButton";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";

export function CentreDouleurTroyesPage() {
  const { t } = useTranslation();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Qu'est-ce que l'ITID France à Troyes ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "L'Institut du Traitement Interventionnel de la Douleur (ITID) est un centre médical spécialisé dans l'évaluation, le diagnostic de haute précision et la prise en charge interventionnelle guidée des douleurs chroniques et rebelles à Troyes et dans l'Aube."
        }
      },
      {
        "@type": "Question",
        "name": "Faut-il une ordonnance pour consulter au centre de la douleur à Troyes ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, conformément au parcours de soins coordonnés, la consultation au centre de la douleur nécessite un courrier d'orientation rédigé par votre médecin traitant ou un médecin spécialiste (rhumatologue, chirurgien, neurologue)."
        }
      },
      {
        "@type": "Question",
        "name": "Comment prendre rendez-vous au centre de la douleur ITID à Troyes ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La prise de rendez-vous s'effectue directement en ligne sur Doctolib (rechercher 'ITID - Centre de la douleur Troyes') ou par téléphone auprès de notre secrétariat médical au 03 51 53 20 26."
        }
      },
      {
        "@type": "Question",
        "name": "Quels sont les traitements proposés au centre de la douleur de Troyes ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "L'ITID propose des thérapeutiques mini-invasives guidées par radioscopie ou échographie : infiltrations rachidiennes et articulaires, radiofréquence thermique et pulsée, cryoneurolyse, blocs anesthésiques, rTMS, perfusions de lidocaïne et hypnose médicale (HypnoVR)."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0c1a2e] text-white">
      <SEOHead
        title="Centre de la Douleur à Troyes — Institut ITID France (10)"
        description="Centre spécialisé dans l'évaluation et le traitement de la douleur chronique à Troyes (Aube). Consultations d'algologie, infiltrations guidées et thérapies interventionnelles. RDV Doctolib."
        canonical="https://itid-france.com/centre-douleur-troyes"
        breadcrumbs={[
          { name: "Centre de la Douleur Troyes", item: "/centre-douleur-troyes" }
        ]}
        jsonLd={faqSchema}
      />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0e223d] via-[#0c1a2e] to-[#0a1626]">
        <div className="absolute inset-0 bg-radial-at-c from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase mb-6">
            <MapPin size={13} className="text-[#48cae4]" />
            <span>Troyes & Agglomération • Aube (10)</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Centre de la Douleur à Troyes : <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] via-[#48cae4] to-[#90e0ef]">
              Institut du Traitement Interventionnel (ITID)
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed font-light mb-8">
            Centre médical d'excellence dédié à l'évaluation diagnostique approfondie et aux thérapeutiques interventionnelles guidées par imagerie pour les patients souffrant de douleurs chroniques rebelles à Troyes, dans le département de l'Aube et la région Grand Est.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a
              href={DOCTOLIB_APPOINTMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_4px_20px_rgba(72,202,228,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Calendar size={16} />
              <span>Prendre rendez-vous sur Doctolib</span>
            </a>

            <a
              href="tel:0351532026"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Phone size={16} className="text-[#48cae4]" />
              <span>03 51 53 20 26</span>
            </a>
          </div>
        </div>
      </section>

      {/* Rôle et Spécialité */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">
              Expertise & Spécialité Médicale
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug" style={{ fontFamily: "var(--font-display)" }}>
              Une structure de recours spécialisée dans la douleur chronique à Troyes
            </h2>
            <p className="text-slate-300 leading-relaxed font-light">
              La douleur chronique est une véritable maladie qui touche plus de 12 millions de personnes en France. Lorsqu'une douleur persiste au-delà de 3 mois et résiste aux antalgiques usuels, elle altère profondément le sommeil, l'autonomie et la qualité de vie.
            </p>
            <p className="text-slate-300 leading-relaxed font-light">
              L'<strong>ITID France</strong> intervient comme centre d'expertise et de recours pour poser un diagnostic étiologique rigoureux et proposer des thérapeutiques mini-invasives de pointe, sous contrôle radiologique ou échographique continu.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-2xl font-bold text-[#48cae4]">+12 ans</div>
                <div className="text-xs text-slate-400">D'expérience clinique en algologie</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-2xl font-bold text-[#48cae4]">100%</div>
                <div className="text-xs text-slate-400">Gestes guidés par imagerie HD</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#10243e] via-[#0d1d32] to-[#091523] border border-cyan-500/30 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Stethoscope className="text-[#48cae4]" size={20} />
              <span>Modalités de Prise en Charge à l'ITID</span>
            </h3>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span><strong>Orientation médicale requise :</strong> Consultation sur adressage par votre médecin traitant ou spécialiste hospitalier/libéral.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span><strong>Consultation d'évaluation initiale :</strong> Examen clinique spécialisé, analyse des imageries et bilan multidimensionnel de la douleur.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span><strong>Plateau technique interventionnel :</strong> Gestes réalisés en conditions stériles d'asepsie stricte sous radioscopie ou échographie haute résolution.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#48cae4] shrink-0 mt-0.5" />
                <span><strong>Suivi personnalisé :</strong> Évaluation objective du soulagement et adaptation progressive des thérapeutiques.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-white/10">
              <Link
                to="/consultation-suivi-douleur"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
              >
                <span>Découvrir le déroulement complet d'une consultation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pathologies et Traitements Clés */}
      <section className="py-16 bg-[#081320] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Nos Domaines d'Intervention</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Douleurs traitées & gestes interventionnels
            </h2>
            <p className="text-sm text-slate-400">
              Des techniques minimalement invasives adaptées à chaque mécanisme algique.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Lombalgies & Sciatiques Rebelles",
                desc: "Infiltrations épidurales et foraminales guidées sous radioscopie pour hernies discales et canal lombaire rétréci.",
                link: "/pathologies/lombalgie-chronique"
              },
              {
                title: "Radiofréquence des Facettes",
                desc: "Thermocoagulation des branches médiales articulaires postérieures pour arthrose vertébrale invalidante.",
                link: "/traitements/radiofrequence"
              },
              {
                title: "Névralgies d'Arnold & Céphalées",
                desc: "Blocs anesthésiques et neuromodulation du nerf grand occipital sous repérage échographique millimétrique.",
                link: "/pathologies/nevralgie-arnold"
              },
              {
                title: "Cryoneurolyse Périphérique",
                desc: "Traitement innovant par le froid provoquant un blocage prolongé de la transmission du message douloureux.",
                link: "/traitements/cryoneurolyse"
              },
              {
                title: "Douleurs Neuropathiques & SDRC",
                desc: "Perfusions de lidocaïne intraveineuse, rTMS et stimulation du ganglion de la racine dorsale (DRG).",
                link: "/pathologies/douleurs-neuropathiques"
              },
              {
                title: "Infiltrations Articulaires Échoguidées",
                desc: "Précision millimétrique pour les articulations périphériques rebelles (épaules, genoux, hanches).",
                link: "/traitements/infiltrations-articulaires"
              }
            ].map((card, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0d1d32] border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#48cae4] hover:text-white transition-colors"
                >
                  <span>En savoir plus</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/traitements"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <span>Consulter l'ensemble de nos traitements</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Informations Pratiques & Localisation Troyes */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-6">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#0e2440] via-[#0a182d] to-[#071322] border border-white/15 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Accès & Informations Pratiques</span>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Coordonnées du centre ITID à Troyes
              </h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#48cae4] shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Adresse principale de consultation :</strong>
                    <span>Espace Médical de Spécialistes de Champagne</span><br />
                    <span>25 Avenue des Mailles, 10800 Saint-Julien-les-Villas (Troyes)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#48cae4] shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Secrétariat médical :</strong>
                    <a href="tel:0351532026" className="text-cyan-300 hover:underline">03 51 53 20 26</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[#48cae4] shrink-0 mt-1" />
                  <div>
                    <strong className="text-white block">Horaires d'ouverture :</strong>
                    <span>Lundi au Vendredi : 08h30 – 18h00 (sur rendez-vous)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={DOCTOLIB_APPOINTMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-md hover:brightness-110 transition-all"
                >
                  <Calendar size={14} />
                  <span>Prendre rendez-vous sur Doctolib</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/20 aspect-video md:aspect-square bg-slate-950 flex flex-col justify-center p-6 text-center space-y-3">
              <div className="text-3xl">🗺️</div>
              <h3 className="text-lg font-bold text-white">Localisation & Stationnement</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le centre est facilement accessible depuis la rocade de Troyes et l'autoroute A5 / A26.
                Parking gratuit réservé aux patients et accès direct conforme aux normes PMR (Personnes à Mobilité Réduite).
              </p>
              <a
                href="https://maps.google.com/?q=25+Avenue+des+Mailles,+10800+Saint-Julien-les-Villas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-300 hover:underline font-semibold pt-2"
              >
                <span>Ouvrir l'itinéraire Google Maps</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Foire Aux Questions Spécialisées (GEO & SEO) */}
      <section className="py-16 bg-[#08121e] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Foire Aux Questions</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Questions fréquentes sur le Centre de la Douleur
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
export default CentreDouleurTroyesPage;
