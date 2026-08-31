import { motion } from "framer-motion";
import { TEAM_ROLES } from "../../data";

export function EquipePanorama() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#0a1628] text-white">
      {/* Background Image Panorama */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="w-full h-[120%] absolute -top-[10%]"
          initial={{ y: "0%" }}
          whileInView={{ y: "-10%" }}
          transition={{ duration: 10, ease: "linear" }}
        >
          <img 
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop" 
            alt="Medical Team Panorama" 
            className="w-full h-full object-cover opacity-30"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-[#0a1628]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-[#2a9d8f] text-sm font-bold tracking-widest uppercase mb-4 block">Notre Force</span>
          <h2 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Une Équipe <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Pluridisciplinaire</span>
          </h2>
        </motion.div>

        {["Medecin", "Infirmière", "Secretaire"].map((cat) => (
          <div key={cat} className="mb-20 last:mb-0">
            <h3 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10 text-white" style={{ fontFamily: "var(--font-display)" }}>
              {cat === "Medecin" ? "Équipe Médicale" : cat === "Infirmière" ? "Équipe Paramédicale" : "Secrétariat & Accueil"}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {TEAM_ROLES.filter(item => item.category === cat).map((item, idx) => (
                <motion.div
                  key={item.role + idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (idx % 4) * 0.15 }}
                  className="group relative"
                >
                  <div className="h-96 rounded-2xl glass-dark overflow-hidden p-6 flex flex-col justify-end relative transition-transform duration-500 hover:-translate-y-4">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-b from-transparent to-[#2a9d8f]" />
                    <div className="text-6xl mb-auto opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">{item.icon}</div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-2">{item.role}</h3>
                      <p className="text-sm text-gray-300 mb-4">{item.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
