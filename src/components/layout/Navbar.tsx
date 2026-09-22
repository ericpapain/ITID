import { useEffect } from "react";
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
  const { isAnimating, targetRoute } = useTransitionStore();

  const currentPath = isAnimating && targetRoute ? targetRoute.split("#")[0] : location.pathname;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, setMenuOpen]);

  const handleContactClick = () => {
    setMenuOpen(false);
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#contact";
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10"
        style={{
          background: "rgba(12, 26, 46, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <TransitionLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap group"
          >
            <img
              src={logo}
              alt="ITID Logo"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-contain transition-transform duration-300 group-hover:scale-105 shadow-md"
            />
            <div className="flex flex-col justify-center">
              <div
                className="text-white font-black text-xl md:text-2xl leading-none tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ITID
              </div>
              <div className="text-[#48cae4] text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase leading-none mt-1">
                France
              </div>
            </div>
          </TransitionLink>

          {/* Desktop Navigation (>= 1280px) */}
          <div className="hidden xl:flex items-center gap-5">
            <GooeyNav
              items={[
                ...NAV_LINKS.filter((l) => l.label !== "nav.news").map((l) => ({
                  id: l.label,
                  label: t(l.label),
                  href: l.href,
                })),
                {
                  id: "nav.contact",
                  label: t("contact.title", "Contactez-nous"),
                  onClick: handleContactClick,
                },
                ...NAV_LINKS.filter((l) => l.label === "nav.news").map((l) => ({
                  id: l.label,
                  label: t(l.label),
                  href: l.href,
                })),
              ]}
            />
            <LanguageSwitcher />
          </div>

          {/* Mobile & Tablet controls (< 1280px) */}
          <div className="flex xl:hidden items-center gap-3">
            <LanguageSwitcher />

            {/* Accessible Hamburger / Close Button */}
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? t("common.close", "Fermer le menu") : t("common.menu", "Ouvrir le menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-drawer"
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#48cae4]"
            >
              {menuOpen ? (
                // Close SVG Icon (X)
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger SVG Icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Backdrop & Drawer */}
      {menuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-[90] xl:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Content */}
          <div
            className="fixed top-20 md:top-24 left-0 right-0 max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)] overflow-y-auto px-6 py-6 flex flex-col gap-5 border-b border-white/10 shadow-2xl z-[95]"
            style={{
              background: "linear-gradient(180deg, rgba(12,26,46,0.99) 0%, rgba(15,32,58,0.99) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Nav Links */}
            <nav className="flex flex-col gap-1.5" aria-label="Menu principal mobile">
              {NAV_LINKS.map((l) => {
                const isActive = l.href === currentPath || (l.href === "/" && currentPath === "/" && !location.hash);
                return (
                  <TransitionLink
                    key={l.label}
                    to={l.href}
                    onClick={() => {
                      if (l.view !== "home" || l.href === "/") {
                        window.scrollTo(0, 0);
                      }
                      setMenuOpen(false);
                    }}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl font-medium text-base transition-all ${
                      isActive
                        ? "bg-[#2a9d8f]/20 text-[#48cae4] font-bold border border-[#2a9d8f]/40"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{t(l.label)}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#48cae4] shadow-[0_0_8px_#48cae4]" />
                    )}
                  </TransitionLink>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="h-px w-full bg-white/10 my-1" />

            {/* CTA Contact */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleContactClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-[#2a9d8f]/20"
              >
                <FaStethoscope className="text-sm" />
                <span>{t("contact.title", "Contactez-nous")}</span>
              </button>

              {/* Language Switcher inside Drawer for quick access */}
              <div className="flex items-center justify-between px-2 pt-2 text-sm text-white/70">
                <span>{t("common.language", "Langue / Language")}:</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
