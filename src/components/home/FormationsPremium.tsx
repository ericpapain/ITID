import { motion, useScroll, useTransform } from "framer-motion";
import { TransitionLink } from "../ui/TransitionLink";
import { CATEGORIES_FORMATIONS } from "../../data";
import { useRef } from "react";
import { BackgroundBoxes } from "../animations/BackgroundBoxes";

export function FormationsPremium() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotate1 = useTransform(scrollYProgress, [0, 1], [-20, -5]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [20, 5]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -50]);

  return (
    <section ref={ref} id="formations" className="relative overflow-hidden h-full">
      <BackgroundBoxes className="py-24" rows={14} cols={22}>
        {/* Background Decorative Elements */}
        <div className="absolute top-10 left-10 md:left-20 text-[12rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-rotate-12 cursor-default z-0">📚</div>
      <div className="absolute bottom-20 right-10 text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-8 cursor-default z-0">🎓</div>
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a3a5c]/40 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Animated Stack of Videos */}
        <div className="order-2 md:order-1 relative h-[500px] flex items-center justify-center perspective-[1000px]">
          
          <motion.div 
            style={{ rotate: rotate1, y }}
            className="absolute w-72 h-48 rounded-2xl shadow-xl border border-white/20 overflow-hidden transform -translate-x-24 -translate-y-12 glass z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1758691462749-a95ce1bd7f96?w=600&h=380&fit=crop&auto=format&q=80" 
              alt="video" 
              className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            />
          </motion.div>

          <motion.div 
            style={{ rotate: rotate2, y }}
            className="absolute w-72 h-48 rounded-2xl shadow-xl border border-white/20 overflow-hidden transform translate-x-24 -translate-y-8 glass z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=600&h=380&fit=crop&auto=format&q=80" 
              alt="video" 
              className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            />
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="absolute w-80 h-56 rounded-2xl shadow-2xl border-2 border-white/30 overflow-hidden z-20 transition-transform duration-500 hover:scale-105 cursor-pointer glass-dark group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent z-10 opacity-80" />
            <img 
              src={CATEGORIES_FORMATIONS[0].videos[0].img} 
              alt="video main" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 bg-[#2a9d8f]/80 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl shadow-[0_0_30px_rgba(42,157,143,0.5)] transform group-hover:scale-110 transition-transform duration-300">
                <span className="ml-2">▶</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div 
          className="order-1 md:order-2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 glass text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase">E-Learning Institute</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            L'Excellence <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-teal-200">
              à votre rythme
            </span>
          </h2>
          
          <p className="text-lg leading-relaxed mb-8 text-gray-300 font-light">
            Découvrez nos catalogues de formations vidéo en qualité 4K. Des programmes pointus conçus par nos experts algologues pour les professionnels de santé, et des modules pédagogiques pour le grand public.
          </p>
          
          <TransitionLink
            to="/formations"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(42,157,143,0.3)] hover:shadow-[0_0_30px_rgba(42,157,143,0.5)] bg-[#2a9d8f] hover:bg-[#21867a] interactive group"
          >
            Accéder à l'Académie
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </TransitionLink>
        </motion.div>

      </div>
      </BackgroundBoxes>
    </section>
  );
}
