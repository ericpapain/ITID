import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAM_ROLES } from "../../data";
import { Plus, X, Sparkles } from "lucide-react";
import equipepaintImg from "../../images/equipepaint.png";

const CATEGORIES = [
  { id: "Medecin", title: "Équipe Médicale", badge: "5 Spécialistes", color: "#2a9d8f", icon: "👨‍⚕️" },
  { id: "Infirmière", title: "Équipe Paramédicale", badge: "3 Thérapeutes", color: "#48cae4", icon: "💉" },
  { id: "Secretaire", title: "Secrétariat & Accueil", badge: "1 Coordination", color: "#98c1d9", icon: "📝" },
];

export function EquipePanorama() {
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);

  const activeRoles = selectedCategory 
    ? TEAM_ROLES.filter((item) => item.category === selectedCategory.id)
    : [];

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9] text-[#1a3a5c]">
      {/* Background Parallax & Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#2a9d8f]/10 rounded-full blur-[160px]" />
        <img 
          src={equipepaintImg} 
          alt="Medical Team Panorama" 
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0f7f6] via-transparent to-[#f0f7f6]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 glass border border-[#2a9d8f]/30 text-[#1a3a5c] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#2a9d8f]" />
            <span className="text-xs font-bold tracking-widest uppercase">Notre Force Pluridisciplinaire</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Une Équipe <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] via-[#21867a] to-[#48cae4]">Pluridisciplinaire</span>
          </h2>
          <p className="mt-4 text-gray-600 text-base max-w-xl mx-auto font-light">
            Cliquez sur le bouton « Découvrir » d'une pile pour ouvrir sa fiche détaillée.
          </p>
        </motion.div>

        {/* 3 Columns Layout (Fixed & Stable Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {CATEGORIES.map((cat) => {
            const roles = TEAM_ROLES.filter((item) => item.category === cat.id);

            return (
              <div key={cat.id} className="flex flex-col col-span-1">
                {/* Category Header Bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2a9d8f]/20">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white/50 border border-[#2a9d8f]/20 shadow-sm">
                      {cat.icon}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-[#1a3a5c] leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                        {cat.title}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
                        {roles.length} {roles.length > 1 ? "membres" : "membre"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg interactive bg-[#2a9d8f] text-white hover:bg-[#21867a] shadow-[0_0_20px_rgba(42,157,143,0.4)]"
                  >
                    <Plus className="w-4 h-4" />
                    Découvrir ({roles.length})
                  </button>
                </div>

                {/* 3D CARD STACK PREVIEW */}
                <div
                  onClick={() => setSelectedCategory(cat)}
                  className="relative h-[420px] w-full cursor-pointer group card-hover-highlight select-none"
                >
                  {roles.map((item, idx) => {
                    if (idx >= 3) return null;
                    
                    const offset = idx * 16;
                    const scaleVal = 1 - idx * 0.05;
                    const rotateDeg = idx === 1 ? 3 : idx === 2 ? -3 : 0;
                    const zIdx = 30 - idx * 10;
                    const opacityVal = 1 - idx * 0.2;

                    return (
                      <div
                        key={item.role + idx}
                        className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-md border border-[#2a9d8f]/10 p-6 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-500 group-hover:border-[#2a9d8f]/30 group-hover:shadow-[0_0_30px_rgba(42,157,143,0.15)]"
                        style={{
                          top: `${offset}px`,
                          transform: `scale(${scaleVal}) rotate(${rotateDeg}deg)`,
                          zIndex: zIdx,
                          opacity: opacityVal,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none" />
                        
                        <div className="flex justify-between items-start z-10">
                          <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-500">
                            {item.icon}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#2a9d8f]/20 text-[#48cae4] border border-[#2a9d8f]/30">
                              Sommet de pile
                            </span>
                          )}
                        </div>

                        <div className="relative z-10 mt-auto">
                          <h4 className="text-xl font-bold text-[#1a3a5c] mb-2 leading-snug">
                            {item.role}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-light">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Stack Action Hint overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-white/90 border border-[#2a9d8f]/30 backdrop-blur-md shadow-xl text-xs font-bold text-[#2a9d8f] flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Cliquer pour ouvrir ({roles.length} membres)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GLASSMORPHISM MODAL OVERLAY */}
      <AnimatePresence>
        {selectedCategory && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#1a3a5c]/60 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] bg-white/95 border border-[#2a9d8f]/20 rounded-3xl p-6 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.3)] overflow-y-auto flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2a9d8f]/20">
                <div className="flex items-center gap-4">
                  <span className="text-4xl p-3 rounded-2xl bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 shadow-sm text-[#2a9d8f]">
                    {selectedCategory.icon}
                  </span>
                  <div>
                    <h3 className="text-3xl font-bold text-[#1a3a5c] leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                      {selectedCategory.title}
                    </h3>
                    <p className="text-xs text-[#2a9d8f] font-semibold mt-1">
                      {selectedCategory.badge} engagés pour votre parcours de soins
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-[#1a3a5c] flex items-center justify-center transition-colors text-xl font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRoles.map((item, idx) => (
                  <div
                    key={item.role + idx}
                    className="h-[320px] rounded-3xl bg-white/60 backdrop-blur-md border border-[#2a9d8f]/10 p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_0_30px_rgba(42,157,143,0.15)] hover:border-[#2a9d8f]/40"
                  >
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-b from-transparent to-[#2a9d8f]" />
                    
                    <div className="flex items-center justify-between z-10">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/30">
                        Pôle ITID
                      </span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <h4 className="text-2xl font-bold text-[#1a3a5c] mb-2 leading-snug">
                        {item.role}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed font-light">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
