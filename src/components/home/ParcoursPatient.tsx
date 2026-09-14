import { motion } from "framer-motion";
import { TimelineHorizontal } from "../ui/TimelineHorizontal";
import { NoiseGradient } from "../ui/NoiseGradient";

export function ParcoursPatient() {
  return (
    <section className="relative w-full py-8 overflow-hidden flex flex-col items-center justify-center">
      {/* Background with same theme as Hero but without the full height lock */}
      <NoiseGradient className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9] opacity-80" />
      </NoiseGradient>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full border border-[#2a9d8f]/30 bg-white/50 text-xs font-bold text-[#2a9d8f] tracking-widest uppercase mb-6 shadow-sm">
            Parcours Patient
          </span>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a3a5c] mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Votre parcours à l’ITID
          </h2>
        </motion.div>

        {/* Timeline Component */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="w-full">
            <TimelineHorizontal />
          </div>
        </motion.div>


      </div>
    </section>
  );
}
