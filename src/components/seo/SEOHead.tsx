import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: Array<{ name: string; item: string }>;
  noindex?: boolean;
}

const DEFAULT_TITLE = "ITID France — Centre du Traitement de la Douleur à Troyes (10)";
const DEFAULT_DESC = "Institut spécialisé dans l'évaluation et le traitement interventionnel guidé des douleurs chroniques et rebelles à Troyes (Aube). Consultations et prise en charge multidisciplinaire.";
const SITE_URL = "https://itid-france.com";
const DEFAULT_IMAGE = "https://itid-france.com/logo-itid.png";

export const ITID_CLINIC_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["MedicalClinic", "MedicalOrganization", "LocalBusiness"],
  "@id": "https://itid-france.com/#clinic",
  "name": "ITID France — Institut du Traitement Interventionnel de la Douleur",
  "alternateName": ["ITID Troyes", "Centre de la Douleur Troyes", "Institut de la Douleur Troyes"],
  "url": "https://itid-france.com",
  "logo": "https://itid-france.com/logo-itid.png",
  "image": "https://itid-france.com/images/equipebloc.jpg",
  "description": "Centre médical pluridisciplinaire d'excellence spécialisé dans l'évaluation, le diagnostic de précision et les thérapeutiques interventionnelles guidées par imagerie des douleurs chroniques et rebelles à Troyes et dans l'Aube.",
  "telephone": "+33351532026",
  "email": "contact@itid-france.com",
  "priceRange": "$$",
  "medicalSpecialty": [
    "https://schema.org/Anesthesia",
    "PainManagement"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "25 Avenue des Mailles, Espace Médical de Spécialistes de Champagne",
    "addressLocality": "Saint-Julien-les-Villas",
    "addressRegion": "Aube",
    "postalCode": "10800",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 48.2718,
    "longitude": 4.0932
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:30",
      "closes": "18:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "Troyes" },
    { "@type": "AdministrativeArea", "name": "Aube" },
    { "@type": "AdministrativeArea", "name": "Grand Est" },
    { "@type": "City", "name": "Sainte-Savine" },
    { "@type": "City", "name": "Saint-André-les-Vergers" },
    { "@type": "City", "name": "Saint-Julien-les-Villas" },
    { "@type": "City", "name": "Sens" }
  ],
  "hasMap": "https://maps.google.com/?q=25+Avenue+des+Mailles,+10800+Saint-Julien-les-Villas",
  "sameAs": [
    "https://www.doctolib.fr/centre-de-la-douleur/troyes/itid",
    "https://www.elsan.care/fr/clinique-paul-picquet"
  ],
  "availableService": [
    {
      "@type": "MedicalTherapy",
      "name": "Infiltrations Rachidiennes et Articulaires Guidées",
      "description": "Infiltrations épidurales, foraminales et articulaires sous contrôle radiologique ou échographique millimétrique."
    },
    {
      "@type": "MedicalTherapy",
      "name": "Radiofréquence et Thermocoagulation",
      "description": "Dénervation par radiofréquence thermique ou pulsée pour soulagement durable des douleurs rachidiennes et articulaires."
    },
    {
      "@type": "MedicalTherapy",
      "name": "Cryoneurolyse",
      "description": "Technique innovante d'analgésie par le froid sur les nerfs périphériques."
    },
    {
      "@type": "MedicalTherapy",
      "name": "Stimulation Magnétique Transcrânienne (rTMS) et Neuromodulation",
      "description": "Neuromodulation non invasive pour douleurs neuropathiques chroniques et fibromyalgie."
    },
    {
      "@type": "MedicalTherapy",
      "name": "Perfusion de Lidocaïne et Blocs Nerveux",
      "description": "Protocoles de rupture de chronicisation sous surveillance médicale continue."
    }
  ]
};

/**
 * Composant headless de gestion complète du SEO :
 * - document.title
 * - meta description
 * - link canonical
 * - Open Graph & Twitter Cards
 * - Schema.org JSON-LD (MedicalClinic, Breadcrumbs, FAQ, etc.)
 */
export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
  breadcrumbs,
  noindex = false,
}: SEOHeadProps) {
  const location = useLocation();

  const finalTitle = title ? `${title} | ITID France` : DEFAULT_TITLE;
  const finalDesc = description || DEFAULT_DESC;
  const finalCanonical = canonical || `${SITE_URL}${location.pathname === "/" ? "" : location.pathname}`;
  const finalImage = ogImage ? (ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`) : DEFAULT_IMAGE;

  useEffect(() => {
    // 1. Titre du document
    document.title = finalTitle;

    // 2. Balises meta courantes
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", name);
        } else {
          el.setAttribute("name", name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", finalDesc);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");

    // Open Graph
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDesc, true);
    setMeta("og:url", finalCanonical, true);
    setMeta("og:image", finalImage, true);
    setMeta("og:type", ogType, true);
    setMeta("og:locale", "fr_FR", true);
    setMeta("og:site_name", "ITID France — Centre de Traitement de la Douleur", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDesc);
    setMeta("twitter:image", finalImage);

    if (publishedTime) setMeta("article:published_time", publishedTime, true);
    if (modifiedTime) setMeta("article:modified_time", modifiedTime, true);
    if (author) setMeta("article:author", author, true);

    // 3. Balise Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", finalCanonical);

    // 4. Données structurées JSON-LD
    const scriptId = "itid-dynamic-jsonld";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const schemas: Array<Record<string, any>> = [];

    // Schéma principal de la clinique sur toutes les pages
    schemas.push(ITID_CLINIC_SCHEMA);

    // Fil d'Ariane
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": SITE_URL
          },
          ...breadcrumbs.map((b, idx) => ({
            "@type": "ListItem",
            "position": idx + 2,
            "name": b.name,
            "item": b.item.startsWith("http") ? b.item : `${SITE_URL}${b.item}`
          }))
        ]
      });
    }

    // Schémas personnalisés supplémentaires
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd);
      } else {
        schemas.push(jsonLd);
      }
    }

    scriptEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schemas
    });

  }, [finalTitle, finalDesc, finalCanonical, finalImage, ogType, publishedTime, modifiedTime, author, jsonLd, breadcrumbs, noindex]);

  return null;
}
export default SEOHead;
