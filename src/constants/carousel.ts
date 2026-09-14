// ─────────────────────────────────────────────
// Constantes du carrousel de visite ITID
// ─────────────────────────────────────────────

import type { CarouselSlide } from "../components/ui/Carousel";

export const VISITE_SLIDES: CarouselSlide[] = [
  {
    id: "accueil",
    index: "01",
    kicker: "Accueil",
    title: "Espace apaisant",
    description: "Dès votre arrivée, notre équipe vous accueille dans un environnement conçu pour réduire l'anxiété.",
    background: "linear-gradient(160deg, #0f2440 0%, #1a3a5c 100%)",
    accent: "#2a9d8f",
    image: "/image_itid/img.jpg"
  },
  {
    id: "salle",
    index: "02",
    kicker: "Consultation",
    title: "Salles modernes",
    description: "Des espaces de consultation équipés pour un diagnostic précis et une prise en charge optimale.",
    background: "linear-gradient(160deg, #1a3a5c 0%, #0f2440 100%)",
    accent: "#48d1c2",
    image: "/image_itid/rf.jpg"
  },
  {
    id: "itid1",
    index: "03",
    kicker: "Interventionnel",
    title: "Plateau technique",
    description: "Des équipements de pointe pour réaliser des infiltrations et interventions guidées par imagerie.",
    background: "linear-gradient(160deg, #0f2440 0%, #0a1628 100%)",
    accent: "#2a9d8f",
    image: "/image_itid/imo.webp"
  },
  {
    id: "ext",
    index: "04",
    kicker: "Environnement",
    title: "Cadre verdoyant",
    description: "Le centre est entouré d'espaces verts pour favoriser la sérénité et le calme des patients.",
    background: "linear-gradient(160deg, #1a3a5c 0%, #0a1628 100%)",
    accent: "#48d1c2",
    image: "/image_itid/rrty.webp"
  }
];

// Images de la galerie ITID (utilisées dans la lightbox)
export const ITID_IMAGES: string[] = [
  "img.jpg",
  "rf.jpg",
  "imo.webp",
  "rrty.webp",
];
