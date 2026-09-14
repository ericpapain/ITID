// ─────────────────────────────────────────────
// Constantes et logique du chatbot ITID
// ─────────────────────────────────────────────

export const BOT_RESPONSES: Record<string, string> = {
  default:
    "Bonjour, je suis l'assistant IA de l'ITID. Je peux vous orienter vers nos soins, nos formations ou vous aider à prendre rendez-vous sur Doctolib. Comment puis-je vous aider ?",
  douleur:
    "L'ITID prend en charge les douleurs chroniques et aiguës : lombalgies, neuropathies, SDRC, migraines résistantes, douleurs pelviennes. Pour évaluer votre situation, une consultation d'évaluation avec un algologue est la première étape.",
  rdv: "La prise de rendez-vous se fait via Doctolib. Vous pouvez également appeler le 03 51 53 20 26 du lundi au vendredi de 8h30 à 18h00. Le cabinet est situé au 25 avenue des Mailles, Saint-Julien-les-Villas, 10800 TROYES.",
  formation:
    "Nous proposons 3 formations vidéo : pour les professionnels de santé (290 €), le grand public (89 €) et les paramédicaux (149 €). Accès à vie et certificat inclus.",
  itid: "L'ITID (Institut du Traitement Interventionnel de la Douleur) est situé à Troyes, dans l'Espace Médical de Spécialistes de Champagne. Nous proposons des soins interventionnels de pointe pour toutes les formes de douleurs chroniques.",
};

export function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("douleur") || lower.includes("mal") || lower.includes("souffr") || lower.includes("sciatique"))
    return BOT_RESPONSES.douleur;
  if (lower.includes("rdv") || lower.includes("rendez") || lower.includes("doctolib") || lower.includes("appel") || lower.includes("téléphone"))
    return BOT_RESPONSES.rdv;
  if (lower.includes("formation") || lower.includes("video") || lower.includes("cours"))
    return BOT_RESPONSES.formation;
  if (lower.includes("itid") || lower.includes("institut") || lower.includes("troyes") || lower.includes("adresse"))
    return BOT_RESPONSES.itid;
  return BOT_RESPONSES.default;
}
