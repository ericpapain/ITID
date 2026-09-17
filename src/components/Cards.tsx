import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import doctorImg from "../images/doctor.png";
import doctoreImg from "../images/doctore.jpg";
import { useTranslation } from "react-i18next";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MedicalCard = ({ icon, title, desc, color, borderColor, longDesc, wikipediaUrl, img, imageHeight, isDetail, onClose }: any) => {
  const { t } = useTranslation();
  const bgGradient = `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`;

  // 3D Tilt effect (Only for card mode)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDetail) return;
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
    if (isDetail) return;
    x.set(0);
    y.set(0);
  };

  if (isDetail) {
    return (
      <div className="flex flex-col bg-[#0a1628] rounded-3xl relative overflow-hidden shadow-2xl border border-white/10 w-full h-full text-left">
        {/* Bouton Fermer */}
        <button 
          onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }} 
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors border border-white/20"
        >
          <span className="font-semibold text-sm">{t('common.close')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Grande Image Centrale */}
        <div className="w-full h-72 md:h-96 shrink-0 relative overflow-hidden">
          <img alt={title} className="w-full h-full object-cover" src={img || doctorImg} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] to-transparent opacity-90"></div>
          
          {/* Titre superposé */}
          <div className="absolute bottom-6 left-8 right-8 flex items-end gap-6">
            <div className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-5xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
              {icon}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
          </div>
        </div>
        
        {/* Description Complète */}
        <div className="p-8 md:p-12 overflow-y-auto flex-1">
          <div className="text-lg md:text-xl leading-relaxed md:leading-loose text-gray-200 whitespace-pre-line">
            {desc}
          </div>

          {(longDesc || wikipediaUrl) && (
            <div className="mt-8 pt-8 border-t border-white/10">
              {longDesc && <div className="text-lg md:text-xl leading-relaxed md:leading-loose text-gray-200 whitespace-pre-line mb-6">{longDesc}</div>}
              {wikipediaUrl && (
                <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold hover:text-white transition-colors text-lg" style={{ color: color || '#48cae4' }}>
                  {t('common.learnMoreWiki')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), 0 25px 50px -12px rgba(0,0,0,0.5)",
        borderColor: color ? color : '#fff'
      }}
      className="relative flex flex-col rounded-3xl overflow-hidden group transition-all duration-300 border-2 bg-white h-full cursor-pointer card-hover-highlight hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]"
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

      {/* Zone Photo (Mise en avant) */}
      <div 
        className={`w-full ${imageHeight || 'h-72'} shrink-0 relative overflow-hidden`}
        style={{ transform: "translateZ(30px)" }}
      >
        <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" src={img || doctorImg} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <motion.div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white shadow-lg border border-gray-200 transform group-hover:scale-110 transition-transform duration-300" 
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
      </div>
      
      {/* Zone Texte (Compacte) */}
      <div className="p-6 relative z-10 flex flex-col justify-center items-center text-center flex-1" style={{ background: bgGradient, transform: "translateZ(20px)" }}>
        <div className="font-bold text-xl md:text-2xl mb-2 text-[#0c1a2e] transition-colors line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </div>
        
        <div 
          className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:translate-y-1"
          style={{ color: color || '#2a9d8f' }}
        >
          {t('common.seeMore')} <span className="text-xl group-hover:translate-x-1 transition-transform">›</span>
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
  const { t } = useTranslation();
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
      className="relative flex flex-col rounded-3xl overflow-hidden group transition-all duration-300 border border-white/10 bg-[#0a1628] glass h-full cursor-pointer shadow-lg card-hover-highlight hover:shadow-[0_0_40px_rgba(72,209,194,0.4)]"
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
