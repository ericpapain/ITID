import React from "react";
import { useNavigate } from "react-router-dom";

interface RichContentRendererProps {
  content?: string;
  className?: string;
}

// Simple and robust sanitizer for client-rendered HTML
function sanitizeHtml(raw: string): string {
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
  return clean;
}

export function RichContentRenderer({ content, className = "" }: RichContentRendererProps) {
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

  const safeHtml = sanitizeHtml(content);

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      className={`rich-content-container max-w-none prose prose-invert ${className}`}
    />
  );
}

export default RichContentRenderer;

