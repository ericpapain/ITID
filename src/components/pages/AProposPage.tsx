import { Link } from "react-router-dom";
import { ShimmerButton } from "../ui/ShimmerButton";
import { Carousel } from "../ui/Carousel";
import { FlickeringGrid } from "../animations/FlickeringGrid";
import { CardFlip } from "../ui/CardFlip";
import { VISITE_SLIDES } from "../../constants/carousel";
import { useTranslation } from "react-i18next";

export function AProposPage() {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden" style={{ background: "var(--background)" }}>
      <FlickeringGrid colors={["#2a9d8f", "#1a3a5c"]} maxOpacity={0.3} squareSize={4} gridGap={8} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(42,157,143,0.08),transparent_70%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <ShimmerButton
          as="Link"
          to="/"
          className="mb-8"
        >
          ← {t('common.backHome')}
        </ShimmerButton>

        <div className="mb-16">

          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t('about.title')}</h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "#6b7c93" }}>
            {t('about.desc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white card-hover-highlight">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-6" style={{ background: "#f0f7f6" }}>🩺</div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t('about.services.title')}</h3>
            <ul className="space-y-4 text-sm" style={{ color: "#4a5568" }}>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.consultations')}</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.treatments')}</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.pathway')}</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.psychology')}</li>
              <li className="flex items-start gap-3 font-semibold text-[#1a3a5c]"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.elearning')}</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.ai')}</li>
              <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> {t('about.services.3d')}</li>
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
                      {t('about.info.clickMap')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t('about.info.title')}</h3>
                  <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#4a5568" }}>
                    <p><strong>{t('about.info.addressTitle')}</strong><br />25 avenue des Mailles<br />Saint-Julien-les-Villas — 10800 TROYES<br />Espace Médical de Spécialistes de Champagne</p>
                    <p><strong>{t('about.info.hoursTitle')}</strong><br />Lundi au Vendredi : 08h30 - 18h30<br />Fermé le week-end</p>
                    <p><strong>{t('about.info.contactTitle')}</strong><br />Tél : 03 51 53 20 26</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-4">
                  {t('about.info.mapHint')}
                </div>
              </div>
            }
            back={
              <div className="p-4 rounded-3xl border border-gray-100 shadow-lg bg-white h-full flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm font-bold text-[#1a3a5c]">{t('about.info.mapTitle')}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
                    ← {t('common.backInfo')}
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
                  {t('about.info.mapAddress')}
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* GALERIE ITID - FULL WIDTH */}
      <div className="mb-20 w-full px-4 md:px-8">
        <div className="max-w-5xl mx-auto mb-10">

          <h3 className="text-3xl font-bold text-center" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t('about.info.visit')}</h3>
        </div>

        <div className="w-full">
          <Carousel slides={VISITE_SLIDES.map(slide => ({
            ...slide,
            kicker: t(`carousel.${slide.id}.kicker`),
            title: t(`carousel.${slide.id}.title`),
            description: t(`carousel.${slide.id}.description`),
          }))} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="p-10 md:p-12 rounded-3xl text-center relative overflow-hidden" style={{ background: "#1a3a5c" }}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>{t('about.newsletter.title')}</h3>
            <p className="text-sm mb-8" style={{ color: "#8fb3d0" }}>{t('about.newsletter.desc')}</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert(t('about.newsletter.success')); }}>
              <input type="email" placeholder={t('about.newsletter.placeholder')} required className="flex-1 px-5 py-3 rounded-xl outline-none border-2 border-transparent focus:border-[#2a9d8f] transition-all bg-white text-sm" style={{ color: "#1a3a5c" }} />
              <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ background: "#2a9d8f" }}>{t('buttons.signup')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
