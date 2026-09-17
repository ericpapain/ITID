import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_FAVICONS: Array<{ pattern: RegExp; emoji: string }> = [
  { pattern: /^\/traitements/, emoji: "💉" },
  { pattern: /^\/pathologies/, emoji: "🔬" },
  { pattern: /^\/ia/, emoji: "🧬" },
  { pattern: /^\/formations/, emoji: "📚" },
  { pattern: /^\/actualites/, emoji: "📻" },
  { pattern: /^\/blog/, emoji: "📻" },
  { pattern: /^\/a-propos/, emoji: "📋" },
];

export function useDynamicFavicon() {
  const location = useLocation();

  useEffect(() => {
    const updateFavicon = (emoji: string) => {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/svg+xml";
      link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
    };

    let selectedEmoji = "🏥"; // Accueil / Défaut

    if (location.hash === "#contact") {
      selectedEmoji = "☎️";
    } else {
      const match = ROUTE_FAVICONS.find((rf) => rf.pattern.test(location.pathname));
      if (match) {
        selectedEmoji = match.emoji;
      }
    }

    updateFavicon(selectedEmoji);

    // Si on est sur une page avec la section #contact, observer la visibilité
    const contactEl = document.getElementById("contact");
    if (!contactEl || location.pathname !== "/") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateFavicon("☎️");
          } else {
            updateFavicon("🏥");
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(contactEl);

    return () => {
      observer.disconnect();
    };
  }, [location.pathname, location.hash]);
}
