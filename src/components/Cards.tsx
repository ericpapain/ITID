import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import doctorImg from "../images/doctor.png";
import doctoreImg from "../images/doctore.jpg";

export const MedicalCard = ({ icon, title, desc, color, borderColor, longDesc, wikipediaUrl, img }: any) => {
  const [expanded, setExpanded] = useState(false);
  const bgGradient = color ? `linear-gradient(135deg, ${color}10 0%, #ffffff 100%)` : `linear-gradient(135deg, #f0f7f6 0%, #ffffff 100%)`;
  
  return (
    <div className="flex flex-col md:flex-row relative rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 bg-white">
      {/* Zone Photo */}
      <div className="w-full md:w-2/5 lg:w-1/3 h-40 md:h-auto shrink-0 relative overflow-hidden">
        <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={img || doctorImg} />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Zone Texte */}
      <div className="flex-1 p-5 md:p-6 relative z-10" style={{ background: bgGradient }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 bg-white shadow-sm border border-gray-100">
          {icon}
        </div>
        <div className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
          {title}
        </div>
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "#6b7c93" }}>
          {desc}
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold transition-colors mt-4"
          style={{ color: color || '#2a9d8f' }}
        >
          {expanded ? "Moins d'infos" : "Plus d'infos"}
          <FaChevronDown className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.5)", color: "#1a3a5c" }}>
            {longDesc || "Détails supplémentaires bientôt disponibles."}
            {wikipediaUrl && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a href={wikipediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: color || '#2a9d8f' }}>
                  Voir sur Wikipédia ↗
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute -bottom-6 -right-4 text-9xl opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none select-none z-0">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const TreatmentCard = ({ num, title, desc, icon, img }: any) => {
  return (
    <div className="flex flex-col md:flex-row relative rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 bg-white">
      {/* Zone Photo */}
      <div className="w-full md:w-2/5 lg:w-1/3 h-40 md:h-auto shrink-0 relative overflow-hidden">
        <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={img || doctoreImg} />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Zone Texte */}
      <div className="flex-1 p-5 md:p-6 relative z-10" style={{ background: `linear-gradient(135deg, #f4f8fb 0%, #ffffff 100%)` }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 bg-white shadow-sm border border-gray-100">
          {icon}
        </div>
        <div className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
          {title}
        </div>
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "#6b7c93" }}>
          {desc}
        </div>
        
        <div className="absolute -top-4 -right-2 text-[8rem] font-bold opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
          {num}
        </div>
        
        <div className="absolute -bottom-6 -right-4 text-9xl opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none select-none z-0">
          {icon}
        </div>
      </div>
    </div>
  );
};
