// ======================================================================
// ITID France — Utilitaires Détection & Format Médias (Image, Vidéo, YouTube)
// ======================================================================

export interface HeroMediaItem {
  id: string;
  type: "image" | "video" | "youtube";
  url: string;
  title?: string;
  duration?: number; // Durée en secondes (ex: 6s pour les images)
}

/**
 * Extrait l'identifiant d'une vidéo YouTube depuis n'importe quel format de lien :
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match && match[1] && match[1].length === 11 ? match[1] : null;
}

/**
 * Détecte automatiquement si l'URL est une vidéo YouTube, un fichier vidéo (mp4, webm, mov...) ou une image
 */
export function detectMediaType(url: string): "youtube" | "video" | "image" {
  if (!url || typeof url !== "string") return "image";
  if (extractYouTubeId(url)) return "youtube";

  const clean = url.split("?")[0].toLowerCase();
  if (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".m4v") ||
    clean.includes("/video-") ||
    clean.includes("video")
  ) {
    return "video";
  }

  return "image";
}

/**
 * Génère l'URL d'intégration sécurisée sans cookies pour YouTube en arrière-plan
 */
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1`;
}

/**
 * Récupère l'image miniature d'une vidéo YouTube
 */
export function getYouTubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}
