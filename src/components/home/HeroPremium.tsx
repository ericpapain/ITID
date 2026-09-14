import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import logo from "../../logos/logo ITID 3.png";
import fondImg from "../../images/fond.jpeg";
import { ShimmerButton } from "../ui/ShimmerButton";
import { NoiseGradient } from "../ui/NoiseGradient";

export function HeroPremium() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const text1 = "L'Avenir du ";
  const text2 = "Traitement de la Douleur";
  const [displayedText1, setDisplayedText1] = useState(text1);
  const [displayedText2, setDisplayedText2] = useState(text2);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
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
            <img 
              src={fondImg} 
              alt="Fond ITID" 
              className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-60 scale-105"
            />
          </motion.div>
        </NoiseGradient>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center mt-8">
        <div className="flex flex-col items-center">
          <img src={logo} alt="ITID Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 rounded-full shadow-[0_0_50px_rgba(42,157,143,0.3)]" />
          <span className="inline-block py-1 px-3 rounded-full border border-[#2a9d8f]/30 bg-white/50 text-xs font-bold text-[#2a9d8f] tracking-widest uppercase mb-6 shadow-sm">
            L'excellence médicale
          </span>
        </div>

        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#1a3a5c] mb-6 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {displayedText1}
          <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#48d1c2]">
            {displayedText2}
          </span>
          <span className={`inline-block w-[4px] md:w-[6px] h-[0.9em] bg-[#48d1c2] rounded-full align-middle ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-75`} />
        </h1>

        <p className="text-lg md:text-xl text-[#6b7c93] max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
          Des protocoles interventionnels de pointe, guidés par imagerie, pour une prise en charge globale, innovante et humaine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a9d8f]">Découvrir</span>
        <motion.div 
          className="w-[1.5px] h-12 bg-gradient-to-b from-[#2a9d8f] to-transparent"
          animate={{ height: [0, 48, 0], opacity: [0, 1, 0], y: [0, 24, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  );
}
