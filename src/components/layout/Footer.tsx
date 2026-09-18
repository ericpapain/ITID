import logo from "../../logos/logo ITID 3.png";
import { TransitionLink } from "../ui/TransitionLink";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  const FOOTER_COLUMNS = [
    {
      title: t("footer.col1.title"),
      link: "/pathologies",
      links: [t("footer.col1.l1"), t("footer.col1.l2"), t("footer.col1.l3"), t("footer.col1.l4"), t("footer.col1.l5")],
    },
    {
      title: t("footer.col2.title"),
      link: "/traitements",
      links: [t("footer.col2.l1"), t("footer.col2.l2"), t("footer.col2.l3"), t("footer.col2.l4"), t("footer.col2.l5")],
    },
    {
      title: t("footer.col3.title"),
      link: "/a-propos",
      links: [
        { label: t("footer.col3.l1"), to: "/a-propos" },
        // { label: t("footer.col3.l2"), to: "/equipe" },
        { label: t("footer.col3.l3"), to: "/formations" },
        { label: t("footer.col3.l4"), to: "/actualites" },
        { label: t("footer.col3.l5"), to: "/a-propos" },
        { label: t("footer.col3.l6"), to: "/a-propos" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#0f2440", color: "#8fb3d0" }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img src={logo} alt="ITID Logo" loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-contain" />
            <div className="flex flex-col justify-center">
              <span className="text-white font-bold text-base leading-none tracking-wider" style={{ fontFamily: "var(--font-display)" }}>ITID</span>
              <span className="text-[#48cae4] text-[9px] font-bold tracking-[0.2em] uppercase leading-none mt-0.5">France</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-3">
            {t("footer.info.desc1")}
          </p>
          <p className="text-xs" style={{ color: "#5a7a98" }}>{t("footer.info.desc2")}</p>
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
        <span>{t("footer.info.rights")}</span>
        <span style={{ color: "#5a7a98" }}>{t("footer.info.address")}</span>
      </div>
    </footer>
  );
}
