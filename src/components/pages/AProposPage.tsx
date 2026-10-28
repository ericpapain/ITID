import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShimmerButton } from "../ui/ShimmerButton";
import { Carousel } from "../ui/Carousel";
import { FlickeringGrid } from "../animations/FlickeringGrid";
import { CardFlip } from "../ui/CardFlip";
import { VISITE_SLIDES } from "../../constants/carousel";
import { useTranslation } from "react-i18next";

export function AProposPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchAboutContent() {
      try {
        const res = await fetch("/api/cms/pages?page=about");
        if (res.ok) {
          const data = await res.json();
          const content = lang === "en" ? data.content_en : data.content_fr;
          if (content?.visiteSlides && Array.isArray(content.visiteSlides) && content.visiteSlides.length > 0) {
            setDynamicSlides(content.visiteSlides);
          }
        }
      } catch {}
    }
    fetchAboutContent();
  }, [lang]);

  const locations = [
    {
      name: "ITID-France (Troyes)",
      address: "25 Avenue des Mailles\n10800 Saint-Julien-les-Villas",
      embed: "https://maps.google.com/maps?q=25%20Avenue%20des%20Mailles,+10800+Saint-Julien-les-Villas&t=&z=15&ie=UTF8&iwloc=&output=embed",
      link: "https://maps.google.com/?q=25+Avenue+des+Mailles,+10800+Saint-Julien-les-Villas"
    },
    {
      name: "Polyclinique Montier la Celle",
      address: "17 Rue Charles Baltet\n10120 Saint-André-les-Vergers",
      embed: "https://maps.google.com/maps?q=17%20Rue%20Charles%20Baltet,+10120+Saint-André-les-Vergers&t=&z=15&ie=UTF8&iwloc=&output=embed",
      link: "https://maps.google.com/?q=17+Rue+Charles+Baltet,+10120+Saint-André-les-Vergers"
    },
    {
      name: "Clinique Paul Picquet",
      address: "12 Rue Pierre Castets\n89100 Sens",
      embed: "https://maps.google.com/maps?q=12%20Rue%20Pierre%20Castets,+89100+Sens&t=&z=15&ie=UTF8&iwloc=&output=embed",
      link: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x47ef1aa6e14374df:0x3eabf289bc82f0ab?sa=X&ved=1t:8290&ictx=111"
    }
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail || nlLoading) return;

    setNlLoading(true);
    setNlError(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail, source: "a-propos" }),
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Réponse inattendue du serveur.");
      }
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue.");
      }
      setNlSuccess(true);
      setNlEmail("");
    } catch (err: any) {
      setNlError(err.message || "Erreur de connexion. Veuillez réessayer.");
    } finally {
      setNlLoading(false);
    }
  };

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
                      Cliquer sur une adresse pour la carte 🗺️
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t('about.info.title')}</h3>
                  
                  <div className="space-y-4">
                    {locations.map((loc, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 -mx-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors"
                        onClick={() => setSelectedMapIndex(idx)}
                      >
                        <div className="text-sm font-bold" style={{ color: "#1a3a5c" }}>{loc.name}</div>
                        <div className="text-xs mt-1 whitespace-pre-line" style={{ color: "#4a5568" }}>{loc.address}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-4">
                  💡 Cliquez sur une adresse pour afficher sa carte interactive
                </div>
              </div>
            }
            back={
              <div className="p-4 rounded-3xl border border-gray-100 shadow-lg bg-white h-full flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm font-bold text-[#1a3a5c] truncate max-w-[180px]">{locations[selectedMapIndex].name}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
                    ← {t('common.backInfo')}
                  </span>
                </div>
                
                <a 
                  href={locations[selectedMapIndex].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex-1 rounded-2xl overflow-hidden border border-gray-200 min-h-[280px] block relative group/map"
                  onClick={(e) => e.stopPropagation()}
                >
                  <iframe
                    title={`Google Maps ${locations[selectedMapIndex].name}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "280px", pointerEvents: "none" }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={locations[selectedMapIndex].embed}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/map:bg-black/10 transition-colors flex items-center justify-center">
                     <span className="opacity-0 group-hover/map:opacity-100 bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-opacity text-[#1a3a5c] transform scale-95 group-hover/map:scale-100 duration-200">
                       Ouvrir dans Google Maps ↗
                     </span>
                  </div>
                </a>

                <div className="mt-2 text-center text-[11px] text-gray-500 font-medium whitespace-pre-line">
                  {locations[selectedMapIndex].address.replace('\n', ', ')}
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
          <Carousel slides={
            dynamicSlides && dynamicSlides.length > 0
              ? dynamicSlides.map((slide, idx) => ({
                  ...slide,
                  id: slide.id || `slide-${idx}`,
                  index: slide.index || String(idx + 1).padStart(2, "0"),
                  kicker: slide.kicker || "Lieu ITID",
                  title: slide.title || "Espace du Centre",
                  description: slide.description || "",
                  image: slide.image || VISITE_SLIDES[idx % VISITE_SLIDES.length]?.image || "/image_itid/img.jpg",
                  accent: slide.accent || (idx % 2 === 0 ? "#2a9d8f" : "#48d1c2"),
                  background: slide.background || "linear-gradient(160deg, #0f2440 0%, #1a3a5c 100%)",
                }))
              : VISITE_SLIDES.map(slide => ({
                  ...slide,
                  kicker: t(`carousel.${slide.id}.kicker`),
                  title: t(`carousel.${slide.id}.title`),
                  description: t(`carousel.${slide.id}.description`),
                }))
          } />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="p-10 md:p-12 rounded-3xl text-center relative overflow-hidden" style={{ background: "#1a3a5c" }}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>{t('about.newsletter.title')}</h3>
            {nlSuccess ? (
              <div className="p-4 bg-[#2a9d8f]/20 border border-[#2a9d8f] text-white rounded-xl text-sm font-semibold">
                ✅ {t('about.newsletter.success', 'Merci ! Votre inscription a bien été confirmée.')}
              </div>
            ) : (
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  placeholder={t('about.newsletter.placeholder')}
                  required
                  disabled={nlLoading}
                  className="flex-1 px-5 py-3 rounded-xl outline-none border-2 border-transparent focus:border-[#2a9d8f] transition-all bg-white text-sm"
                  style={{ color: "#1a3a5c" }}
                />
                <button
                  type="submit"
                  disabled={nlLoading}
                  className="px-8 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap flex items-center justify-center gap-2"
                  style={{ background: "#2a9d8f" }}
                >
                  {nlLoading ? 'Envoi...' : t('buttons.signup')}
                </button>
              </form>
            )}

            {nlError && (
              <p className="text-xs text-red-300 mt-3">{nlError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
