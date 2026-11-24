import React from "react";
import { useNavigate } from "react-router-dom";

interface RichContentRendererProps {
  content?: string;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

// Simple and robust sanitizer & responsive table wrapper for client-rendered HTML
function processAndSanitizeHtml(raw: string): string {
  if (!raw) return "";
  let clean = raw;
  // Remove script tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove dangerous inline event handlers (onload, onclick, onerror, etc.)
  clean = clean.replace(/\son\w+="[^"]*"/gi, "");
  clean = clean.replace(/\son\w+='[^']*'/gi, "");
  clean = clean.replace(/\son\w+=[^\s>]+/gi, "");
  // Remove javascript: hrefs
  clean = clean.replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');

  // Envelopper systématiquement les tableaux HTML non encore enveloppés
  // 1. Si déjà enveloppé, s'assurer que l'indicateur de défilement mobile est présent
  clean = clean.replace(
    /<div[^>]*class="[^"]*table-responsive-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (match, innerContent) => {
      if (innerContent.includes("mobile-table-hint")) {
        return match;
      }
      return `<div class="table-responsive-wrapper my-4"><div class="mobile-table-hint sm:hidden"><span>↔ Faites glisser le tableau pour tout lire</span></div>${innerContent}</div>`;
    }
  );

  // 2. Envelopper tout tableau nu (<table>) pour qu'il ne déborde JAMAIS sur mobile
  clean = clean.replace(
    /(<div[^>]*class="[^"]*table-responsive-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>)|(<table\b[^>]*>[\s\S]*?<\/table>)/gi,
    (fullMatch, alreadyWrapped, bareTable) => {
      if (alreadyWrapped) return alreadyWrapped;
      if (bareTable) {
        return `<div class="table-responsive-wrapper my-4"><div class="mobile-table-hint sm:hidden"><span>↔ Faites glisser le tableau pour tout lire</span></div>${bareTable}</div>`;
      }
      return fullMatch;
    }
  );

  return clean;
}

export function RichContentRenderer({ content, className = "", theme = "auto" }: RichContentRendererProps) {
  const navigate = useNavigate();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return null;
  }

  // Intercept clicks on links for smooth client-side React Router navigation
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    const isInternal =
      anchor.getAttribute("data-internal") === "true" ||
      (href && (href.startsWith("/") || href.startsWith("#") || href.includes(window.location.host)));

    if (isInternal && href && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#")) {
      e.preventDefault();
      // If it's a full URL to the same host, take pathname
      try {
        const url = new URL(href, window.location.origin);
        navigate(url.pathname + url.search + url.hash);
      } catch {
        navigate(href);
      }
    }
  };

  const safeHtml = processAndSanitizeHtml(content);

  // Déterminer intelligemment le thème pour ne jamais forcer prose-invert (dark) sur fond blanc
  const isLight = theme === "light" || className.includes("rich-content-light") || className.includes("light");
  const proseThemeClass = isLight ? "prose prose-slate text-slate-700" : "prose prose-invert text-slate-200";

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      className={`rich-content-container max-w-none break-words ${proseThemeClass} ${className}`}
    />
  );
}

export default RichContentRenderer;

