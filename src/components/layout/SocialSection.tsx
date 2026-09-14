import { OrbitingLogos } from "../animations/OrbitingLogos";
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

const SOCIAL_LINKS = [
  { href: "https://facebook.com/itid.france", label: "Facebook", icon: FaFacebook, bg: "#1877F2" },
  { href: "https://linkedin.com/company/itid-france", label: "LinkedIn", icon: FaLinkedin, bg: "#0A66C2" },
  { href: "https://instagram.com/itid.france", label: "Instagram", icon: FaInstagram, bg: "#E1306C" },
  { href: "https://youtube.com/@itid.france", label: "YouTube", icon: FaYoutube, bg: "#FF0000" },
];

export function SocialSection() {
  return (
    <section className="relative py-10 overflow-hidden bg-gradient-to-br from-[#f0f7f6] via-[#e8f4f2] to-[#dcece9]">
      {/* Background Orbit */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <OrbitingLogos className="scale-[1.5] md:scale-[2]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#2a9d8f" }}>
          Réseaux sociaux
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
          Suivez l'ITID
        </h2>
        <p className="text-base md:text-lg mb-8 text-gray-600 max-w-2xl mx-auto font-light">
          Actualités médicales, conseils et informations sur nos traitements — directement sur vos plateformes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon, bg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: bg }}
            >
              <Icon size={20} /> {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
