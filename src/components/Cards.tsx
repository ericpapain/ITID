import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import doctorImg from "../images/doctor.png";
import doctoreImg from "../images/doctore.jpg";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MedicalCard = ({ icon, title, desc, color, borderColor, longDesc, wikipediaUrl, img, imageHeight }: any) => {
  const [expanded, setExpanded] = useState(false);
  const bgGradient = color ? `linear-gradient(180deg, ${color}20 0%, rgba(15,36,64,0.8) 100%)` : `linear-gradient(180deg, rgba(42,157,143,0.2) 0%, rgba(15,36,64,0.8) 100%)`;

  // 3D Tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.1), inset 0 0 20px rgba(0,0,0,0.5), 0 25px 50px -12px rgba(0,0,0,0.7)",
        borderColor: color ? `${color}60` : 'rgba(255,255,255,0.3)'
      }}
      className="relative flex flex-col rounded-3xl overflow-hidden group transition-all duration-300 border-2 bg-[#0a1628] h-full cursor-pointer hover:shadow-[0_0_40px_rgba(42,157,143,0.4)]"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [x, y],
            ([latestX, latestY]) => `radial-gradient(400px circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(42,157,143,0.15), transparent 40%)`
          )
        }}
      />

      {/* Zone Photo */}
      <div 
        className={`w-full ${imageHeight || 'h-48'} shrink-0 relative overflow-hidden`}
        style={{ transform: "translateZ(30px)" }}
      >
        <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" src={img || doctorImg} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/80 to-transparent"></div>
        <motion.div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform duration-300" 
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
      </div>
      
      {/* Zone Texte */}
      <div className="flex-1 p-6 relative z-10 flex flex-col" style={{ background: bgGradient, transform: "translateZ(20px)" }}>
        <div className="font-bold text-xl mb-3 text-white group-hover:text-[#48cae4] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </div>
        <div className="text-sm md:text-base leading-relaxed text-gray-300 mb-4 flex-1">
          {desc}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="flex items-center gap-2 text-sm font-semibold transition-colors mt-auto interactive"
          style={{ color: color || '#48cae4' }}
        >
          {expanded ? "Moins d'infos" : "Plus d'infos"}
          <FaChevronDown className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 rounded-xl text-sm leading-relaxed glass text-gray-200 border border-white/10 relative z-20">
            {longDesc || "Détails supplémentaires bientôt disponibles."}
            {wikipediaUrl && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 font-medium hover:text-white transition-colors" style={{ color: color || '#48cae4' }}>
                  Voir sur Wikipédia ↗
                </a>
              </div>
            )}
          </div>
        </div>
        
        <motion.div 
          className="absolute -bottom-6 -right-4 text-9xl opacity-[0.02] pointer-events-none select-none z-0"
          animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(10px)" }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const TreatmentCard = ({ num, title, desc, icon, img, imageHeight }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className="relative flex flex-col rounded-3xl overflow-hidden group transition-all duration-300 border border-white/10 bg-[#0a1628] glass h-full cursor-pointer shadow-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [x, y],
            ([latestX, latestY]) => `radial-gradient(400px circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(255,255,255,0.1), transparent 40%)`
          )
        }}
      />

      {/* Zone Photo */}
      <div 
        className={`w-full ${imageHeight || 'h-48'} shrink-0 relative overflow-hidden`}
        style={{ transform: "translateZ(30px)" }}
      >
        <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" src={img || doctoreImg} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/80 to-transparent"></div>
        <motion.div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform duration-300" 
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
        {num && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white/80 bg-white/10 backdrop-blur-md border border-white/20" style={{ transform: "translateZ(30px)" }}>
            {num}
          </div>
        )}
      </div>
      
      {/* Zone Texte */}
      <div className="flex-1 p-6 relative z-10 flex flex-col" style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(15,36,64,0.8) 100%)`, transform: "translateZ(20px)" }}>
        <div className="font-bold text-xl mb-3 text-white group-hover:text-blue-300 transition-colors" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </div>
        <div className="text-sm md:text-base leading-relaxed text-gray-300 mb-4 flex-1">
          {desc}
        </div>
        
        <motion.div 
          className="absolute -bottom-6 -right-4 text-9xl opacity-[0.02] pointer-events-none select-none z-0"
          animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(10px)" }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};
