import logo from "../../logos/logo ITID 3.png";
import { TransitionLink } from "../ui/TransitionLink";
import { useTranslation } from "react-i18next";
import { DOCTOLIB_APPOINTMENT_URL } from "../../constants/links";

export function Footer() {
  const { t } = useTranslation();

  const FOOTER_COLUMNS = [
    {
      title: t("footer.col1.title", "Pathologies"),
      link: "/pathologies",
      links: [
        { label: "Lombalgies & Sciatiques", to: "/pathologies/lombalgie-chronique" },
        { label: "Névralgie d'Arnold", to: "/pathologies/nevralgie-arnold" },
        { label: "Douleurs Neuropathiques", to: "/pathologies/douleurs-neuropathiques" },
        { label: "SDRC (Algodystrophie)", to: "/pathologies/sdrc" },
        { label: "Toutes les pathologies", to: "/pathologies" },
      ],
    },
    {
      title: t("footer.col2.title", "Traitements"),
      link: "/traitements",
      links: [
        { label: "Infiltrations Rachidiennes", to: "/traitements/infiltrations-rachidiennes" },
        { label: "Radiofréquence", to: "/traitements/radiofrequence" },
        { label: "Cryoneurolyse", to: "/traitements/cryoneurolyse" },
        { label: "Stimulation rTMS", to: "/traitements/rtms" },
        { label: "Tous nos traitements", to: "/traitements" },
      ],
    },
    {
      title: "Centre & Consultations",
      link: "/centre-douleur-troyes",
      links: [
        { label: "Centre de la Douleur à Troyes", to: "/centre-douleur-troyes" },
        { label: "Prise en charge de la douleur", to: "/prise-en-charge-douleur-chronique" },
        { label: "Consultation & Suivi", to: "/consultation-suivi-douleur" },
        { label: "À Propos & Équipe", to: "/a-propos" },
        { label: "Actualités & Conseils", to: "/actualites" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#0f2440", color: "#8fb3d0" }} className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={logo}
              alt="Logo ITID France - Institut du Traitement Interventionnel de la Douleur à Troyes"
              loading="lazy"
              decoding="async"
              className="w-11 h-11 rounded-full object-contain"
            />
            <div className="flex flex-col justify-center">
              <span className="text-white font-bold text-base leading-none tracking-wider" style={{ fontFamily: "var(--font-display)" }}>ITID</span>
              <span className="text-[#48cae4] text-[9px] font-bold tracking-[0.2em] uppercase leading-none mt-0.5">France</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-3">
            {t("footer.info.desc1", "Institut spécialisé dans l'évaluation et le traitement interventionnel de la douleur chronique à Troyes et dans l'Aube.")}
          </p>
          <p className="text-xs mb-4" style={{ color: "#5a7a98" }}>
            25 Avenue des Mailles, 10800 Saint-Julien-les-Villas (Troyes)
          </p>
          <a
            href={DOCTOLIB_APPOINTMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a9d8f] hover:bg-[#48cae4] text-[#0c1a2e] text-xs font-bold transition-colors"
          >
            <span>Rendez-vous Doctolib</span>
            <span>→</span>
          </a>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <TransitionLink
              to={col.link}
              className="block text-white text-sm font-semibold mb-3 hover:text-[#2a9d8f] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {col.title}
            </TransitionLink>
            <ul className="space-y-2">
              {col.links.map((l, idx) => (
                <li key={idx}>
                  <TransitionLink to={l.to} className="text-xs transition-colors hover:text-white">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span>{t("footer.info.rights", "© 2026 ITID France • Tous droits réservés")}</span>
        <span style={{ color: "#5a7a98" }}>
          Centre Médical de la Douleur — 25 av. des Mailles, 10800 Troyes / Saint-Julien-les-Villas • 03 51 53 20 26
        </span>
      </div>
    </footer>
  );
}
export default Footer;
