import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import logo from "../../logos/logo ITID 3.png";
import videoFond from "../../images/video-fond.mp4";
import { ShimmerButton } from "../ui/ShimmerButton";
import { NoiseGradient } from "../ui/NoiseGradient";
import { useTranslation } from "react-i18next";

export function HeroPremium() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const text1 = t('hero.title1');
  const text2 = t('hero.title2');
  const [displayedText1, setDisplayedText1] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [showCursor, setShowCursor] = useState(true);

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
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-32 pb-16">
      <div className="absolute inset-0 z-0">
        <NoiseGradient>
          {/* Background Video with Parallax (made very subtle) */}
          <motion.div
            style={{ y }}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-multiply opacity-70"
          >
            <video
              src={videoFond}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-60"
            />
          </motion.div>
        </NoiseGradient>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center mt-8">
        <div className="flex flex-col items-center">
          <img src={logo} alt="ITID Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 rounded-full shadow-[0_0_50px_rgba(42,157,143,0.3)]" />

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
          <span className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#48d1c2] rounded-full align-middle ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`} />
        </h1>

        <p className="text-lg md:text-xl text-[#6b7c93] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ShimmerButton
            as="a"
            href="https://www.doctolib.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('buttons.bookAppointment')}
          </ShimmerButton>
          <ShimmerButton
            as="Link"
            to="/pathologies"
            className="bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-white font-bold border border-slate-600/80 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:from-[#475569] hover:to-[#1e293b] hover:border-[#48d1c2]/60 hover:shadow-[0_0_25px_rgba(72,209,194,0.3)] transition-all"
          >
            {t('hero.discoverExpertise')}
          </ShimmerButton>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a9d8f]">{t('hero.discover')}</span>
        <motion.div
          className="w-[1.5px] h-12 bg-gradient-to-b from-[#2a9d8f] to-transparent"
          animate={{ height: [0, 48, 0], opacity: [0, 1, 0], y: [0, 24, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  );
}
