import { useLocation } from "react-router-dom";
import { TransitionLink } from "../ui/TransitionLink";
import { GooeyNav } from "../ui/GooeyNav";
import { NAV_LINKS } from "../../data";
import { useTransitionStore } from "../../store/transitionStore";
import { FaStethoscope } from "react-icons/fa";
import logo from "../../logos/logo ITID 3.png";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export function Navbar({ menuOpen, setMenuOpen }: NavbarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const handleContactClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#contact";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40" style={{ background: "rgba(26,58,92,0.97)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-24">
        <TransitionLink to="/" className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap group">
          <img src={logo} alt="ITID Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-full object-contain transition-transform group-hover:scale-105" />
          <div className="flex flex-col justify-center">
            <div className="text-white font-black text-xl md:text-2xl leading-none tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
              ITID
            </div>
            <div className="text-[#48cae4] text-[11px] font-bold tracking-[0.25em] uppercase leading-none mt-1">
              France
            </div>
          </div>
        </TransitionLink>

        <div className="hidden xl:flex items-center gap-5">
          <GooeyNav items={[
            ...NAV_LINKS.filter(l => l.label !== "nav.news").map(l => ({ id: l.label, label: t(l.label), href: l.href })),
            { id: "nav.contact", label: t("contact.title", "Contactez-nous"), onClick: handleContactClick },
            ...NAV_LINKS.filter(l => l.label === "nav.news").map(l => ({ id: l.label, label: t(l.label), href: l.href }))
          ]} />
          <LanguageSwitcher />
        </div>

        <div className="flex xl:hidden items-center gap-4">
          <LanguageSwitcher />
          <button className="text-white text-4xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden px-6 pb-6 pt-2 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.filter(l => l.label !== "nav.news").map((l) => {
              const { isAnimating, targetRoute } = useTransitionStore();
              const currentPath = (isAnimating && targetRoute) ? targetRoute.split('#')[0] : location.pathname;
              const isActive = l.href === currentPath || (l.href === '/' && currentPath === '/' && !location.hash);
              return (
                <TransitionLink key={l.label} to={l.href}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : ''}`}
                  style={{ color: isActive ? "#fff" : "#c8dff0" }}
                  onClick={() => {
                    if (l.view !== 'home' || l.href === '/') { window.scrollTo(0, 0); }
                    setMenuOpen(false);
                  }}>
                  {t(l.label)}
                </TransitionLink>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button onClick={handleContactClick} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold"
              style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
              <FaStethoscope className="text-xs" /> {t("contact.title", "Contactez-nous")}
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {NAV_LINKS.filter(l => l.label === "nav.news").map((l) => {
              const { isAnimating, targetRoute } = useTransitionStore();
              const currentPath = (isAnimating && targetRoute) ? targetRoute.split('#')[0] : location.pathname;
              const isActive = l.href === currentPath || (l.href === '/' && currentPath === '/' && !location.hash);
              return (
                <TransitionLink key={l.label} to={l.href}
                  className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : ''}`}
                  style={{ color: isActive ? "#fff" : "#c8dff0" }}
                  onClick={() => {
                    if (l.view !== 'home' || l.href === '/') { window.scrollTo(0, 0); }
                    setMenuOpen(false);
                  }}>
                  {t(l.label)}
                </TransitionLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
