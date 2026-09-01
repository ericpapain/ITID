import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import logo from "../../logos/logo ITID 3.png";
import { ShimmerButton } from "../ui/ShimmerButton";
import { NoiseGradient } from "../ui/NoiseGradient";

export function HeroPremium() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const text1 = "L'Avenir du ";
  const text2 = "Traitement de la Douleur";
  const [displayedText1, setDisplayedText1] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const speed = 75; // Vitesse de frappe

    const typeWriter = () => {
      if (i < text1.length) {
        setDisplayedText1(text1.slice(0, i + 1));
        i++;
        timeout = setTimeout(typeWriter, speed);
      } else if (i < text1.length + text2.length) {
        setDisplayedText2(text2.slice(0, i - text1.length + 1));
        i++;
        timeout = setTimeout(typeWriter, speed);
      }
    };
    
    timeout = setTimeout(typeWriter, 1200); // Délai avant de commencer

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <NoiseGradient className="absolute inset-0 z-0">
        {/* Background Video with Parallax (made very subtle) */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-overlay"
        >
          <iframe 
            className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-30 scale-105"
            src="https://www.youtube.com/embed/8_nVbI7NcOw?autoplay=1&mute=1&controls=0&loop=1&playlist=8_nVbI7NcOw&showinfo=0&rel=0&modestbranding=1&playsinline=1" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </motion.div>
      </NoiseGradient>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center"
        >
          <img src={logo} alt="ITID Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 rounded-full shadow-[0_0_50px_rgba(42,157,143,0.3)]" />
          <span className="inline-block py-1 px-3 rounded-full border border-[#2a9d8f]/30 bg-white/50 text-xs font-bold text-[#2a9d8f] tracking-widest uppercase mb-6 shadow-sm">
            L'excellence médicale
          </span>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#1a3a5c] mb-6 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {displayedText1}
          <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48d1c2]">
            {displayedText2}
          </span>
          <span className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#48d1c2] rounded-full align-middle ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`} />
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-[#6b7c93] max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Des protocoles interventionnels de pointe, guidés par imagerie, pour une prise en charge globale, innovante et humaine.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <ShimmerButton 
            as="a"
            href="https://www.doctolib.fr" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Prendre Rendez-vous
          </ShimmerButton>
          <ShimmerButton 
            as="Link"
            to="/pathologies" 
            className="bg-white/50 text-[#1a3a5c] border border-gray-200 shadow-sm hover:bg-white"
          >
            Découvrir nos expertises
          </ShimmerButton>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a9d8f]">Découvrir</span>
        <motion.div 
          className="w-[1.5px] h-12 bg-gradient-to-b from-[#2a9d8f] to-transparent"
          animate={{ height: [0, 48, 0], opacity: [0, 1, 0], y: [0, 24, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </section>
  );
}
