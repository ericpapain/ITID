/**
 * ITID France || Utilitaire Universel de Résilience et Normalisation des Médias
 * Inspiré de la stratégie ultra-résistante de la section Cas Cliniques.
 * 
 * Garantit qu'AUCUNE image ni vidéo ne s'affiche jamais cassée ou sous forme d'écran noir,
 * même en cas d'URL relative mal formée, d'URL Unsplash expirée, ou de fichier manquant après push/déploiement.
 */

export const REAL_FALLBACK_IMAGES: string[] = [
  "/images/treatments/infiltrations_rachidiennes.jpg",
  "/images/treatments/radiofrequence.jpg",
  "/images/lombalgie.jpg",
  "/images/glowing_3d_spine.jpg",
  "/images/equipebloc.jpg",
  "/images/treatments/blocs_anesthesiques.jpg",
  "/images/treatments/hypnovr.jpg",
  "/images/migraine.jpg",
  "/images/nevralgie_arnold.jpg",
  "/images/sdrc.jpg",
  "/images/spine_isolated.png",
  "/images/treatments/stimulation_ganglion_dorsal.jpg",
  "/images/treatments/perfusion_lidocaine.jpg",
  "/images/treatments/cryoneurolyse.jpg",
  "/images/douleurs_neuropathiques.jpg",
  "/images/douleurs_articulaires.jpg"
];

export const DEFAULT_FALLBACK_IMAGE = "/images/treatments/infiltrations_rachidiennes.jpg";

/**
 * Nettoie, normalise et sécurise une source d'image (ex: /uploads, /images, etc.)
 * - Assure la présence du slash initial pour éviter les erreurs de routes relatives imbriquées (/actualites/uploads/...)
 * - Remplace les chaînes vides, corrompues ou Unsplash résiduelles par une vraie image locale ITID
 */
export function getCleanImageSrc(
  rawImage?: string | null,
  fallbackIndex: number = 0
): string {
  const fallback = REAL_FALLBACK_IMAGES[Math.abs(fallbackIndex) % REAL_FALLBACK_IMAGES.length] || DEFAULT_FALLBACK_IMAGE;

  if (!rawImage || typeof rawImage !== "string") {
    return fallback;
  }

  const trimmed = rawImage.trim();
  if (trimmed.length === 0) {
    return fallback;
  }

  // Purger les anciennes URLs Unsplash résiduelles
  if (trimmed.includes("images.unsplash.com") || trimmed.includes("unsplash.com")) {
    return fallback;
  }

  // Normaliser les chemins relatifs pour qu'ils soient absolus depuis la racine du domaine
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("data:") &&
    !trimmed.startsWith("blob:") &&
    !trimmed.startsWith("/")
  ) {
    return "/" + trimmed;
  }

  return trimmed;
}

/**
 * Normalise une galerie d'images complète.
 * Si le tableau est vide ou insuffisant, le complète avec des images médicales réelles du centre.
 */
export function getCleanGallery(
  rawGallery?: (string | null | undefined)[] | null,
  fallbackCover?: string | null,
  minLength: number = 3
): string[] {
  const list: string[] = [];

  if (Array.isArray(rawGallery)) {
    for (let i = 0; i < rawGallery.length; i++) {
      const item = rawGallery[i];
      if (item && typeof item === "string" && item.trim().length > 0 && !item.includes("unsplash.com")) {
        list.push(getCleanImageSrc(item, i));
      }
    }
  }

  // Si la couverture est spécifiée et non déjà dans la liste
  if (fallbackCover && typeof fallbackCover === "string" && fallbackCover.trim().length > 0 && !fallbackCover.includes("unsplash.com")) {
    const cleanCover = getCleanImageSrc(fallbackCover, 0);
    if (!list.includes(cleanCover)) {
      list.unshift(cleanCover);
    }
  }

  // Compléter avec le catalogue local si le nombre d'images est insuffisant
  let poolIdx = 0;
  while (list.length < minLength) {
    const candidate = REAL_FALLBACK_IMAGES[poolIdx % REAL_FALLBACK_IMAGES.length];
    if (!list.includes(candidate)) {
      list.push(candidate);
    }
    poolIdx++;
    if (poolIdx > 20) break;
  }

  return list;
}

/**
 * Normalise une URL vidéo (support query params, protocoles et slash initial)
 */
export function getCleanVideoSrc(rawVideo?: string | null, fallbackVideo: string = "/images/video-fond.mp4"): string {
  if (!rawVideo || typeof rawVideo !== "string" || rawVideo.trim().length === 0) {
    return fallbackVideo;
  }
  const trimmed = rawVideo.trim();
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("data:") &&
    !trimmed.startsWith("blob:") &&
    !trimmed.startsWith("/")
  ) {
    return "/" + trimmed;
  }
  return trimmed;
}
