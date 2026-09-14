import logo from "../../logos/logo ITID 3.png";
import { TransitionLink } from "../ui/TransitionLink";

const FOOTER_COLUMNS = [
  {
    title: "Pathologies",
    link: "/pathologies",
    links: ["Lombalgies & sciatiques", "Douleurs neuropathiques", "SDRC / Algodystrophie", "Douleurs pelviennes", "Migraines résistantes"],
  },
  {
    title: "Traitements",
    link: "/traitements",
    links: ["Infiltrations", "Perfusions de lidocaïne", "Neuromodulation", "Cryoneurolyse", "Hypnose médicale"],
  },
  {
    title: "Cabinet",
    link: "/a-propos",
    links: [
      { label: "À propos de nous", to: "/a-propos" },
      { label: "Équipe médicale", to: "/equipe" },
      { label: "Formations vidéo", to: "/formations" },
      { label: "Mentions légales", to: "/a-propos" },
      { label: "Politique de confidentialité", to: "/a-propos" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#0f2440", color: "#8fb3d0" }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="ITID Logo" className="w-11 h-11 rounded-full object-contain" />
            <span className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }}>ITID France</span>
          </div>
          <p className="text-xs leading-relaxed mb-3">
            Institut du Traitement Interventionnel de la Douleur — Troyes, Aube.
          </p>
          <p className="text-xs" style={{ color: "#5a7a98" }}>Espace Médical de Spécialistes de Champagne</p>
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
                  {typeof l === "string" ? (
                    <TransitionLink to={col.link} className="text-xs transition-colors hover:text-white">{l}</TransitionLink>
                  ) : (
                    <TransitionLink to={l.to} className="text-xs transition-colors hover:text-white">{l.label}</TransitionLink>
                  )}
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
        <span>© 2025 ITID France — Tous droits réservés</span>
        <span style={{ color: "#5a7a98" }}>25 av. des Mailles, 10800 TROYES — 03 51 53 20 26</span>
      </div>
    </footer>
  );
}
