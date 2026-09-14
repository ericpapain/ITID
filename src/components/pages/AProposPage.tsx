import { Link } from "react-router-dom";
import { Carousel } from "../ui/Carousel";
import { FlickeringGrid } from "../animations/FlickeringGrid";
import { CardFlip } from "../ui/CardFlip";
import { VISITE_SLIDES } from "../../constants/carousel";

export function AProposPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden" style={{ background: "var(--background)" }}>
      <FlickeringGrid colors={["#2a9d8f", "#1a3a5c"]} maxOpacity={0.3} squareSize={4} gridGap={8} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(42,157,143,0.08),transparent_70%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}>
          ←  Retour à l'accueil
        </Link>

        <div className="mb-16">
          <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Notre Philosophie</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>À propos de l'ITID</h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#6b7c93" }}>
            L'Institut du Traitement Interventionnel de la Douleur (ITID) se consacre à l'amélioration de la qualité de vie des patients souffrant de douleurs chroniques grâce à des approches médicales innovantes, technologiques et humaines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white card-hover-highlight">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-6" style={{ background: "#f0f7f6" }}>🩺</div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Services Proposés</h3>
            <ul className="space-y-4 text-sm" style={{ color: "#4a5568" }}>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Consultations pluridisciplinaires (Algologues, Neurologues, Psychiatres)</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Traitements interventionnels sous imagerie (Infiltrations, Cryoneurolyse...)</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Parcours de soins personnalisés et suivi global</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Accompagnement psychologique et sophrologie</li>
              <li className="flex items-start gap-3 font-semibold text-[#1a3a5c]"><span className="text-[#2a9d8f] mt-1">✔</span> Formations en ligne (E-learning) pour professionnels et patients</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Assistant IA médical interactif disponible 24/7</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Modélisation anatomique 3D pour l'évaluation des douleurs</li>
            </ul>
          </div>

          <CardFlip
            className="h-full min-h-[420px]"
            front={
              <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white h-full flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#f0f7f6" }}>📍</div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center gap-1 group-hover:bg-[#2a9d8f] group-hover:text-white transition-all">
                      Cliquer pour voir la carte 🗺️
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Informations Utiles</h3>
                  <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#4a5568" }}>
                    <p><strong>Adresse :</strong><br />25 avenue des Mailles<br />Saint-Julien-les-Villas — 10800 TROYES<br />Espace Médical de Spécialistes de Champagne</p>
                    <p><strong>Heures d'ouverture :</strong><br />Lundi au Vendredi : 08h30 - 18h30<br />Fermé le week-end</p>
                    <p><strong>Contact :</strong><br />Tél : 03 51 53 20 26</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-4">
                  💡 Cliquez sur la carte pour afficher la carte interactive
                </div>
              </div>
            }
            back={
              <div className="p-4 rounded-3xl border border-gray-100 shadow-lg bg-white h-full flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm font-bold text-[#1a3a5c]">Localisation ITID — Troyes</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                    ← Retour aux infos
                  </span>
                </div>
                <div className="w-full flex-1 rounded-2xl overflow-hidden border border-gray-200 min-h-[280px]">
                  <iframe
                    title="Google Maps ITID Troyes"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "280px" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=25%20avenue%20des%20Mailles%20Saint-Julien-les-Villas%2010800%20TROYES&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  />
                </div>
                <div className="mt-2 text-center text-[11px] text-gray-500 font-medium">
                  25 avenue des Mailles, 10800 Saint-Julien-les-Villas (Troyes)
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* GALERIE ITID - FULL WIDTH */}
      <div className="mb-20 w-full px-4 md:px-8">
        <div className="max-w-5xl mx-auto mb-10">
          <div className="text-sm font-medium uppercase tracking-widest mb-3 text-center" style={{ color: "#2a9d8f" }}>En images</div>
          <h3 className="text-3xl font-bold text-center" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Visitez l'ITID</h3>
        </div>

        <div className="w-full">
          <Carousel slides={VISITE_SLIDES} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="p-10 md:p-12 rounded-3xl text-center relative overflow-hidden" style={{ background: "#1a3a5c" }}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Rejoignez notre Newsletter</h3>
            <p className="text-sm mb-8" style={{ color: "#8fb3d0" }}>Recevez nos dernières actualités médicales, conseils santé et informations sur les avancées de nos traitements.</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Merci pour votre inscription !"); }}>
              <input type="email" placeholder="Votre adresse e-mail" required className="flex-1 px-5 py-3 rounded-xl outline-none border-2 border-transparent focus:border-[#2a9d8f] transition-all bg-white text-sm" style={{ color: "#1a3a5c" }} />
              <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ background: "#2a9d8f" }}>S'inscrire</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
