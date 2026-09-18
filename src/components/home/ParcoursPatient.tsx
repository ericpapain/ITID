import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { TimelineHorizontal } from "../ui/TimelineHorizontal";
import { useTypewriter } from "../../hooks/useTypewriter";
import { useIsMobile } from "../../hooks/useIsMobile";
import parcoursVideo from "../../images/parcours-patient.mp4";
import { PARCOURS } from "../../data";
import { useTranslation } from "react-i18next";

export function ParcoursPatient() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const headerRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useInView(headerRef, { once: true, margin: "-100px" });

  const headingText = t("parcours.heading", "Votre parcours à l’ITID");
  const { displayedText, showCursor, ref: typeRef } = useTypewriter(
    headingText,
    80,
    400
  );

  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isMobile]);

  return (
    <section className="relative w-full py-8 overflow-hidden flex flex-col items-center justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0c1a2e]">
        <video
          ref={videoRef}
          src={parcoursVideo}
          autoPlay={!isMobile}
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#0c1a2e]/75 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          className="text-center mb-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2
            ref={typeRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {displayedText}
            <span
              className={`inline-block w-[3px] md:w-[4px] h-[0.9em] bg-white align-middle ml-1 ${
                showCursor ? "opacity-100" : "opacity-0"
              } transition-opacity duration-75`}
            />
          </h2>
        </motion.div>

        {/* Timeline Component */}
        <div className="w-full">
          <TimelineHorizontal
            milestones={PARCOURS.map((p) => ({
              date: t("parcours.step", { step: p.step, defaultValue: `Étape ${p.step}` }),
              title: t(p.title),
              description: t(p.desc),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
