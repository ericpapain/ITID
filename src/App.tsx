import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const NAV_LINKS = [
  { label: "Le Centre", href: "#centre" },
  { label: "Pathologies", href: "#pathologies" },
  { label: "Traitements", href: "#traitements" },
  { label: "Équipe", href: "#equipe" },
  { label: "Formations", href: "#formations" },
  { label: "Contact", href: "#contact" },
];

const PATHOLOGIES = [
  {
    icon: "🦴",
    title: "Lombalgies, sciatiques & cruralgies",
    desc: "Arthrose, hernies discales, canal lombaire étroit — prise en charge interventionnelle ciblée.",
  },
  {
    icon: "⚡",
    title: "Douleurs neuropathiques",
    desc: "Brûlures, fourmillements, allodynie — atteintes nerveuses périphériques et centrales.",
  },
  {
    icon: "🔥",
    title: "SDRC / Algodystrophie",
    desc: "Syndrome douloureux régional complexe post-traumatique ou post-chirurgical.",
  },
  {
    icon: "🦿",
    title: "Douleurs articulaires",
    desc: "Épaule, hanche, genou — arthrose évoluée, tendinopathies réfractaires.",
  },
  {
    icon: "🌸",
    title: "Douleurs pelviennes & endométriose",
    desc: "Suivi pluridisciplinaire avec gynécologue et urologues spécialisés.",
  },
  {
    icon: "🧠",
    title: "Céphalées & migraines résistantes",
    desc: "Protocoles spécifiques pour les formes résistantes aux traitements standards.",
  },
];

const TRAITEMENTS = [
  {
    num: "01",
    title: "Infiltrations rachidiennes & articulaires",
    desc: "Infiltrations de facettes, racines nerveuses, épidurales — guidées par imagerie pour une précision maximale.",
    icon: "💉",
  },
  {
    num: "02",
    title: "Perfusions de lidocaïne",
    desc: "Administrées en hôpital de jour, indiquées pour les douleurs neuropathiques réfractaires.",
    icon: "🏥",
  },
  {
    num: "03",
    title: "Stimulation du ganglion dorsal",
    desc: "Neuromodulation de pointe, particulièrement efficace dans l'algodystrophie et les douleurs radiculaires.",
    icon: "⚙️",
  },
  {
    num: "04",
    title: "Cryoneurolyse",
    desc: "Traitement par froid contrôlé de nerfs périphériques — alternative non chirurgicale durable.",
    icon: "❄️",
  },
  {
    num: "05",
    title: "Hypnose médicale & sophrologie",
    desc: "Approches intégratives complémentaires pour la gestion cognitive et émotionnelle de la douleur.",
    icon: "🧘",
  },
  {
    num: "06",
    title: "Coordination pluridisciplinaire",
    desc: "Neurologues, psychiatres, psychologues, urologues — un réseau complet autour de chaque patient.",
    icon: "🤝",
  },
];

const TEAM_ROLES = [
  { role: "Médecins algologues", detail: "dont médecins en formation spécialisée", icon: "👨‍⚕️" },
  { role: "3 Neurologues", detail: "collaborateurs experts du système nerveux", icon: "🧠" },
  { role: "2 Psychiatres + 1 Psychologue", detail: "soutien psychologique intégré au parcours", icon: "💬" },
  { role: "2 Hypnothérapeutes & sophrologues", detail: "partenaires pour les approches complémentaires", icon: "🧘" },
  { role: "1 Gynécologue + 2 Urologues", detail: "spécialisés douleurs pelviennes & endométriose", icon: "🩺" },
  { role: "Infirmières spécialisées douleur", detail: "présentes à chaque étape du suivi", icon: "💉" },
];

const PARCOURS = [
  { step: "01", title: "Orientation médicale", desc: "Adressé par votre médecin traitant ou un spécialiste." },
  { step: "02", title: "Consultation d'évaluation", desc: "Bilan complet avec un médecin algologue." },
  { step: "03", title: "Plan de traitement", desc: "Protocole personnalisé, co-construit avec l'équipe." },
  { step: "04", title: "Suivi & réévaluation", desc: "Ajustements réguliers pour une prise en charge optimale." },
];

const FORMATIONS = [
  {
    tag: "Professionnel de santé",
    title: "Douleur Chronique : Évaluation & Prise en Charge Interventionnelle",
    duration: "8h de vidéo",
    price: "290 €",
    students: "1 240",
    img: "https://images.unsplash.com/photo-1758691462749-a95ce1bd7f96?w=600&h=380&fit=crop&auto=format",
  },
  {
    tag: "Grand public",
    title: "Comprendre et Mieux Vivre avec la Douleur Chronique",
    duration: "5h de vidéo",
    price: "89 €",
    students: "3 870",
    img: "https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=600&h=380&fit=crop&auto=format",
  },
  {
    tag: "Infirmier·ère / Kiné",
    title: "Techniques d'Évaluation et Outils d'Accompagnement",
    duration: "4h de vidéo",
    price: "149 €",
    students: "870",
    img: "https://images.unsplash.com/photo-1758691462743-f9fc9e430d39?w=600&h=380&fit=crop&auto=format",
  },
];

const BOT_RESPONSES: Record<string, string> = {
  default:
    "Bonjour, je suis l'assistant IA de l'ITID. Je peux vous orienter vers nos soins, nos formations ou vous aider à prendre rendez-vous sur Doctolib. Comment puis-je vous aider ?",
  douleur:
    "L'ITID prend en charge les douleurs chroniques et aiguës : lombalgies, neuropathies, SDRC, migraines résistantes, douleurs pelviennes. Pour évaluer votre situation, une consultation d'évaluation avec un algologue est la première étape.",
  rdv: "La prise de rendez-vous se fait via Doctolib. Vous pouvez également appeler le 03 51 53 20 26 du lundi au vendredi de 8h30 à 18h00. Le cabinet est situé au 25 avenue des Mailles, Saint-Julien-les-Villas, 10800 TROYES.",
  formation:
    "Nous proposons 3 formations vidéo : pour les professionnels de santé (290 €), le grand public (89 €) et les paramédicaux (149 €). Accès à vie et certificat inclus.",
  itid: "L'ITID (Institut du Traitement Interventionnel de la Douleur) est situé à Troyes, dans l'Espace Médical de Spécialistes de Champagne. Nous proposons des soins interventionnels de pointe pour toutes les formes de douleurs chroniques.",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("douleur") || lower.includes("mal") || lower.includes("souffr") || lower.includes("sciatique"))
    return BOT_RESPONSES.douleur;
  if (lower.includes("rdv") || lower.includes("rendez") || lower.includes("doctolib") || lower.includes("appel") || lower.includes("téléphone"))
    return BOT_RESPONSES.rdv;
  if (lower.includes("formation") || lower.includes("video") || lower.includes("cours"))
    return BOT_RESPONSES.formation;
  if (lower.includes("itid") || lower.includes("institut") || lower.includes("troyes") || lower.includes("adresse"))
    return BOT_RESPONSES.itid;
  return BOT_RESPONSES.default;
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: BOT_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: getBotReply(msg) }]);
    }, 1100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[340px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "#fff", border: "1px solid #e2ddd6", maxHeight: 480 }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1a3a5c" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#2a9d8f", color: "#fff" }}>
              IA
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Assistant ITID</div>
              <div className="text-xs" style={{ color: "#8fb3d0" }}>Réponse en quelques secondes</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white opacity-60 hover:opacity-100 text-lg leading-none">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f7f4ef" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[82%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                  style={m.role === "user"
                    ? { background: "#1a3a5c", color: "#fff" }
                    : { background: "#fff", color: "#1a3a5c", border: "1px solid #e2ddd6" }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2 text-sm" style={{ background: "#fff", border: "1px solid #e2ddd6", color: "#6b7c93" }}>
                  <span className="animate-pulse">···</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: "1px solid #e2ddd6" }}>
            {["Prendre RDV", "Traitements", "Formations"].map((q) => (
              <button key={q} onClick={() => send(q)} className="shrink-0 px-2 py-1 rounded-full text-xs font-medium" style={{ background: "#e8f4f2", color: "#2a9d8f", border: "1px solid #b3ddd9" }}>
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-3" style={{ borderTop: "1px solid #e2ddd6" }}>
            <input
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#f7f4ef", border: "1px solid #d8d2c8", color: "#1a3a5c" }}
              placeholder="Votre question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={() => send()} className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "#2a9d8f" }}>➤</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: open ? "#1a3a5c" : "#2a9d8f" }}
        aria-label="Ouvrir le chat IA"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-40" style={{ background: "rgba(26,58,92,0.97)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "#2a9d8f" }}>IT</div>
            <div>
              <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "var(--font-display)" }}>ITID France</div>
              <div className="text-xs" style={{ color: "#8fb3d0", lineHeight: 1 }}>Institut du Traitement de la Douleur</div>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium transition-colors" style={{ color: "#8fb3d0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8fb3d0")}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a href="https://www.doctolib.fr" target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "#2a9d8f", color: "#fff" }}
          >
            📅 Doctolib
          </a>

          <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium py-1" style={{ color: "#c8dff0" }} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: "#0f2440" }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625134673337-519d4d10b313?w=1600&h=900&fit=crop&auto=format')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f2440 55%, #1a3a5c80 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ background: "rgba(42,157,143,0.2)", color: "#3bb5a6", border: "1px solid rgba(42,157,143,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Troyes · Espace Médical de Spécialistes de Champagne
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white" style={{ fontFamily: "var(--font-display)" }}>
              Institut du Traitement{" "}
              <em className="not-italic" style={{ color: "#2a9d8f" }}>Interventionnel de la Douleur</em>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: "#a8c4d8", maxWidth: 520 }}>
              Centre spécialisé à Troyes accompagnant les patients souffrant de douleurs chroniques et aiguës, avec des techniques interventionnelles de pointe et une approche pluridisciplinaire.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="https://www.doctolib.fr" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#2a9d8f" }}>
                Prendre RDV sur Doctolib →
              </a>
              <a href="tel:0351532026"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                📞 03 51 53 20 26
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { val: "6 spécialités", label: "de douleur prises en charge" },
                { val: "12 praticiens", label: "dans l'équipe pluridisciplinaire" },
                { val: "Troyes", label: "25 av. des Mailles, 10800" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.val}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#8fb3d0" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:block">
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
              <div className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "var(--font-display)", color: "#3bb5a6" }}>
                Parcours patient ITID
              </div>
              {PARCOURS.map((p, i) => (
                <div key={p.step} className="flex gap-4 items-start mb-4 last:mb-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: "#2a9d8f" }}>
                    {p.step}
                  </div>
                  <div className="flex-1" style={{ borderBottom: i < PARCOURS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingBottom: i < PARCOURS.length - 1 ? "1rem" : 0 }}>
                    <div className="font-semibold text-white text-sm">{p.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#8fb3d0" }}>{p.desc}</div>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-xl flex items-start gap-3" style={{ background: "rgba(42,157,143,0.15)", border: "1px solid rgba(42,157,143,0.3)" }}>
                <span className="text-xl">🤖</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "#3bb5a6" }}>Assistant IA disponible 24h/24</div>
                  <div className="text-xs mt-0.5" style={{ color: "#8fb3d0" }}>Posez vos questions entre les consultations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CENTRE */}
      <section id="centre" className="py-20" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Qui sommes-nous</div>
              <h2 className="text-4xl font-bold mb-5" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                L'ITID, centre de référence de la douleur en Champagne
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#6b7c93" }}>
                L'Institut du Traitement Interventionnel de la Douleur est installé au sein de l'Espace Médical de Spécialistes de Champagne, à Troyes. Notre équipe pluridisciplinaire prend en charge l'ensemble des syndromes douloureux chroniques et aigus avec des techniques interventionnelles de pointe.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#6b7c93" }}>
                Chaque patient bénéficie d'une évaluation complète et d'un plan de traitement personnalisé, co-construit avec l'ensemble des spécialistes impliqués dans sa prise en charge.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Sur ordonnance médicale", "Consultation d'évaluation", "Suivi personnalisé"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "#e8f4f2", color: "#2a9d8f", border: "1px solid #b3ddd9" }}>
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Lun – Ven", val: "8h30 – 18h00", icon: "🕒" },
                { label: "Téléphone", val: "03 51 53 20 26", icon: "📞" },
                { label: "Adresse", val: "25 av. des Mailles\n10800 TROYES", icon: "📍" },
                { label: "Prise de RDV", val: "Via Doctolib", icon: "📅" },
              ].map((info) => (
                <div key={info.label} className="p-4 rounded-2xl" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div className="text-xs font-medium mb-1" style={{ color: "#6b7c93" }}>{info.label}</div>
                  <div className="font-semibold text-sm whitespace-pre-line" style={{ color: "#1a3a5c" }}>{info.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PATHOLOGIES */}
      <section id="pathologies" className="py-24" style={{ background: "#f0f7f6" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-14">
            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Pathologies traitées</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
              Nous prenons en charge toutes les formes de douleur
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#6b7c93" }}>
              Des lombalgies aux céphalées résistantes, en passant par les douleurs neuropathiques et pelviennes — chaque pathologie bénéficie d'un protocole adapté.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PATHOLOGIES.map((p) => (
              <div key={p.title} className="p-6 rounded-2xl transition-all hover:-translate-y-1 cursor-default"
                style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(26,58,92,0.06)" }}>
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7c93" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAITEMENTS */}
      <section id="traitements" className="py-24" style={{ background: "#1a3a5c" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#3bb5a6" }}>Techniques interventionnelles</div>
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Des traitements de pointe
            </h2>
            <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: "#a8c4d8" }}>
              L'ITID propose les techniques interventionnelles les plus avancées, guidées par imagerie, pour une efficacité maximale sur les douleurs résistantes aux traitements conventionnels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRAITEMENTS.map((t) => (
              <div key={t.num} className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-bold" style={{ color: "#3bb5a6" }}>{t.num}</span>
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm" style={{ fontFamily: "var(--font-display)" }}>{t.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#8fb3d0" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE */}
      <section id="equipe" className="py-24" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Équipe</div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
              Une équipe pluridisciplinaire à votre service
            </h2>
            <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: "#6b7c93" }}>
              Médecins, infirmières, psychologues et thérapeutes — tous engagés dans une prise en charge globale de la douleur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM_ROLES.map((t) => (
              <div key={t.role} className="flex gap-4 items-start p-5 rounded-2xl"
                style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(26,58,92,0.05)" }}>
                <div className="text-3xl shrink-0">{t.icon}</div>
                <div>
                  <div className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t.role}</div>
                  <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6b7c93" }}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IA */}
      <section id="ia" className="py-20" style={{ background: "#f0f7f6" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Intelligence artificielle</div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                L'IA au service de votre suivi
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#6b7c93" }}>
                Notre assistant intelligent est disponible en dehors des heures de consultation pour répondre à vos questions, vous orienter et faciliter votre suivi entre les séances à l'ITID.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "💬", title: "Chatbot médical 24h/24", desc: "Réponses fiables sur les soins, la prise de RDV et les traitements proposés." },
                  { icon: "📋", title: "Orientation rapide", desc: "Identifiez la bonne spécialité et le bon professionnel au sein de l'équipe ITID." },
                  { icon: "🔒", title: "Sécurité des données", desc: "Hébergement conforme HDS, RGPD respecté." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: "#e8f4f2" }}>{item.icon}</div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#1a3a5c" }}>{item.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#6b7c93" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-medium" style={{ color: "#2a9d8f" }}>
                Essayez le chatbot IA → bouton 💬 en bas à droite
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "#fff", boxShadow: "0 4px 24px rgba(26,58,92,0.08)" }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ background: "#1a3a5c" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#2a9d8f" }}>IA</div>
                <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Assistant ITID</div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#2a9d8f" }} />
                  <span className="text-xs" style={{ color: "#8fb3d0" }}>En ligne</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { bot: true, text: "Bonjour ! Je suis l'assistant de l'ITID. Comment puis-je vous orienter ?" },
                  { bot: false, text: "J'ai des douleurs chroniques dans le bas du dos depuis 3 ans." },
                  { bot: true, text: "Je comprends. L'ITID est spécialisé dans ce type de pathologie. Avez-vous déjà consulté un spécialiste, ou souhaitez-vous un premier rendez-vous d'évaluation ?" },
                  { bot: false, text: "Mon médecin m'a orienté vers vous." },
                  { bot: true, text: "Parfait. Vous pouvez prendre rendez-vous directement via Doctolib ou appeler le 03 51 53 20 26. Souhaitez-vous d'autres informations sur nos traitements ?" },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.bot ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                      style={m.bot
                        ? { background: "#f0f7f6", color: "#1a3a5c", border: "1px solid #d8ede9" }
                        : { background: "#1a3a5c", color: "#fff" }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMATIONS */}
      <section id="formations" className="py-24" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
            <div>
              <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Formations vidéo</div>
              <h2 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Apprenez à votre rythme</h2>
              <p className="text-sm mt-2" style={{ color: "#6b7c93" }}>Pour les professionnels de santé et le grand public — par les experts de l'ITID.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FORMATIONS.map((f) => (
              <div key={f.title} className="rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1"
                style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(26,58,92,0.06)" }}>
                <div className="relative h-48" style={{ background: "#1a3a5c" }}>
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(42,157,143,0.9)", color: "#fff" }}>
                    {f.tag}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>▶</div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm mb-3 leading-snug" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{f.title}</h3>
                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: "#6b7c93" }}>
                    <span>🎬 {f.duration}</span>
                    <span>👤 {f.students} inscrits</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{f.price}</span>
                    <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#2a9d8f" }}>S'inscrire</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RÉSEAUX */}
      <section className="py-16" style={{ background: "#f0f7f6" }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Réseaux sociaux</div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Suivez l'ITID</h2>
          <p className="text-sm mb-8" style={{ color: "#6b7c93" }}>Actualités médicales, conseils et informations sur nos traitements — directement sur vos plateformes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://facebook.com/itid.france" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: "#1877F2" }}>
              Facebook — itid.france
            </a>
            <a href="https://linkedin.com/company/itid-france" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: "#0A66C2" }}>
              LinkedIn — ITID France
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24" style={{ background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
          <div>
            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Contact & RDV</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Nous contacter</h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color: "#6b7c93" }}>
              La prise en charge à l'ITID nécessite une orientation par votre médecin traitant ou un spécialiste. N'hésitez pas à nous contacter pour toute question.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: "📍", label: "Adresse", val: "25 avenue des Mailles\nSaint-Julien-les-Villas — 10800 TROYES\nEspace Médical de Spécialistes de Champagne" },
                { icon: "📞", label: "Téléphone", val: "03 51 53 20 26" },
                { icon: "🕒", label: "Horaires", val: "Lundi – Vendredi : 8h30 – 18h00\nSur rendez-vous uniquement" },
                { icon: "📅", label: "Prise de RDV", val: "Via Doctolib" },
              ].map((c) => (
                <div key={c.label} className="flex gap-3 items-start">
                  <span className="text-base shrink-0 mt-0.5">{c.icon}</span>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#2a9d8f" }}>{c.label}</div>
                    <div className="text-sm whitespace-pre-line" style={{ color: "#4a5568" }}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <a href="https://www.doctolib.fr" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#2a9d8f" }}>
              📅 Prendre RDV sur Doctolib
            </a>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(26,58,92,0.08)" }}>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Message envoyé !</h3>
                <p className="text-sm" style={{ color: "#6b7c93" }}>Nous vous répondrons dans les 24 heures ouvrées.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Envoyer un message</h3>
                {[
                  { name: "name" as const, label: "Nom complet", type: "text", placeholder: "Jean Dupont" },
                  { name: "email" as const, label: "Email", type: "email", placeholder: "jean@exemple.fr" },
                  { name: "phone" as const, label: "Téléphone", type: "tel", placeholder: "06 12 34 56 78" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>{f.label}</label>
                    <input type={f.type} required placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "#f7f4ef", border: "1px solid var(--border)", color: "#1a3a5c" }}
                      value={formData[f.name]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Message</label>
                  <textarea required rows={4} placeholder="Votre question ou motif de contact…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#f7f4ef", border: "1px solid var(--border)", color: "#1a3a5c" }}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#1a3a5c" }}>
                  Envoyer
                </button>
                <p className="text-xs text-center" style={{ color: "#6b7c93" }}>Données protégées — RGPD</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f2440", color: "#8fb3d0" }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "#2a9d8f" }}>IT</div>
              <span className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }}>ITID France</span>
            </div>
            <p className="text-xs leading-relaxed mb-3">
              Institut du Traitement Interventionnel de la Douleur — Troyes, Aube.
            </p>
            <p className="text-xs" style={{ color: "#5a7a98" }}>Espace Médical de Spécialistes de Champagne</p>
          </div>

          {[
            { title: "Pathologies", links: ["Lombalgies & sciatiques", "Douleurs neuropathiques", "SDRC / Algodystrophie", "Douleurs pelviennes", "Migraines résistantes"] },
            { title: "Traitements", links: ["Infiltrations", "Perfusions de lidocaïne", "Neuromodulation", "Cryoneurolyse", "Hypnose médicale"] },
            { title: "Cabinet", links: ["Présentation", "Équipe médicale", "Formations vidéo", "Mentions légales", "Politique de confidentialité"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-white text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-xs transition-colors hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span>© 2025 ITID France — Tous droits réservés</span>
          <span style={{ color: "#5a7a98" }}>25 av. des Mailles, 10800 TROYES — 03 51 53 20 26</span>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
