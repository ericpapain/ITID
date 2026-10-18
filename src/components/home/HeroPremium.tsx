import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import logo from "../../logos/logo ITID 3.png";
import videoFond from "../../images/video-fond.mp4";
import { ShimmerButton } from "../ui/ShimmerButton";
import { NoiseGradient } from "../ui/NoiseGradient";
import { useTranslation } from "react-i18next";
import { HeroMediaItem, extractYouTubeId, getYouTubeEmbedUrl } from "../../utils/mediaUtils";
import { getCleanImageSrc, getCleanVideoSrc, REAL_FALLBACK_IMAGES } from "../../utils/imageUtils";

const DEFAULT_HERO_MEDIA: HeroMediaItem[] = [
  {
    id: "default-video-1",
    type: "video",
    url: videoFond,
    title: "Vidéo Fond ITID",
    duration: 12
  },
  {
    id: "default-img-1",
    type: "image",
    url: "/images/lombalgie.jpg",
    title: "Plateau Interventionnel Guidé",
    duration: 7
  },
  {
    id: "default-img-2",
    type: "image",
    url: "/images/glowing_3d_spine.jpg",
    title: "Imagerie Médicale Haute Définition",
    duration: 7
  }
];

export function HeroPremium() {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Contenus CMS dynamiques
  const [homeCms, setHomeCms] = useState<any>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaErrorMap, setMediaErrorMap] = useState<Record<number, string>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchHomeContent = async () => {
      try {
        const res = await fetch("/api/cms/pages?page=home");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            const isEn = i18n.language && i18n.language.startsWith("en");
            const content = isEn ? (data.content_en || data.content_fr) : (data.content_fr || data.content_en);
            setHomeCms(content || {});
          }
        }
      } catch (e) {
        // Fallback silencieux vers les valeurs par défaut
      }
    };
    fetchHomeContent();
    return () => { isMounted = false; };
  }, [i18n.language]);

  // Liste des médias de fond (Images et Vidéos) nettoyée et normalisée
  const rawMediaList = (homeCms?.heroMediaList && Array.isArray(homeCms.heroMediaList) && homeCms.heroMediaList.length > 0)
    ? homeCms.heroMediaList
    : DEFAULT_HERO_MEDIA;

  const mediaList: HeroMediaItem[] = (rawMediaList.length > 0 ? rawMediaList : DEFAULT_HERO_MEDIA).map((item: any, idx: number) => {
    const isVid = item.type === "video" || (item.url && item.url.split("?")[0].toLowerCase().endsWith(".mp4"));
    return {
      ...item,
      url: isVid ? getCleanVideoSrc(item.url, videoFond) : getCleanImageSrc(item.url, idx)
    };
  });

  const currentMediaIndex = activeMediaIndex % mediaList.length;
  const currentMediaItem = mediaList[currentMediaIndex] || mediaList[0];

  // Si une erreur a été détectée sur ce média, on utilise l'URL de secours
  const activeMediaUrl = mediaErrorMap[currentMediaIndex] || currentMediaItem.url;
  const currentMedia = {
    ...currentMediaItem,
    url: activeMediaUrl
  };

  // Rotation automatique en boucle des médias d'arrière-plan
  useEffect(() => {
    if (mediaList.length <= 1 || isPaused) return;

    const durationSeconds = currentMedia.duration || (currentMedia.type === "image" ? 7 : 12);
    const timer = setTimeout(() => {
      setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
    }, durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [currentMediaIndex, mediaList.length, isPaused, currentMedia]);

  // Textes & Boutons (priorité aux réglages de l'Admin CMS avec fallback i18n)
  const text1 = homeCms?.heroTitle1 || t('hero.title1');
  const text2 = homeCms?.heroTitle2 || t('hero.title2');
  const subtitle = homeCms?.heroSubtitle || t('hero.subtitle');
  const btn1Text = homeCms?.heroBtn1 || t('buttons.bookAppointment');
  const btn1Url = homeCms?.heroBtn1Url || "https://www.doctolib.fr";

  const [displayedText1, setDisplayedText1] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [currentMedia.url]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isDeleting = false;
    let currentText1 = "";
    let currentText2 = "";
    let i = 0;
    let j = 0;

    const type = () => {
      if (!isDeleting) {
        if (i < text1.length) {
          currentText1 += text1.charAt(i);
          setDisplayedText1(currentText1);
          i++;
          timeout = setTimeout(type, 80);
        } else if (j < text2.length) {
          currentText2 += text2.charAt(j);
          setDisplayedText2(currentText2);
          j++;
          timeout = setTimeout(type, 80);
        } else {
          isDeleting = true;
          timeout = setTimeout(type, 3000);
        }
      } else {
        if (j > 0) {
          currentText2 = currentText2.slice(0, -1);
          setDisplayedText2(currentText2);
          j--;
          timeout = setTimeout(type, 40);
        } else if (i > 0) {
          currentText1 = currentText1.slice(0, -1);
          setDisplayedText1(currentText1);
          i--;
          timeout = setTimeout(type, 40);
        } else {
          isDeleting = false;
          timeout = setTimeout(type, 800);
        }
      }
    };

    timeout = setTimeout(type, 800);
    return () => clearTimeout(timeout);
  }, [text1, text2]);

  // Détection du type YouTube ou Vidéo HTML5
  const mediaCleanPath = (currentMedia.url || "").split("?")[0].toLowerCase();
  const ytId = extractYouTubeId(currentMedia.url);
  const isVideoFile = !ytId && (
    currentMedia.type === "video" ||
    mediaCleanPath.endsWith(".mp4") ||
    mediaCleanPath.endsWith(".webm") ||
    mediaCleanPath.endsWith(".mov")
  );

  return (
    <section ref={ref} className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-32 pb-16">
      {/* Background Multi-Médias (Images, Vidéos MP4 et YouTube en boucle) */}
      <div className="absolute inset-0 z-0">
        <NoiseGradient>
          <motion.div
            style={{ y }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-multiply opacity-75"
          >
            <AnimatePresence mode="wait">
              {ytId ? (
                // 1. Vidéo YouTube en arrière-plan
                <motion.div
                  key={`yt-${ytId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 w-full h-full overflow-hidden"
                >
                  <iframe
                    src={getYouTubeEmbedUrl(ytId)}
                    title="Hero YouTube Background"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] min-w-[100vw] min-h-[56.25vw] pointer-events-none object-cover opacity-65"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    frameBorder="0"
                  />
                </motion.div>
              ) : isVideoFile ? (
                // 2. Vidéo HTML5 locale/MP4 avec fallback automatique
                <motion.div
                  key={`vid-${currentMedia.url}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 w-full h-full overflow-hidden"
                >
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onError={() => {
                      setMediaErrorMap((prev) => ({
                        ...prev,
                        [currentMediaIndex]: videoFond
                      }));
                    }}
                    className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-65"
                  />
                </motion.div>
              ) : (
                // 3. Image haute définition avec fallback automatique
                <motion.img
                  key={`img-${currentMedia.url}`}
                  src={currentMedia.url}
                  alt={currentMedia.title || "Fond ITID"}
                  onError={() => {
                    setMediaErrorMap((prev) => ({
                      ...prev,
                      [currentMediaIndex]: REAL_FALLBACK_IMAGES[currentMediaIndex % REAL_FALLBACK_IMAGES.length]
                    }));
                  }}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </NoiseGradient>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center mt-8">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="ITID Logo"
            className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 rounded-full shadow-[0_0_50px_rgba(42,157,143,0.3)]"
          />
        </div>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#1a3a5c] mb-6 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {displayedText1}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48d1c2]">
            {displayedText2}
          </span>
          <span
            className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#48d1c2] rounded-full align-middle ml-2 ${
              showCursor ? "opacity-100" : "opacity-0"
            } transition-opacity duration-75`}
          />
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 font-semibold leading-relaxed tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] drop-shadow-[0_1px_3px_rgba(2,132,199,0.18)]">
            {subtitle}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ShimmerButton
            as="a"
            href={btn1Url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {btn1Text}
          </ShimmerButton>
          <ShimmerButton
            as="Link"
            to="/pathologies"
            className="bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-white font-bold border border-slate-600/80 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:from-[#475569] hover:to-[#1e293b] hover:border-[#48d1c2]/60 hover:shadow-[0_0_25px_rgba(72,209,194,0.3)] transition-all"
          >
            {t("hero.discoverExpertise")}
          </ShimmerButton>
        </div>
      </div>

      {/* Indicateur de Défilement des Médias de Fond (Discret & Interactif) */}
      {mediaList.length > 1 && (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2 p-2 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <span className="text-[10px] text-slate-300 font-mono px-2 font-bold">
            {currentMediaIndex + 1}/{mediaList.length}
          </span>

          <div className="flex items-center gap-1.5">
            {mediaList.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={() => setActiveMediaIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentMediaIndex === idx
                    ? "w-6 h-2 bg-[#48cae4] shadow-[0_0_8px_#48cae4]"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
                title={m.title || `Média #${idx + 1}`}
              />
            ))}
          </div>

          {currentMedia.title && (
            <span className="text-[10px] text-slate-400 font-medium max-w-[140px] truncate border-l border-white/10 pl-2">
              {currentMedia.title}
            </span>
          )}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a9d8f]">{t("hero.discover")}</span>
        <motion.div
          className="w-[1.5px] h-12 bg-gradient-to-b from-[#2a9d8f] to-transparent"
          animate={{ height: [0, 48, 0], opacity: [0, 1, 0], y: [0, 24, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  );
}
