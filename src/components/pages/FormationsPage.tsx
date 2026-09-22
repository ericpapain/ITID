import React, { useState } from "react";
import { ShimmerButton } from "../ui/ShimmerButton";
import { AnimatedGridPattern } from "../animations/AnimatedGridPattern";
import { GlowOrbs } from "../animations/GlowOrbs";
import { useTranslation } from "react-i18next";
import { Bell, Award, Clock } from "lucide-react";

interface FormationsPageProps {
  isAuthenticated?: boolean;
  setShowAuthModal?: (v: boolean) => void;
  cart?: any[];
  setCart?: (v: any[]) => void;
  setShowCartModal?: (v: boolean) => void;
  purchasedFormations?: any[];
}

export function FormationsPage({}: FormationsPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "formations" }),
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Réponse inattendue du serveur.");
      }
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowOrbs>
      <div className="pt-28 pb-20 min-h-screen relative overflow-hidden bg-[#071322] text-white">
        <AnimatedGridPattern cols={24} rows={14} litCount={24} />

        {/* Lueur d'ambiance centrale */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#2a9d8f]/15 rounded-full blur-[150px]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header Bar : Bouton Retour */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <ShimmerButton as="Link" to="/">
              ← {t("common.backHome", "Retour à l'accueil")}
            </ShimmerButton>

            {/* Badge Teaser En-tête */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-[#48cae4] shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#48cae4] animate-ping" />
              {t("formationsPage.teaserBadge", "ITID Academy • En cours de création")}
            </div>
          </div>

          {/* Bannière Principale "Arrive Bientôt" */}
          <div className="text-center max-w-3xl mx-auto mt-4 mb-16">
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("formationsPage.titleMain", "L'Académie de Formation")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] via-[#48d1c2] to-slate-400">
                {t("formationsPage.titleHighlight", "Arrive Très Bientôt")}
              </span>
            </h1>

            <p className="text-base sm:text-[18px] md:text-[20px] text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t(
                "formationsPage.description",
                "Nos médecins et spécialistes ITID finalisent actuellement un cursus complet de masterclasses médicales, vidéos d'interventions guidées et cas cliniques immersifs."
              )}
            </p>

            {/* Boîte d'inscription / Alerte lancement */}
            <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] max-w-xl mx-auto">
              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("formationsPage.emailPlaceholder", "Votre adresse email professionnelle")}
                    className="flex-1 px-5 py-3.5 rounded-full bg-slate-800/90 border border-slate-600/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#48d1c2] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-full bg-[#2a9d8f] hover:bg-[#258b7f] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(42,157,143,0.4)] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {t("formationsPage.notifyMe", "M'avertir du lancement")}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-3 text-[#48d1c2] text-base sm:text-[18px] font-semibold py-2">
                  <span className="text-2xl">✨</span>
                  <span>
                    {t(
                      "formationsPage.successMessage",
                      "Merci ! Vous serez informé(e) en avant-première dès l'ouverture de l'Académie."
                    )}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-[13px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2a9d8f]" />{" "}
                  {t("formationsPage.openingDate", "Ouverture prévue fin 2026")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#2a9d8f]" />{" "}
                  {t("formationsPage.clinicalCert", "Certifications cliniques")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className="text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/80 via-slate-800/50 to-slate-900/80 border border-slate-800">
            <h3 className="text-lg sm:text-[20px] font-bold text-white mb-2">
              {t("formationsPage.contributeTitle", "Vous êtes médecin ou intervenant et souhaitez contribuer ?")}
            </h3>
            <p className="text-sm sm:text-[16px] text-slate-400 max-w-xl mx-auto mb-4">
              {t(
                "formationsPage.contributeDesc",
                "L'ITID collabore activement avec les praticiens algologues, chirurgiens et chercheurs pour enrichir ses modules pédagogiques."
              )}
            </p>
            <ShimmerButton as="Link" to="/#contact" className="text-[14px] px-6 py-3">
              {t("formationsPage.contactPole", "Contacter le pôle formation")}
            </ShimmerButton>
          </div>
        </div>
      </div>
    </GlowOrbs>
  );
}
