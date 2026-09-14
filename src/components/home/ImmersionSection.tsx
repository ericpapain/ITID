import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Particles } from "../animations/Particles";
import { ShimmerButton } from "../ui/ShimmerButton";

export function ImmersionSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={ref} className="relative py-16 bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9] overflow-hidden">
      {/* Background depth wash and particles */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(42,157,143,0.12), transparent 55%), radial-gradient(90% 80% at 50% 120%, rgba(72,209,194,0.10), transparent 60%)",
        }}
      />
      <Particles className="z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2a9d8f]/20 to-transparent z-10" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="w-full lg:w-1/2 space-y-8 relative z-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="text-[#2a9d8f] text-sm font-bold tracking-widest uppercase">Approche Holistique</div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a3a5c] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Au-delà de la médecine,<br/>
              <span className="text-gray-500 italic font-light">le bien-être profond.</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light max-w-lg">
              À l'ITID, nous croyons que l'apaisement de l'esprit est aussi crucial que le traitement du corps. Nos environnements sont conçus pour réduire le stress, inspirer le calme et favoriser la guérison.
            </p>
            <ShimmerButton className="border border-[#2a9d8f]/30 bg-transparent text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white">
              Découvrir notre philosophie
            </ShimmerButton>
          </motion.div>

          <div className="w-full lg:w-1/2 h-[600px] relative grid grid-cols-2 gap-4">
            <motion.div style={{ y: y1 }} className="h-[80%] mt-[20%] rounded-2xl overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=1000&auto=format&fit=crop" 
                alt="Waterfall Serenity" 
                className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-700"
              />
            </motion.div>
            <motion.div style={{ y: y2 }} className="h-[90%] rounded-2xl overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img 
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" 
                alt="Nature Calm" 
                className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
