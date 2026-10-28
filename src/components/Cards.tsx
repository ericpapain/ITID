import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import doctorImg from "../images/doctor.png";
import doctoreImg from "../images/doctore.jpg";
import { useTranslation } from "react-i18next";
import { ArrowRight, RotateCw, X } from "lucide-react";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MedicalCard = ({ icon, title, desc, color, borderColor, longDesc, wikipediaUrl, img, imageHeight, isDetail, onClose, slug }: any) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const detailSlug = slug || (title ? title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-') : 'lombalgie-chronique');

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
      <div className="relative w-full h-full select-none" style={{ perspective: 1400 }}>
        <div
          className="w-full h-full relative transition-transform duration-500 rounded-3xl"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ========================================================= */}
          {/* FACE AVANT (RECTO)                                        */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#0a1628] flex flex-col justify-between text-left"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Bouton Fermer */}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }} 
              className="absolute top-3.5 right-3.5 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors border border-white/20 text-xs font-semibold cursor-pointer"
            >
              <span>{t('common.close', 'Fermer')}</span>
              <X size={14} />
            </button>

            {/* Zone Photo Recto */}
            <div className="w-full h-52 sm:h-56 shrink-0 relative overflow-hidden bg-slate-950">
              <img
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                src={img || doctorImg}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = doctorImg; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-black/30" />
              
              {/* Badge & Icône */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
                  {icon || "🦴"}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-[#48cae4]">
                  Fiche Pathologie
                </span>
              </div>

              {/* Titre superposé */}
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-md" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </h2>
              </div>
            </div>

            {/* Zone Actions Recto */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              {/* Bouton pour aller au VERSO (Voir la description) */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                >
                  <RotateCw size={13} className="text-[#48cae4] group-hover:rotate-180 transition-transform duration-500" />
                  <span>Voir la description au verso</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center font-light">
                  Consulter la description clinique détaillée au verso
                </p>
              </div>

              {/* BOUTON LIRE LA FICHE DÉTAILLÉE : TOUJOURS EN ÉVIDENCE AU RECTO */}
              <div className="pt-3 border-t border-white/10">
                <Link
                  to={`/pathologies/${detailSlug}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onClose) onClose();
                  }}
                  className="flex w-full items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(42,157,143,0.45)] hover:brightness-110 active:scale-98 transition-all group cursor-pointer"
                >
                  <span className="font-bold tracking-wide">
                    {t("common.readFullFile", "Lire la fiche détaillée")}
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FACE ARRIÈRE (VERSO) : LA DESCRIPTION CLINIQUE           */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-[#48cae4]/50 bg-gradient-to-br from-[#10243e] via-[#0d1c31] to-[#08121f] flex flex-col justify-between p-4 sm:p-5 text-left"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header Verso */}
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon || "🦴"}</span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                    Description Clinique
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="text-xs text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Voir la photo au recto"
                  >
                    <RotateCw size={12} />
                    <span>Recto</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); }}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Titre Verso */}
              <h3 className="text-lg sm:text-xl font-bold text-white mt-2 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                {title}
              </h3>
            </div>

            {/* Description Verso */}
            <div className="flex-1 overflow-y-auto my-2.5 pr-1 text-sm sm:text-base leading-relaxed text-gray-200 whitespace-pre-line custom-scrollbar">
              {desc}

              {wikipediaUrl && (
                <div className="mt-3 pt-2">
                  <a
                    href={wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors"
                  >
                    <span>{t('common.learnMoreWiki', 'En savoir plus (Wikipédia)')}</span>
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* BOUTON LIRE LA FICHE DÉTAILLÉE : TOUJOURS EN ÉVIDENCE AU VERSO */}
            <div className="pt-3 border-t border-white/10">
              <Link
                to={`/pathologies/${detailSlug}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClose) onClose();
                }}
                className="flex w-full items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(42,157,143,0.45)] hover:brightness-110 active:scale-98 transition-all group cursor-pointer"
              >
                <span className="font-bold tracking-wide">
                  {t("common.readFullFile", "Lire la fiche détaillée")}
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onClick={() => navigate(`/pathologies/${detailSlug}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2), 0 25px 50px -12px rgba(0,0,0,0.6)",
        borderColor: color ? color : '#48cae4'
      }}
      className="relative flex flex-col rounded-3xl overflow-hidden group transition-all duration-300 border-2 bg-[#0d1c31] h-full cursor-pointer card-hover-highlight hover:shadow-[0_0_50px_rgba(72,202,228,0.3)] text-white"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [x, y],
            ([latestX, latestY]) => `radial-gradient(400px circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(72,202,228,0.2), transparent 40%)`
          )
        }}
      />

      {/* Zone Photo (Mise en avant) */}
      <div 
        className={`w-full ${imageHeight || 'h-72'} shrink-0 relative overflow-hidden`}
        style={{ transform: "translateZ(30px)" }}
      >
        <img alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" src={img || doctorImg} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c31] via-transparent to-transparent"></div>
        <motion.div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform duration-300" 
          style={{ transform: "translateZ(50px)" }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
      </div>
      
      {/* Zone Texte (Compacte) */}
      <div className="p-5 sm:p-6 relative z-10 flex flex-col justify-between items-center text-center flex-1 bg-gradient-to-b from-[#0d1c31] to-[#071322]" style={{ transform: "translateZ(20px)" }}>
        <div className="font-bold text-lg sm:text-xl md:text-2xl mb-2 text-white transition-colors line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </div>
        
        {/* Bouton Lire la fiche détaillée */}
        <Link
          to={`/pathologies/${detailSlug}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="mt-3 flex w-full items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#2a9d8f] to-[#48cae4] text-[#0c1a2e] font-bold text-xs shadow-md hover:brightness-110 transition-all group cursor-pointer"
        >
          <div className="flex items-center text-[#0c1a2e] font-bold group-hover:translate-x-1 transition-transform">
            {t("common.readFullFile", "Lire la fiche détaillée")}
            <ArrowRight size={14} className="ml-1" />
          </div>
        </Link>
        
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
        <img alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" src={img || doctoreImg} />
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
