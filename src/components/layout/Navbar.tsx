import { useLocation } from "react-router-dom";
import { TransitionLink } from "../ui/TransitionLink";
import { GooeyNav } from "../ui/GooeyNav";
import { NAV_LINKS } from "../../data";
import { useTransitionStore } from "../../store/transitionStore";
import { FaStethoscope } from "react-icons/fa";
import logo from "../../logos/logo ITID 3.png";

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export function Navbar({ menuOpen, setMenuOpen }: NavbarProps) {
  const location = useLocation();

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
        <TransitionLink to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="ITID Logo" className="w-16 h-16 rounded-full object-contain" />
          <div>
            <div className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>ITID France</div>
          </div>
        </TransitionLink>

        <div className="hidden xl:flex items-center">
          <GooeyNav items={[
            ...NAV_LINKS.map(l => ({ label: l.label, href: l.href })),
            { label: "Contactez-nous", onClick: handleContactClick }
          ]} />
        </div>

        <button className="lg:hidden text-white text-4xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden px-6 pb-6 pt-2 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((l) => {
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
                  {l.label}
                </TransitionLink>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button onClick={handleContactClick} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold"
              style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
              <FaStethoscope className="text-xs" /> Contactez-nous
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
