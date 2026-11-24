import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Calendar, FileText, ClipboardList, HelpCircle, Phone, Clock, AlertCircle } from "lucide-react";
import { SEOHead } from "../seo/SEOHead";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";

export function ConsultationSuiviDouleurPage() {
  const { t } = useTranslation();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Que faut-il apporter lors de la première consultation douleur à Troyes ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pour votre première consultation, apportez : 1) Le courrier d'adressage de votre médecin traitant ou spécialiste, 2) Tous vos examens d'imagerie récents (radiographies, scanners, IRM avec leurs comptes-rendus), 3) Vos ordonnances actuelles et antérieures détaillant les antalgiques déjà testés, 4) Vos éventuels comptes-rendus opératoires."
        }
      },
      {
        "@type": "Question",
        "name": "Combien de temps dure une consultation d'algologie ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La première consultation d'évaluation dure généralement entre 45 minutes et 1 heure. Ce temps est indispensable pour retracer l'historique complet de votre douleur, réaliser un examen clinique minutieux et construire votre stratégie de soin."
        }
      },
      {
        "@type": "Question",
        "name": "Comment se déroule le suivi après un geste interventionnel ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Après une infiltration, une radiofréquence ou une cryoneurolyse, un suivi structuré est organisé à 4-6 semaines pour mesurer l'échelle de soulagement, évaluer la récupération fonctionnelle et décider de la poursuite du protocole."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0c1a2e] text-white">
      <SEOHead
        title="Consultation et Suivi de la Douleur à Troyes — ITID"
        description="Comment se déroule une consultation d'algologie à l'ITID Troyes ? Documents à préparer, examen clinique, étapes de prise en charge et suivi post-intervention."
        canonical="https://itid-france.com/consultation-suivi-douleur"
        breadcrumbs={[
          { name: "Consultation & Suivi Douleur", item: "/consultation-suivi-douleur" }
        ]}
        jsonLd={faqSchema}
      />

      {/* Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0e223d] via-[#0c1a2e] to-[#0a1626]">
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase mb-6">
            Guide Patient & Préparation
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Consultation et Suivi de la Douleur <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] via-[#48cae4] to-[#90e0ef]">
              au Centre ITID à Troyes (10)
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light mb-8">
            Toutes les informations pratiques pour bien préparer votre première consultation d'évaluation, comprendre les examens réalisés et organiser votre suivi personnalisé.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={DOCTOLIB_APPOINTMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-sm shadow-[0_4px_20px_rgba(72,202,228,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Calendar size={16} />
              <span>Prendre RDV sur Doctolib</span>
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

      {/* Déroulement de la consultation */}
      <section className="py-16 max-w-5xl mx-auto px-6 space-y-12">
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Déroulement du Rendez-vous</span>
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Comment se passe la première consultation d'évaluation ?
          </h2>
          <p className="text-slate-300 font-light leading-relaxed text-sm">
            La première consultation au centre ITID de Troyes est un temps d'échange privilégié d'une durée moyenne de 45 minutes à 1 heure. Elle est menée par un médecin spécialiste algologue et anesthésiste-réanimateur.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e213b] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-white">L'Anamnèse & l'Écoute</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Reconstitution de l'historique de votre douleur : début, intensité, facteurs aggravants ou soulageants, antécédents médicaux et chirurgicaux, impact sur le sommeil et le travail.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e213b] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-white">L'Examen Clinique Ciblé</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Examen neurologique et ostéo-articulaire précis, recherche de points gâchettes (triggers), cartographie des zones d'allodynie ou d'hypoesthésie (questionnaire DN4).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e213b] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-white">Le Projet Thérapeutique</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Explication claire du mécanisme de la douleur, analyse conjointe de vos IRM/scanners et proposition concertée du geste interventionnel ou de la neuromodulation adaptée.
            </p>
          </div>
        </div>

        {/* Que préparer avant votre rendez-vous */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#10243e] via-[#0d1d32] to-[#091523] border border-cyan-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-[#48cae4]" size={24} />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Que devez-vous préparer avant de venir ?
            </h2>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-light">
            Pour optimiser la qualité de votre prise en charge dès la première séance, merci de rassembler dans une pochette :
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Courrier de votre médecin</strong>
                <span className="text-slate-300">Indispensable dans le cadre du parcours de soins coordonnés de l'Assurance Maladie.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Examens d'imagerie (CD-ROM & Comptes-rendus)</strong>
                <span className="text-slate-300">IRM récentes, scanners, radiographies et échographies articulaires ou rachidiennes.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Dernières ordonnances médicales</strong>
                <span className="text-slate-300">Liste complète de vos traitements antalgiques actuels et des molécules déjà essayées.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#48cae4] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Comptes-rendus opératoires</strong>
                <span className="text-slate-300">En cas d'antécédents de chirurgie du rachis, de prothèse ou d'interventions antérieures.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Le Suivi Médical */}
        <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
          <div className="space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Pérennité des Soins</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              L'importance capitale du suivi médical
            </h2>
            <p className="text-slate-300 font-light leading-relaxed text-sm">
              Un geste interventionnel (infiltration, radiofréquence, cryoneurolyse) n'est jamais un acte isolé. Il s'inscrit dans un <strong>protocole de suivi structuré</strong>.
            </p>
            <p className="text-slate-300 font-light leading-relaxed text-sm">
              Une consultation de contrôle est planifiée à 4 à 6 semaines. Elle permet de quantifier précisément l'efficacité antalgique (carnet de bord de la douleur, réduction de la prise de médicaments) et d'ajuster si nécessaire la kinésithérapie ou un geste complémentaire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e2138] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-cyan-300">Adresse du centre et contacts</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>📍 <strong>Lieu de consultation :</strong> 25 Avenue des Mailles, 10800 Saint-Julien-les-Villas (Troyes)</p>
              <p>🕒 <strong>Horaires :</strong> Du lundi au vendredi de 08h30 à 18h00</p>
              <p>📞 <strong>Téléphone :</strong> <a href="tel:0351532026" className="text-[#48cae4] hover:underline font-bold">03 51 53 20 26</a></p>
              <p>📅 <strong>Rendez-vous :</strong> <a href={DOCTOLIB_APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline font-semibold">Doctolib (ITID Troyes)</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#08121e] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-[#48cae4]">Questions Pratiques</span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Tout savoir sur votre consultation
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
export default ConsultationSuiviDouleurPage;
