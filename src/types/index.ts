// ─────────────────────────────────────────────
// Types partagés de l'application ITID
// ─────────────────────────────────────────────

export interface Message {
  role: "user" | "bot";
  text: string;
}
