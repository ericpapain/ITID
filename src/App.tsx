import { useState, useRef, useEffect } from "react";
import logo from "./logos/logo ITID 3.png";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { HumanModel } from "./components/three/HumanModel";
import { AssistantIA } from "./components/AssistantIA";
import { MedicalCard, TreatmentCard } from "./components/Cards";
import { useAnatomyStore } from "./store/anatomyStore";
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube, FaMapSigns, FaStethoscope, FaClipboardCheck, FaSyncAlt, FaChevronDown } from "react-icons/fa";
import {
  NAV_LINKS, PATHOLOGIES, TRAITEMENTS, TEAM_ROLES, PARCOURS,
  CATEGORIES_FORMATIONS, Video, Category
} from "./data";

interface Message {
  role: "user" | "bot";
  text: string;
}

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

const ITID_IMAGES = [
  "img.jpg",
  "imo.webp",
  "rf.jpg",
  "rrty.webp",
  "sdfgd.webp",
  "ssdf.webp",
  "zyz.webp"
];

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
  const [teamFilter, setTeamFilter] = useState("Tous");
  const [pathoFilter, setPathoFilter] = useState("");
  const [traitFilter, setTraitFilter] = useState("");
  const [formData, setFormData] = useState({ category: "Patient", name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<Video | null>(null);
  const [checkoutVideo, setCheckoutVideo] = useState<Video | null>(null);
  const [formationMode, setFormationMode] = useState<"3d" | "classic">("3d");
  const [formationFilter, setFormationFilter] = useState("Tous");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"patient" | "pro">("patient");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [cart, setCart] = useState<Video[]>([]);
  const [selectedSuggestedVideos, setSelectedSuggestedVideos] = useState<Video[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartCheckoutModal, setShowCartCheckoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [purchasedFormations, setPurchasedFormations] = useState<Video[]>([]);
  const [selectedPurchasedVideo, setSelectedPurchasedVideo] = useState<Video | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const selectedBodyPart = useAnatomyStore(state => state.selectedBodyPart);
  const selectedBodyParts = useAnatomyStore(state => state.selectedBodyParts);
  const isMultiSelect = useAnatomyStore(state => state.isMultiSelect);
  const setIsMultiSelect = useAnatomyStore(state => state.setIsMultiSelect);
  const location = useLocation();
  const navigate = useNavigate();

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        // On desktop, image is 350px width + 24px gap = 374px per step. On mobile, 80vw + 24px.
        // We'll calculate dynamic scroll amount based on first child.
        const firstChild = container.firstElementChild as HTMLElement;
        const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 374;

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const isFormationsUrl = pathParts[0] === 'formations';
  const urlCategorySlug = isFormationsUrl && pathParts.length > 1 ? pathParts[1] : null;
  const currentCategory = urlCategorySlug
    ? CATEGORIES_FORMATIONS.find(c => c.tag.toLowerCase().replace(/[^a-z0-9]+/g, '-') === urlCategorySlug)
    : selectedCategory;

  const handleCategoryClick = (cat: Category) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setSelectedVideoDetail(null);
      navigate('/formations/' + cat.tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const BODY_PART_LABELS: Record<string, string> = {
    head: "Tête",
    neck: "Cou",
    shoulder: "Épaule",
    elbow: "Coude",
    wrist_hand: "Poignet / Main",
    fingers: "Doigts",
    spine: "Rachis",
    back: "Dos",
    abdomen: "Abdomen",
    pelvis: "Bassin / Pelvis",
    hip: "Hanche",
    thigh: "Cuisse",
    knee: "Genou",
    ankle: "Cheville",
    toes: "Orteils"
  };

  const selectedBodyPartFr = selectedBodyPart ? BODY_PART_LABELS[selectedBodyPart] || selectedBodyPart : null;
  const selectedBodyPartsFr = selectedBodyParts.length > 0 ? selectedBodyParts.map(p => BODY_PART_LABELS[p] || p).join(" + ") : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#f0f7f6] flex items-center justify-center text-xl">🔐</div>
                <button onClick={() => setShowAuthModal(false)} className="text-[#6b7c93] hover:text-[#1a3a5c] text-xl font-bold">×</button>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                {authMode === "login" ? "Connexion" : "Créer un compte"}
              </h2>
              <p className="text-sm text-[#6b7c93] mb-8">
                {authMode === "login" ? "Connectez-vous pour accéder au catalogue de formations." : "Rejoignez-nous pour débloquer toutes les vidéos."}
              </p>

              <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); setShowAuthModal(false); }} className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                  <button type="button" onClick={() => setUserRole("patient")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userRole === "patient" ? "bg-white text-[#1a3a5c] shadow-sm" : "text-gray-500 hover:text-[#1a3a5c]"}`}>Patient</button>
                  <button type="button" onClick={() => setUserRole("pro")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userRole === "pro" ? "bg-white text-[#1a3a5c] shadow-sm" : "text-gray-500 hover:text-[#1a3a5c]"}`}>Pro de santé</button>
                </div>
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-[#1a3a5c] mb-1">Nom complet</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder={userRole === "pro" ? "Dr. Dupont" : "Jean Dupont"} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#1a3a5c] mb-1">Adresse E-mail</label>
                  <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1a3a5c] mb-1">Mot de passe</label>
                  <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full py-4 mt-4 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#2a9d8f" }}>
                  {authMode === "login" ? "Se connecter" : "S'inscrire maintenant"}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
              <span className="text-sm text-[#6b7c93]">
                {authMode === "login" ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              </span>
              <button
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                className="ml-2 text-sm font-bold text-[#2a9d8f] hover:underline"
              >
                {authMode === "login" ? "Créer un compte" : "Se connecter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#f0f7f6] flex items-center justify-center text-xl">🛒</div>
                <button onClick={() => setShowCartModal(false)} className="text-[#6b7c93] hover:text-[#1a3a5c] text-xl font-bold">×</button>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                Mon Panier
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#6b7c93] mb-4">Votre panier est vide.</p>
                  <button onClick={() => setShowCartModal(false)} className="px-6 py-3 bg-gray-100 text-[#1a3a5c] font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Explorer les formations
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <img src={item.img} alt={item.title} className="w-20 h-14 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-bold text-[#1a3a5c] text-sm line-clamp-2">{item.title}</h4>
                        <div className="text-xs text-[#6b7c93] mt-1">{item.duration}</div>
                      </div>
                      <div className="font-bold text-[#2a9d8f]">{item.price}</div>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-2">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#6b7c93] font-semibold">Total à régler</span>
                  <span className="text-2xl font-bold text-[#1a3a5c]">
                    {cart.reduce((acc, item) => {
                      const priceVal = parseFloat(item.price.replace(/[^0-9,.-]/g, '').replace(',', '.'));
                      return acc + (isNaN(priceVal) ? 0 : priceVal);
                    }, 0)} €
                  </span>
                </div>
                <button onClick={() => { setShowCartModal(false); setShowCartCheckoutModal(true); }} className="w-full py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 shadow-lg" style={{ background: "#2a9d8f" }}>
                  Passer la commande
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CART CHECKOUT MODAL */}
      {showCartCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowCartCheckoutModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10">✕</button>

            <div className="p-6 border-b border-gray-100 bg-[#f0f7f6]">
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#2a9d8f" }}>Finaliser la commande</div>
              <h3 className="text-base font-semibold leading-snug" style={{ color: "#1a3a5c" }}>Achat de {cart.length} formation(s)</h3>
            </div>

            <div className="px-6 py-4 flex justify-between items-center text-sm font-semibold border-b border-gray-100">
              <span style={{ color: "#6b7c93" }}>Total à régler TTC</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                {cart.reduce((acc, item) => {
                  const priceVal = parseFloat(item.price.replace(/[^0-9,.-]/g, '').replace(',', '.'));
                  return acc + (isNaN(priceVal) ? 0 : priceVal);
                }, 0)} €
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="pt-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Informations de paiement</label>
                <div className="relative">
                  <input type="text" placeholder="Numéro de carte" className="w-full px-3 py-2.5 pl-10 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💳</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input type="text" placeholder="MM/AA" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                  <input type="text" placeholder="CVC" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                </div>
              </div>

              <button
                onClick={() => {
                  alert("Paiement validé avec succès !");
                  setPurchasedFormations(prev => {
                    const newFormations = cart.filter(c => !prev.some(p => p.id === c.id));
                    return [...prev, ...newFormations];
                  });
                  setCart([]);
                  setShowCartCheckoutModal(false);
                }}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                style={{ background: "#2a9d8f" }}
              >
                Payer
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-2">Paiement sécurisé. En cliquant sur "Payer", vous acceptez nos CGV.</p>
            </div>
          </div>
        </div>
      )}



      <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "Inter, system-ui, sans-serif" }}>

        {/* NAVBAR */}
        <header className="fixed top-0 left-0 right-0 z-40" style={{ background: "rgba(26,58,92,0.97)", backdropFilter: "blur(8px)" }}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-24">
            <a href="#" className="flex items-center gap-2.5">
              <img src={logo} alt="ITID Logo" className="w-16 h-16 rounded-full object-contain" />
              <div>
                <div className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>ITID France</div>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-6 xl:gap-10">
              <nav className="flex items-center gap-5 xl:gap-8">
                {NAV_LINKS.map((l) => {
                  const isActive = l.href === location.pathname || (l.href === '/' && location.pathname === '/' && !location.hash);
                  return (
                    <Link key={l.label} to={l.href} onClick={() => {
                      if (l.view !== 'home' || l.href === '/') { window.scrollTo(0, 0); }
                    }}
                      className={`text-base font-medium transition-colors ${isActive ? 'text-white' : ''}`}
                      style={{
                        color: isActive ? "#fff" : "#8fb3d0",
                        borderBottom: isActive ? "2px solid #2a9d8f" : "2px solid transparent",
                        paddingBottom: "4px"
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#8fb3d0"; }}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>



              <div className="flex items-center gap-2">
                <button onClick={handleContactClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                  <FaStethoscope className="text-xs" /> Contactez-nous
                </button>
              </div>
            </div>

            <button className="lg:hidden text-white text-4xl" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

          {menuOpen && (
            <div className="lg:hidden px-6 pb-6 pt-2 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((l) => {
                  const isActive = l.href === location.pathname || (l.href === '/' && location.pathname === '/' && !location.hash);
                  return (
                    <Link key={l.label} to={l.href}
                      className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : ''}`}
                      style={{ color: isActive ? "#fff" : "#c8dff0" }}
                      onClick={() => {
                        if (l.view !== 'home' || l.href === '/') { window.scrollTo(0, 0); }
                        setMenuOpen(false);
                      }}>
                      {l.label}
                    </Link>
                  );
                })}
              </div>


              <div className="flex flex-col gap-2 mt-2">
                <button onClick={handleContactClick} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold"
                  style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                  <FaStethoscope className="text-xs" /> Contactez-nous
                </button>
              </div>
            </div>
          )}
        </header>

        <Routes>
          <Route path="/" element={
            <>
              {/* HERO */}
              <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: "#0f2440" }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625134673337-519d4d10b313?w=1600&h=900&fit=crop&auto=format')" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f2440 55%, #1a3a5c80 100%)" }} />
                {/* Decorative Background Widgets */}
                <div className="absolute top-1/4 left-5 text-[10rem] md:text-[14rem] opacity-5 transition-all duration-700 hover:opacity-20 hover:scale-110 hover:-translate-y-8 cursor-default z-0 pointer-events-none">🏥</div>
                <div className="absolute bottom-10 right-10 md:right-20 text-[12rem] md:text-[18rem] opacity-5 transition-all duration-700 hover:opacity-20 hover:scale-110 hover:rotate-12 cursor-default z-0 pointer-events-none">🧬</div>

                <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center py-10">
                  <div className="pr-4 lg:pr-8 self-start lg:mt-12">
                    <div className="flex items-center gap-6 mb-4">
                      <img src={logo} alt="ITID Logo" className="w-32 h-32 md:w-48 md:h-48 rounded-full object-contain shrink-0" />
                      <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white min-w-[450px]" style={{ fontFamily: "var(--font-display)" }}>
                        Institut du Traitement{" "}
                        <em className="not-italic" style={{ color: "#2a9d8f" }}>Interventionnel de la Douleur</em>
                      </h1>
                    </div>

                    <p className="text-lg leading-relaxed mb-8" style={{ color: "#a8c4d8", maxWidth: 520 }}>
                      Centre spécialisé à Troyes accompagnant les patients souffrant de douleurs chroniques et aiguës, avec des techniques interventionnelles de pointe et une approche pluridisciplinaire.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <a href="https://www.doctolib.fr" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#2a9d8f" }}>
                        Prendre RDV sur Doctolib →
                      </a>
                      <a href="tel:0351532026"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:bg-white/10"
                        style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                        📞 03 51 53 20 26
                      </a>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-8">
                      {[
                        { val: "6 spécialités", label: "de douleur prises en charge" },
                        { val: "12 praticiens", label: "dans l'équipe pluridisciplinaire" },
                        { val: "3 000+", label: "patients suivis par an" },
                        { val: "Troyes", label: "25 av. des Mailles, 10800" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.val}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#8fb3d0" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:block relative w-full self-start lg:mt-12">
                    <div className="rounded-3xl p-8 w-full max-w-md relative overflow-hidden group" style={{ background: "rgba(20, 30, 50, 0.6)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>

                      {/* Decorative blur blobs */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2a9d8f] rounded-full mix-blend-overlay filter blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3bb5a6] rounded-full mix-blend-overlay filter blur-[50px] opacity-10"></div>

                      <style>
                        {`
                    @keyframes staggerFadeUp {
                      0% { opacity: 0; transform: translateY(20px); filter: blur(4px); }
                      100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                    }
                    @keyframes floatIcon {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-3px); }
                    }
                    @keyframes arrowSequence {
                      0%, 100% { opacity: 0; }
                      50% { opacity: 1; text-shadow: 0 0 8px rgba(72, 209, 194, 0.8); }
                    }
                    @keyframes colorCycle {
                      0%, 20% { color: #48d1c2; text-shadow: 0 0 10px rgba(72, 209, 194, 0.6); }
                      40%, 100% { color: white; text-shadow: none; }
                    }
                    @keyframes arrowSetVisibility {
                      0%, 25% { opacity: 1; }
                      26%, 100% { opacity: 0; }
                    }
                    .anim-step {
                      opacity: 0;
                      animation: staggerFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .anim-float {
                      animation: floatIcon 3s ease-in-out infinite;
                    }
                    .text-cycle {
                      animation: colorCycle 12s infinite;
                    }
                    .arrow-set {
                      opacity: 0;
                      animation: arrowSetVisibility 12s infinite;
                    }
                    .arrow-seq-1 { animation: arrowSequence 1s infinite; animation-delay: 0s; }
                    .arrow-seq-2 { animation: arrowSequence 1s infinite; animation-delay: 0.15s; }
                    .arrow-seq-3 { animation: arrowSequence 1s infinite; animation-delay: 0.3s; }
                    .arrow-seq-4 { animation: arrowSequence 1s infinite; animation-delay: 0.45s; }
                    .arrow-seq-5 { animation: arrowSequence 1s infinite; animation-delay: 0.6s; }
                    .arrow-seq-6 { animation: arrowSequence 1s infinite; animation-delay: 0.75s; }
                  `}
                      </style>

                      <div className="text-white font-bold mb-8 text-lg tracking-wide uppercase flex items-center gap-3 anim-step" style={{ fontFamily: "var(--font-display)", color: "#48d1c2", animationDelay: "0.1s" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        Votre parcours chez nous
                      </div>

                      <div className="relative z-10">
                        {[
                          { step: '01', icon: <FaMapSigns />, title: 'Orientation médicale', desc: 'Adressé par votre médecin traitant ou un spécialiste.' },
                          { step: '02', icon: <FaStethoscope />, title: 'Consultation d\'évaluation', desc: 'Bilan complet avec un médecin algologue.' },
                          { step: '03', icon: <FaClipboardCheck />, title: 'Plan de traitement', desc: 'Protocole personnalisé, co-construit avec l\'équipe.' },
                          { step: '04', icon: <FaSyncAlt />, title: 'Suivi & réévaluation', desc: 'Ajustements réguliers pour une prise en charge optimale.' }
                        ].map((p, i) => (
                          <div key={p.step} className="anim-step relative flex gap-6 items-center mb-2 last:mb-0 group/step cursor-default" style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
                            <div className="relative anim-float shrink-0" style={{ animationDelay: `${i * 0.5}s` }}>
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 text-white shadow-xl transition-transform duration-300 group-hover/step:scale-110 group-hover/step:bg-[#3bb5a6] relative z-10" style={{ background: "linear-gradient(135deg, #2a9d8f 0%, #1a7a6f 100%)" }}>
                                {p.icon}
                              </div>
                              {/* Glow behind the bubble */}
                              <div className="absolute inset-0 rounded-full bg-[#2a9d8f] blur-md opacity-20 group-hover/step:opacity-70 transition-opacity duration-300"></div>

                              {/* Flowing downward 6 arrows bridging to next widget */}
                              {i < 3 && (
                                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex flex-col items-center arrow-set -z-10" style={{ animationDelay: `${i * 3}s` }}>
                                  <FaChevronDown className="text-[#48d1c2] text-xl -mb-2 arrow-seq-1" />
                                  <FaChevronDown className="text-[#48d1c2] text-xl -mb-2 arrow-seq-2" />
                                  <FaChevronDown className="text-[#48d1c2] text-xl -mb-2 arrow-seq-3" />
                                  <FaChevronDown className="text-[#48d1c2] text-xl -mb-2 arrow-seq-4" />
                                  <FaChevronDown className="text-[#48d1c2] text-xl -mb-2 arrow-seq-5" />
                                  <FaChevronDown className="text-[#48d1c2] text-xl arrow-seq-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 pt-1 pb-4 transition-colors">
                              <div className="font-bold text-white text-lg mb-1 transition-colors text-cycle group-hover/step:text-[#48d1c2]" style={{ animationDelay: `${i * 3}s` }}>
                                <span className="text-[#2a9d8f] mr-2">{p.step}.</span>
                                {p.title}
                              </div>
                              <div className="text-sm leading-relaxed" style={{ color: "#8fb3d0" }}>{p.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* IA Assistant */}
                      <div className="anim-step mt-6 relative overflow-hidden rounded-2xl p-4 flex items-start gap-4 transition-transform duration-500 hover:-translate-y-1" style={{ background: "linear-gradient(135deg, rgba(42,157,143,0.15) 0%, rgba(42,157,143,0.05) 100%)", border: "1px solid rgba(42,157,143,0.3)", animationDelay: "1.2s" }}>
                        <div className="absolute -right-4 -top-4 text-6xl opacity-10 blur-[2px]">🤖</div>
                        <div className="relative z-10 w-10 h-10 rounded-full bg-[#2a9d8f]/20 flex items-center justify-center text-xl shrink-0 border border-[#2a9d8f]/30 shadow-inner">
                          🤖
                        </div>
                        <div className="relative z-10">
                          <div className="text-sm font-bold mb-1" style={{ color: "#48d1c2" }}>Assistant IA 24/7</div>
                          <div className="text-xs leading-relaxed" style={{ color: "#a0c4e0" }}>Posez vos questions entre les consultations, suivi en temps réel.</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* CENTRE */}
              <section id="centre" className="relative py-10 overflow-hidden" style={{ background: "var(--background)" }}>
                <div className="absolute top-20 right-10 text-[12rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-rotate-12 cursor-default z-0">🩺</div>
                <div className="absolute bottom-10 left-10 md:left-20 text-[10rem] md:text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-6 cursor-default z-0">⚕️</div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
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

              {/* PATHOLOGIES SUMMARY */}
              <section id="pathologies" className="relative py-12 overflow-hidden" style={{ background: "#f0f7f6" }}>
                <div className="absolute top-10 left-10 text-[12rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:rotate-12 cursor-default z-0">🧠</div>
                <div className="absolute bottom-20 right-10 text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-8 cursor-default z-0">🦴</div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Pathologies traitées</div>
                    <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                      Nous prenons en charge toutes les formes de douleur
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "#6b7c93" }}>
                      Des lombalgies aux céphalées résistantes, en passant par les douleurs neuropathiques et pelviennes — chaque pathologie bénéficie d'un protocole adapté.
                    </p>
                    <Link
                      to="/pathologies"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: "#2a9d8f", color: "#fff" }}
                    >
                      Découvrir nos pathologies traitées →
                    </Link>
                  </div>
                  <div className="relative h-[400px] flex items-center justify-center">
                    <div className="absolute w-52 h-64 rounded-2xl shadow-xl border flex flex-col items-center justify-center transform -rotate-12 -translate-x-24 transition-all duration-300 hover:-rotate-12 hover:scale-110 hover:z-30 cursor-default" style={{ background: "#fdf8f5", borderColor: "#e9c46a80" }}>
                      <div className="text-5xl mb-3">🏥</div>
                      <div className="font-semibold text-sm text-center" style={{ color: "#1a3a5c" }}>Douleurs pelviennes</div>
                    </div>
                    <div className="absolute w-52 h-64 rounded-2xl shadow-xl border flex flex-col items-center justify-center transform rotate-12 translate-x-24 transition-all duration-300 hover:rotate-12 hover:scale-110 hover:z-30 cursor-default" style={{ background: "#fff8ec", borderColor: "#f4a26180" }}>
                      <div className="text-5xl mb-3">🦵</div>
                      <div className="font-semibold text-sm text-center" style={{ color: "#1a3a5c" }}>Douleurs articulaires</div>
                    </div>
                    <div className="absolute w-52 h-64 rounded-2xl shadow-xl border flex flex-col items-center justify-center transform -rotate-6 -translate-x-12 translate-y-4 z-10 transition-all duration-300 hover:-rotate-6 hover:scale-110 hover:z-30 cursor-default" style={{ background: "#f0fdfa", borderColor: "#48d1c280" }}>
                      <div className="text-5xl mb-3">🦴</div>
                      <div className="font-semibold text-sm text-center" style={{ color: "#1a3a5c" }}>Lombalgies</div>
                    </div>
                    <div className="absolute w-52 h-64 rounded-2xl shadow-xl border flex flex-col items-center justify-center transform rotate-6 translate-x-12 translate-y-4 z-10 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:z-30 cursor-default" style={{ background: "#f1f5f9", borderColor: "#26465380" }}>
                      <div className="text-5xl mb-3">🧠</div>
                      <div className="font-semibold text-sm text-center" style={{ color: "#1a3a5c" }}>Migraines</div>
                    </div>
                    <div className="absolute w-52 h-64 rounded-2xl shadow-2xl border flex flex-col items-center justify-center z-20 transition-all duration-300 hover:scale-110 hover:z-30 cursor-default" style={{ background: "#f0fbfa", borderColor: "#2a9d8f80" }}>
                      <div className="text-5xl mb-3">⚡</div>
                      <div className="font-semibold text-sm text-center" style={{ color: "#1a3a5c" }}>Neuropathies</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* TRAITEMENTS SUMMARY */}
              <section id="traitements" className="relative py-12 overflow-hidden" style={{ background: "#1a3a5c" }}>
                <div className="absolute top-1/3 left-10 text-[12rem] opacity-5 transition-all duration-700 hover:opacity-20 hover:scale-110 hover:rotate-12 cursor-default z-0">🎯</div>
                <div className="absolute bottom-10 right-10 md:right-1/4 text-[14rem] opacity-5 transition-all duration-700 hover:opacity-20 hover:scale-110 hover:-translate-y-10 cursor-default z-0">🩸</div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#3bb5a6" }}>Techniques interventionnelles</div>
                    <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                      Des traitements de pointe
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "#a8c4d8" }}>
                      L'ITID propose les techniques interventionnelles les plus avancées, guidées par imagerie, pour une efficacité maximale sur les douleurs résistantes aux traitements conventionnels.
                    </p>
                    <Link
                      to="/traitements"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: "#3bb5a6", color: "#fff" }}
                    >
                      Découvrir nos traitements →
                    </Link>
                  </div>
                  <div className="relative h-[500px] flex items-center justify-center">
                    <div className="absolute w-72 h-40 bg-[#2a9d8f]/20 backdrop-blur-md rounded-2xl border border-[#2a9d8f]/40 flex flex-col justify-center px-10 transform -rotate-12 -translate-y-24 transition-all duration-300 hover:-rotate-12 hover:scale-110 hover:bg-[#2a9d8f]/40 hover:z-30 cursor-default">
                      <div className="text-4xl mb-2">🩸</div>
                      <div className="font-semibold text-lg text-white">PRP</div>
                    </div>
                    <div className="absolute w-72 h-40 bg-[#3bb5a6]/20 backdrop-blur-md rounded-2xl border border-[#3bb5a6]/40 flex flex-col justify-center px-10 transform rotate-12 translate-y-24 transition-all duration-300 hover:rotate-12 hover:scale-110 hover:bg-[#3bb5a6]/40 hover:z-30 cursor-default">
                      <div className="text-4xl mb-2">💉</div>
                      <div className="font-semibold text-lg text-white">Toxine botulique</div>
                    </div>
                    <div className="absolute w-72 h-40 bg-[#2a9d8f]/20 backdrop-blur-md rounded-2xl border border-[#2a9d8f]/40 flex flex-col justify-center px-10 transform rotate-6 translate-y-12 translate-x-16 z-10 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:bg-[#2a9d8f]/40 hover:z-30 cursor-default">
                      <div className="text-4xl mb-2">🎯</div>
                      <div className="font-semibold text-lg text-white">Infiltrations ciblées</div>
                    </div>
                    <div className="absolute w-72 h-40 bg-[#3bb5a6]/20 backdrop-blur-md rounded-2xl border border-[#3bb5a6]/40 flex flex-col justify-center px-10 transform -rotate-6 -translate-y-10 -translate-x-16 z-10 transition-all duration-300 hover:-rotate-6 hover:scale-110 hover:bg-[#3bb5a6]/40 hover:z-30 cursor-default">
                      <div className="text-4xl mb-2">⚡</div>
                      <div className="font-semibold text-lg text-white">Neuromodulation</div>
                    </div>
                    <div className="absolute w-72 h-40 bg-[#2a9d8f]/30 backdrop-blur-md rounded-2xl border border-[#2a9d8f]/50 flex flex-col justify-center px-10 z-20 shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#2a9d8f]/50 hover:z-30 cursor-default">
                      <div className="text-4xl mb-2">🔥</div>
                      <div className="font-semibold text-lg text-white">Radiofréquence</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ÉQUIPE SUMMARY */}
              <section id="equipe" className="relative py-12 overflow-hidden" style={{ background: "var(--background)" }}>
                <div className="absolute top-10 right-10 md:right-20 text-[12rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-rotate-12 cursor-default z-0">🤝</div>
                <div className="absolute bottom-20 left-10 text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-8 cursor-default z-0">👨‍⚕️</div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="order-2 md:order-1 relative h-[500px] flex items-center justify-center">
                    <div className="absolute w-56 h-64 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center transform -rotate-12 -translate-x-24 -translate-y-16 transition-all duration-300 hover:-rotate-12 hover:scale-110 hover:z-30 cursor-default" style={{ background: "linear-gradient(135deg, #e8f4f2 0%, #f0f7f6 100%)" }}>
                      <div className="text-6xl mb-4">👨‍⚕️</div>
                      <div className="font-semibold text-base text-center" style={{ color: "#1a3a5c" }}>Médecins</div>
                    </div>
                    <div className="absolute w-56 h-64 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center transform rotate-12 translate-x-24 -translate-y-16 transition-all duration-300 hover:rotate-12 hover:scale-110 hover:z-30 cursor-default" style={{ background: "linear-gradient(135deg, #e6f3ff 0%, #f0f7ff 100%)" }}>
                      <div className="text-6xl mb-4">👩‍⚕️</div>
                      <div className="font-semibold text-base text-center" style={{ color: "#1a3a5c" }}>Infirmiers</div>
                    </div>
                    <div className="absolute w-56 h-64 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center transform -rotate-6 -translate-x-16 translate-y-12 z-10 transition-all duration-300 hover:-rotate-6 hover:scale-110 hover:z-30 cursor-default" style={{ background: "linear-gradient(135deg, #fff3e6 0%, #fff8f0 100%)" }}>
                      <div className="text-6xl mb-4">💆</div>
                      <div className="font-semibold text-base text-center" style={{ color: "#1a3a5c" }}>Thérapeutes</div>
                    </div>
                    <div className="absolute w-56 h-64 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center transform rotate-6 translate-x-16 translate-y-12 z-10 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:z-30 cursor-default" style={{ background: "linear-gradient(135deg, #f3e6ff 0%, #f8f0ff 100%)" }}>
                      <div className="text-6xl mb-4">📞</div>
                      <div className="font-semibold text-base text-center" style={{ color: "#1a3a5c" }}>Secrétaires</div>
                    </div>
                    <div className="absolute w-56 h-64 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center justify-center z-20 transition-all duration-300 hover:scale-110 hover:z-30 cursor-default" style={{ background: "linear-gradient(135deg, #fffae6 0%, #fffdf0 100%)" }}>
                      <div className="text-6xl mb-4">🧠</div>
                      <div className="font-semibold text-base text-center" style={{ color: "#1a3a5c" }}>Psychologues</div>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Équipe</div>
                    <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                      Une équipe pluridisciplinaire à votre service
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "#6b7c93" }}>
                      Médecins, infirmières, psychologues et thérapeutes — tous engagés dans une prise en charge globale de la douleur.
                    </p>
                    <Link
                      to="/equipe"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: "#2a9d8f", color: "#fff" }}
                    >
                      Rencontrer l'équipe →
                    </Link>
                  </div>
                </div>
              </section>

              {/* IA SUMMARY */}
              <section id="ia" className="relative py-10 overflow-hidden" style={{ background: "#f0f7f6" }}>
                <div className="absolute top-20 right-10 text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:rotate-12 cursor-default z-0">🤖</div>
                <div className="absolute bottom-10 left-10 md:left-1/4 text-[10rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-8 cursor-default z-0">💻</div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center relative z-10">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Intelligence artificielle</div>
                    <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                      L'IA au service de votre suivi
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "#6b7c93" }}>
                      Notre assistant intelligent est disponible en dehors des heures de consultation pour répondre à vos questions, vous orienter et faciliter votre suivi entre les séances à l'ITID.
                    </p>
                    <Link
                      to="/ia"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: "#2a9d8f", color: "#fff" }}
                    >
                      Essayer notre assistant IA →
                    </Link>
                  </div>
                  <div className="relative h-[500px] flex items-center justify-center">
                    <div className="absolute w-96 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-5 transform -rotate-3 -translate-y-32 -translate-x-12 transition-all duration-300 hover:-rotate-3 hover:scale-105 hover:z-30 cursor-default">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ background: "#2a9d8f" }}>IA</div>
                      <div className="text-lg font-medium" style={{ color: "#1a3a5c" }}>Bonjour ! Comment puis-je vous aider ?</div>
                    </div>
                    <div className="absolute w-96 p-6 bg-[#1a3a5c] rounded-2xl shadow-xl flex items-center justify-end transform rotate-2 -translate-y-12 translate-x-12 z-10 transition-all duration-300 hover:rotate-2 hover:scale-105 hover:z-30 cursor-default">
                      <div className="text-lg font-medium text-white text-right">J'ai des douleurs au dos.</div>
                    </div>
                    <div className="absolute w-96 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-5 transform -rotate-2 translate-y-8 -translate-x-12 z-10 transition-all duration-300 hover:-rotate-2 hover:scale-105 hover:z-30 cursor-default">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ background: "#2a9d8f" }}>IA</div>
                      <div className="text-lg font-medium" style={{ color: "#1a3a5c" }}>L'ITID est spécialisé dans cela.</div>
                    </div>
                    <div className="absolute w-96 p-6 bg-[#1a3a5c] rounded-2xl shadow-xl flex items-center justify-end transform rotate-3 translate-y-28 translate-x-12 z-20 transition-all duration-300 hover:rotate-3 hover:scale-105 hover:z-30 cursor-default">
                      <div className="text-lg font-medium text-white text-right">Comment prendre RDV ?</div>
                    </div>
                    <div className="absolute w-96 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-5 transform -rotate-1 translate-y-48 -translate-x-12 z-20 transition-all duration-300 hover:-rotate-1 hover:scale-105 hover:z-30 cursor-default">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ background: "#2a9d8f" }}>IA</div>
                      <div className="text-lg font-medium" style={{ color: "#1a3a5c" }}>Directement sur Doctolib !</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FORMATIONS SUMMARY */}
              <section id="formations" className="relative py-12 overflow-hidden" style={{ background: "var(--background)" }}>
                <div className="absolute top-10 left-10 md:left-20 text-[12rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-rotate-12 cursor-default z-0">📚</div>
                <div className="absolute bottom-20 right-10 text-[14rem] opacity-[0.03] transition-all duration-700 hover:opacity-10 hover:scale-110 hover:-translate-y-8 cursor-default z-0">🎓</div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="order-2 md:order-1 relative h-[500px] flex items-center justify-center">
                    <div className="absolute w-72 h-48 bg-[#1a3a5c] rounded-2xl shadow-xl border-4 border-white overflow-hidden transform -rotate-12 -translate-x-24 -translate-y-16 transition-all duration-300 hover:-rotate-12 hover:scale-110 hover:z-30 cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1758691462749-a95ce1bd7f96?w=600&h=380&fit=crop&auto=format&q=80" alt="video" className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl">▶</div></div>
                    </div>
                    <div className="absolute w-72 h-48 bg-[#1a3a5c] rounded-2xl shadow-xl border-4 border-white overflow-hidden transform rotate-12 translate-x-24 -translate-y-16 transition-all duration-300 hover:rotate-12 hover:scale-110 hover:z-30 cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=600&h=380&fit=crop&auto=format&q=80" alt="video" className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl">▶</div></div>
                    </div>
                    <div className="absolute w-72 h-48 bg-[#1a3a5c] rounded-2xl shadow-xl border-4 border-white overflow-hidden transform -rotate-6 -translate-x-12 translate-y-16 z-10 transition-all duration-300 hover:-rotate-6 hover:scale-110 hover:z-30 cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1758691462749-a95ce1bd7f96?w=600&h=380&fit=crop&auto=format&q=80" alt="video" className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl">▶</div></div>
                    </div>
                    <div className="absolute w-72 h-48 bg-[#1a3a5c] rounded-2xl shadow-xl border-4 border-white overflow-hidden transform rotate-6 translate-x-12 translate-y-16 z-10 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:z-30 cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1758691463620-188ca7c1a04f?w=600&h=380&fit=crop&auto=format&q=80" alt="video" className="w-full h-full object-cover opacity-80 transition-opacity hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl">▶</div></div>
                    </div>
                    <div className="absolute w-72 h-48 bg-[#1a3a5c] rounded-2xl shadow-2xl border-4 border-white overflow-hidden z-20 transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
                      <img src={CATEGORIES_FORMATIONS[0].videos[0].img} alt="video" className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 bg-[#2a9d8f]/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl shadow-lg">▶</div></div>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Catalogues de formations</div>
                    <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Apprenez à votre rythme</h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "#6b7c93" }}>
                      Explorez nos 3 catalogues complets, regroupant de multiples vidéos par catégorie pour les professionnels et le grand public.
                    </p>
                    <Link
                      to="/formations"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: "#2a9d8f", color: "#fff" }}
                    >
                      Accéder aux formations →
                    </Link>
                  </div>
                </div>
              </section>

              {/* CHECKOUT MODAL */}
              {checkoutVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,36,64,0.7)", backdropFilter: "blur(4px)" }}>
                  <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                    <button onClick={() => setCheckoutVideo(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10">✕</button>

                    <div className="p-6 border-b border-gray-100 bg-[#f0f7f6]">
                      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#2a9d8f" }}>Finaliser l'inscription</div>
                      <h3 className="text-base font-semibold leading-snug" style={{ color: "#1a3a5c" }}>{checkoutVideo.title}</h3>
                    </div>

                    <div className="px-6 py-4 flex justify-between items-center text-sm font-semibold border-b border-gray-100">
                      <span style={{ color: "#6b7c93" }}>Total à régler TTC</span>
                      <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{checkoutVideo.price}</span>
                    </div>

                    <div className="p-6 space-y-4">
                      {!isAuthenticated && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Adresse e-mail</label>
                            <input type="email" placeholder="votre@email.fr" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Création de mot de passe</label>
                            <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                          </div>
                        </>
                      )}
                      <div className="pt-2">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Informations de paiement</label>
                        <div className="relative">
                          <input type="text" placeholder="Numéro de carte" className="w-full px-3 py-2.5 pl-10 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💳</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <input type="text" placeholder="MM/AA" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                          <input type="text" placeholder="CVC" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                        </div>
                      </div>

                      <button
                        onClick={() => { alert("Paiement simulé avec succès ! Merci de votre inscription."); setCheckoutVideo(null); }}
                        className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                        style={{ background: "#2a9d8f" }}
                      >
                        Payer {checkoutVideo.price}
                      </button>

                      <p className="text-center text-[10px] text-gray-400 mt-2">Paiement sécurisé. En cliquant sur "Payer", vous acceptez nos CGV.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          } />

          <Route path="/pathologies" element={
            <div className="pt-32 pb-12 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link
                  to="/"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                >
                  ← Retour à l'accueil
                </Link>
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Toutes nos pathologies traitées</h2>
                  <p className="text-base leading-relaxed max-w-2xl mb-6" style={{ color: "#6b7c93" }}>
                    Découvrez en détail les syndromes pris en charge par l'Institut du Traitement Interventionnel de la Douleur.
                  </p>
                  <input 
                    type="text" 
                    placeholder="Rechercher une pathologie (ex: lombaire, pelvienne)..." 
                    value={pathoFilter}
                    onChange={(e) => setPathoFilter(e.target.value)}
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PATHOLOGIES.filter(p => p.title.toLowerCase().includes(pathoFilter.toLowerCase()) || p.desc.toLowerCase().includes(pathoFilter.toLowerCase())).map((p) => (
                    <MedicalCard key={p.title} {...p} />
                  ))}
                </div>
              </div>
            </div>
          } />

          <Route path="/traitements" element={
            <div className="pt-32 pb-12 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link
                  to="/"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                >
                  ← Retour à l'accueil
                </Link>
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Tous nos traitements</h2>
                  <p className="text-base leading-relaxed max-w-2xl mb-6" style={{ color: "#6b7c93" }}>
                    Découvrez en détail les techniques interventionnelles guidées par imagerie proposées par l'ITID.
                  </p>
                  <input 
                    type="text" 
                    placeholder="Rechercher un traitement (ex: infiltration, hypnose)..." 
                    value={traitFilter}
                    onChange={(e) => setTraitFilter(e.target.value)}
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TRAITEMENTS.filter(t => t.title.toLowerCase().includes(traitFilter.toLowerCase()) || t.desc.toLowerCase().includes(traitFilter.toLowerCase())).map((t) => (
                    <TreatmentCard key={t.title} {...t} />
                  ))}
                </div>
              </div>
            </div>
          } />

          <Route path="/equipe" element={
            <div className="pt-32 pb-12 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link
                  to="/"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                >
                  ← Retour à l'accueil
                </Link>
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>L'équipe ITID</h2>
                  <p className="text-base leading-relaxed max-w-2xl" style={{ color: "#6b7c93" }}>
                    Rencontrez nos médecins, infirmières, psychologues et thérapeutes engagés pour vous.
                  </p>
                </div>

                <div className="relative mb-10 max-w-xs">
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all appearance-none cursor-pointer bg-white"
                    style={{ color: "#1a3a5c" }}
                  >
                    {["Tous", ...Array.from(new Set(TEAM_ROLES.map(t => t.role)))].map(filter => (
                      <option key={filter} value={filter}>{filter === "Tous" ? "Toutes les spécialités" : filter}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {TEAM_ROLES.filter(t => teamFilter === "Tous" || t.role === teamFilter).map((t, i) => (
                    <div key={i} className="flex relative items-center p-6 md:p-8 rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100" style={{ background: i % 2 === 0 ? "linear-gradient(135deg, #f0f7f6 0%, #fff 100%)" : "linear-gradient(135deg, #f4f8fb 0%, #fff 100%)" }}>
                      <div className="absolute left-0 bottom-0 w-32 md:w-48 h-[110%] transition-transform duration-500 group-hover:scale-105" style={{ transformOrigin: "bottom left" }}>
                        <img src={t.img} alt="Doctor" className="w-full h-full object-contain object-bottom -ml-4" />
                      </div>
                      <div className="pl-28 md:pl-40 flex-1 relative z-10 py-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4 bg-white shadow-sm border border-gray-100">
                          {t.icon}
                        </div>
                        <div className="font-bold text-xl mb-3" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{t.role}</div>
                        <div className="text-sm md:text-base leading-relaxed" style={{ color: "#6b7c93" }}>{t.detail}</div>
                      </div>
                      <div className="absolute -bottom-8 -right-4 text-9xl opacity-[0.04] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none select-none z-0">
                        {t.icon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />

          <Route path="/ia" element={<AssistantIA isAuthenticated={isAuthenticated} userRole={userRole} setShowAuthModal={setShowAuthModal} />} />

          {["/formations", "/formations/:categoryId"].map(path => (
            <Route key={path} path={path} element={
              <>
                <div className="pt-32 pb-12 min-h-screen" style={{ background: "var(--background)" }}>
                  <div className="max-w-7xl mx-auto px-6">
                    {!currentCategory ? (
                      <>
                        <div className="flex justify-between items-center mb-8">
                          <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                          >
                            ← Retour à l'accueil
                          </Link>

                          {isAuthenticated && (
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => navigate('/mon-profil')}
                                className="flex items-center gap-2 text-sm font-bold text-[#1a3a5c] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-lg">👤</span> Mon Profil
                              </button>
                              <button
                                onClick={() => setShowCartModal(true)}
                                className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                                style={{ background: "#2a9d8f" }}
                              >
                                <span className="text-lg">🛒</span> Panier
                                {cart.length > 0 && (
                                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{cart.length}</span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                          <div>
                            <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Découverte</div>
                            <h2 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Nos Formations</h2>
                            <p className="text-sm mt-2" style={{ color: "#6b7c93" }}>Explorez nos catalogues complets ou trouvez une formation par zone anatomique.</p>
                          </div>

                          <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                            <button
                              onClick={() => setFormationMode("3d")}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formationMode === "3d" ? "bg-white text-[#1a3a5c] shadow-sm" : "text-[#6b7c93] hover:text-[#1a3a5c]"}`}
                            >
                              🧍 Modèle 3D
                            </button>
                            <button
                              onClick={() => setFormationMode("classic")}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formationMode === "classic" ? "bg-white text-[#1a3a5c] shadow-sm" : "text-[#6b7c93] hover:text-[#1a3a5c]"}`}
                            >
                              📚 Catalogue complet
                            </button>
                          </div>
                        </div>

                        {formationMode === "3d" ? (
                          <div className="grid lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 bg-gradient-to-br from-[#e8f4f2] to-[#f4f8fb] rounded-3xl overflow-hidden relative shadow-inner" style={{ height: "600px", border: "1px solid #e2e8f0" }}>
                              <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[10, 10, 10]} intensity={1.5} />
                                <directionalLight position={[-10, -10, -10]} intensity={0.5} />
                                <Environment preset="city" />
                                <HumanModel />
                                <OrbitControls enablePan={true} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={8} />
                              </Canvas>
                              <div className="absolute top-6 left-6 pointer-events-none">
                                <div className="text-[#1a3a5c] text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Anatomie Interactive</div>
                                <div className="text-sm font-semibold mt-1" style={{ color: "#2a9d8f" }}>Faites pivoter et cliquez sur une zone</div>
                              </div>
                              <div className="absolute top-6 right-6">
                                <label className="flex items-center gap-2 cursor-pointer bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-max transition-colors hover:bg-white">
                                  <input type="checkbox" checked={isMultiSelect} onChange={(e) => setIsMultiSelect(e.target.checked)} className="form-checkbox h-4 w-4 text-[#2a9d8f] rounded accent-[#2a9d8f]" />
                                  <span className="text-xs font-bold text-[#1a3a5c]">Sélection multiple</span>
                                </label>
                              </div>
                            </div>

                            <div className="lg:col-span-2 flex flex-col gap-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-bold text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                                  {selectedBodyPartsFr ? `Formations suggérées` : "Sélectionnez une zone"}
                                </h3>
                              </div>

                              {selectedBodyPartsFr && (
                                <div className="flex flex-col gap-2 mb-2">
                                  <div className="text-sm font-semibold text-[#2a9d8f] bg-[#f0f7f6] px-4 py-2 rounded-lg">
                                    Zones : {selectedBodyPartsFr}
                                  </div>
                                  <select
                                    value={formationFilter}
                                    onChange={(e) => setFormationFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-[#1a3a5c] focus:outline-none focus:border-[#2a9d8f] shadow-sm cursor-pointer"
                                  >
                                    <option value="Tous">Toutes les spécialités</option>
                                    <option value="Professionnel de santé">Médecins & Spécialistes</option>
                                    <option value="Grand public">Grand public</option>
                                    <option value="Infirmier·ère / Kiné">Paramédical</option>
                                  </select>
                                </div>
                              )}

                              {selectedBodyPartsFr ? (
                                <div className="flex flex-col h-full">
                                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                                    {CATEGORIES_FORMATIONS.filter(cat => formationFilter === "Tous" || cat.tag === formationFilter).flatMap(cat => cat.videos).slice(0, 4).map((video, idx) => {
                                      const isSelected = selectedSuggestedVideos.some(v => v.id === video.id);
                                      return (
                                        <div key={idx} className={`p-4 bg-white border ${isSelected ? 'border-[#2a9d8f] ring-1 ring-[#2a9d8f]' : 'border-gray-200'} rounded-2xl shadow-sm transition-all hover:shadow-md relative`}>
                                          <div className="flex gap-4">
                                            <img src={video.img} alt={video.title} className="w-24 h-20 object-cover rounded-xl shrink-0" />
                                            <div className="flex-1">
                                              <h4 className="font-bold text-[#1a3a5c] text-sm mb-1">{video.title}</h4>
                                              <p className="text-xs text-[#6b7c93] mb-2">{video.duration} • Focus : {selectedBodyPartsFr}</p>
                                              <div className="text-[#2a9d8f] font-bold text-sm">{video.price}</div>
                                            </div>
                                            <div className="flex items-center">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                  if (e.target.checked) setSelectedSuggestedVideos([...selectedSuggestedVideos, video]);
                                                  else setSelectedSuggestedVideos(selectedSuggestedVideos.filter(v => v.id !== video.id));
                                                }}
                                                className="form-checkbox h-5 w-5 text-[#2a9d8f] rounded accent-[#2a9d8f] cursor-pointer"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {selectedSuggestedVideos.length > 0 && (
                                    <button
                                      onClick={() => {
                                        if (!isAuthenticated) { setShowAuthModal(true); return; }
                                        setCart([...cart, ...selectedSuggestedVideos]);
                                        setSelectedSuggestedVideos([]);
                                      }}
                                      className="w-full py-4 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                                      style={{ background: "#2a9d8f" }}
                                    >
                                      🛒 Ajouter la sélection au panier ({selectedSuggestedVideos.length})
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-[#6b7c93] bg-gray-50/50">
                                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl mb-4 border border-gray-100">👆</div>
                                  <p className="text-sm font-medium">Interagissez avec le modèle 3D à gauche pour découvrir nos formations ciblées par zone anatomique.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-8">
                            {/* Filtre */}
                            <div className="flex justify-end mb-4">
                              <select
                                value={formationFilter}
                                onChange={(e) => setFormationFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-[#1a3a5c] focus:outline-none focus:border-[#2a9d8f] shadow-sm cursor-pointer"
                              >
                                <option value="Tous">Toutes les spécialités</option>
                                <option value="Professionnel de santé">Médecins & Spécialistes</option>
                                <option value="Grand public">Grand public</option>
                                <option value="Infirmier·ère / Kiné">Paramédical</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-16">
                              {CATEGORIES_FORMATIONS.filter(cat => formationFilter === "Tous" || cat.tag === formationFilter).map((cat) => (
                                <div key={cat.id} className="flex flex-col md:flex-row gap-10 lg:gap-16 items-center cursor-pointer group" onClick={() => handleCategoryClick(cat)}>

                                  <div className="relative w-full md:w-5/12 lg:w-1/3 shrink-0">
                                    <div className="absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-sm transform translate-y-3 translate-x-3 transition-transform group-hover:translate-y-4 group-hover:translate-x-4"></div>
                                    <div className="absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-sm transform translate-y-1.5 translate-x-1.5 transition-transform group-hover:translate-y-2 group-hover:translate-x-2"></div>

                                    <div className="relative h-64 md:h-72 bg-[#1a3a5c] rounded-3xl overflow-hidden z-10 shadow-md border border-gray-200">
                                      <img src={cat.videos[0].img} alt={cat.title} className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
                                      <div className="absolute bottom-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg" style={{ background: "#1a3a5c", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                                        {cat.videos.length} formations
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 flex flex-col justify-center">
                                    <div className="mb-3">
                                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(42,157,143,0.1)", color: "#2a9d8f" }}>
                                        {cat.tag}
                                      </span>
                                    </div>
                                    <h3 className="font-semibold text-2xl md:text-3xl mb-4 leading-snug transition-colors group-hover:text-[#2a9d8f]" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{cat.title}</h3>
                                    <p className="text-base md:text-lg mb-8" style={{ color: "#6b7c93", lineHeight: 1.6 }}>{cat.desc}</p>

                                    <div>
                                      <button className="px-8 py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 inline-flex items-center gap-2 shadow-md" style={{ background: "#2a9d8f" }}>
                                        Découvrir le catalogue →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!selectedVideoDetail ? (
                          <>
                            <div className="mb-10">
                              <button
                                onClick={() => { setSelectedVideoDetail(null); navigate('/formations'); }}
                                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                              >
                                ← Retour aux catalogues
                              </button>
                              <div className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: "#2a9d8f" }}>Catalogue : {currentCategory.tag}</div>
                              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{currentCategory.title}</h2>
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#e8f4f2", color: "#2a9d8f", border: "1px solid #b3ddd9" }}>
                                {currentCategory.videos.length} vidéos de formation
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {currentCategory.videos.map((vid) => (
                                <div key={vid.id} onClick={() => setSelectedVideoDetail(vid)} className="rounded-2xl overflow-hidden flex flex-col bg-white border border-gray-200 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                                    <img src={vid.img} alt={vid.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(26,58,92,0.3)" }}>
                                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg" style={{ background: "rgba(42,157,143,0.9)", backdropFilter: "blur(4px)" }}>▶</div>
                                    </div>
                                  </div>
                                  <div className="p-4 flex flex-col flex-1">
                                    <h4 className="font-semibold text-sm mb-3 group-hover:text-[#2a9d8f] transition-colors" style={{ color: "#1a3a5c", lineHeight: 1.4 }}>{vid.title}</h4>
                                    <div className="text-xs mb-4" style={{ color: "#6b7c93" }}>⏱ {vid.duration} • {vid.subVideos?.length || 0} vidéos</div>

                                    <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      {vid.subVideos?.map((sv, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: "#4a5568" }}>
                                          <span className="text-[#2a9d8f] text-[10px]">▶</span>
                                          <span className="truncate flex-1">{sv.title}</span>
                                          <span className="opacity-70 whitespace-nowrap">{sv.duration}</span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                      <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{vid.price}</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setCheckoutVideo(vid); }}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#2a9d8f" }}
                                      >
                                        S'inscrire
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <button
                              onClick={() => setSelectedVideoDetail(null)}
                              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}
                            >
                              ← Retour à la liste du catalogue
                            </button>

                            {/* Udemy Style Detail Layout */}
                            <div className="rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
                              {/* Hero Section */}
                              <div className="p-8 md:p-12 text-white relative overflow-hidden" style={{ background: "#1a3a5c" }}>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#2a9d8f] rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="relative z-10 max-w-2xl">
                                  <div className="flex items-center gap-3 text-sm font-medium mb-4" style={{ color: "#8fb3d0" }}>
                                    <span>Formations</span>
                                    <span>›</span>
                                    <span>{currentCategory.tag}</span>
                                  </div>
                                  <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>{selectedVideoDetail.title}</h2>
                                  <div className="text-lg mb-6 text-[#c8dff0] leading-relaxed">
                                    Maîtrisez les protocoles d'évaluation et de prise en charge avec cette formation spécialisée. Conçue par des experts de l'Institut du Traitement Interventionnel de la Douleur.
                                  </div>
                                  <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#f4c150]">⭐⭐⭐⭐⭐</span>
                                      <span className="font-semibold text-white ml-1">4.8</span>
                                      <span className="text-[#8fb3d0]">(124 avis)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#c8dff0]">
                                      <span>👤</span> 1,250 participants
                                    </div>
                                    <div className="flex items-center gap-2 text-[#c8dff0]">
                                      <span>⏱</span> {selectedVideoDetail.duration} de vidéo à la demande
                                    </div>
                                    <div className="flex items-center gap-2 text-[#c8dff0]">
                                      <span>🌐</span> Français
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Main Content & Sidebar */}
                              <div className="flex flex-col lg:flex-row">
                                {/* Main Content (Left) */}
                                <div className="flex-1 p-8 md:p-12">
                                  <div className="mb-12">
                                    <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Ce que vous apprendrez</h3>
                                    <div className="p-6 rounded-2xl grid md:grid-cols-2 gap-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                      {[
                                        "Maîtriser les bases de l'évaluation clinique de la douleur.",
                                        "Comprendre les mécanismes neurophysiologiques impliqués.",
                                        "Identifier les indications des techniques interventionnelles.",
                                        "Acquérir les bonnes pratiques d'accompagnement du patient."
                                      ].map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                          <span className="text-[#2a9d8f] mt-0.5">✓</span>
                                          <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>{item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="mb-12">
                                    <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Description</h3>
                                    <div className="text-sm leading-relaxed space-y-4" style={{ color: "#475569" }}>
                                      <p>Cette formation a été conçue pour répondre aux défis quotidiens rencontrés dans la prise en charge de la douleur chronique et aiguë. À travers des modules théoriques et des démonstrations pratiques, vous acquerrez des compétences directement applicables dans votre pratique.</p>
                                      <p>Le contenu est régulièrement mis à jour pour refléter les dernières avancées médicales et les protocoles établis par l'ITID. Vous aurez accès à des cas cliniques concrets, des quiz d'évaluation et des ressources téléchargeables.</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Contenu du cours</h3>
                                    <div className="text-sm font-medium mb-4 text-[#64748b]">
                                      {selectedVideoDetail.subVideos?.length || 0} vidéos • Durée totale : {selectedVideoDetail.duration}
                                    </div>
                                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                                      {selectedVideoDetail.subVideos?.map((section, idx) => (
                                        <div key={idx} onClick={() => alert(`Lecture de la vidéo : ${section.title}`)} className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
                                          <div className="flex items-center gap-3">
                                            <span className="text-[#6b7c93] group-hover:text-[#2a9d8f] transition-colors">▶</span>
                                            <span className="font-medium group-hover:text-[#2a9d8f] transition-colors" style={{ color: "#1e293b" }}>{section.title}</span>
                                          </div>
                                          <span className="text-xs text-gray-400">{section.duration}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Sidebar (Right) */}
                                <div className="w-full lg:w-96 bg-[#f8fafc] border-t lg:border-t-0 lg:border-l border-gray-200">
                                  <div className="sticky top-28 p-6 lg:p-8">
                                    <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md border border-gray-200 group cursor-pointer" style={{ aspectRatio: "16/9" }}>
                                      <img src={selectedVideoDetail.img} alt={selectedVideoDetail.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: "rgba(42,157,143,0.9)", backdropFilter: "blur(4px)" }}>
                                          <span className="ml-1">▶</span>
                                        </div>
                                      </div>
                                      <div className="absolute bottom-3 text-center w-full font-bold text-white text-sm bg-black/40 py-1">Playlist ({selectedVideoDetail.subVideos?.length || 0} vidéos)</div>
                                    </div>

                                    <div className="text-4xl font-bold mb-6 text-center" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
                                      {selectedVideoDetail.price}
                                    </div>

                                    <button
                                      onClick={() => setCheckoutVideo(selectedVideoDetail)}
                                      className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 shadow-lg hover:shadow-xl mb-4 hover:-translate-y-0.5"
                                      style={{ background: "#2a9d8f" }}
                                    >
                                      S'inscrire maintenant
                                    </button>
                                    <p className="text-xs text-center text-gray-500 mb-8">Garantie satisfait ou remboursé de 30 jours</p>

                                    <div>
                                      <h4 className="font-semibold text-sm mb-4" style={{ color: "#1a3a5c" }}>Ce cours comprend :</h4>
                                      <div className="space-y-3">
                                        {[
                                          { icon: "📺", text: `${selectedVideoDetail.duration} de vidéo à la demande` },
                                          { icon: "📄", text: "5 articles et ressources téléchargeables" },
                                          { icon: "📱", text: "Accès sur mobiles et ordinateurs" },
                                          { icon: "♾️", text: "Accès illimité à vie" },
                                          { icon: "🏆", text: "Certificat de fin de formation" },
                                        ].map((inc, i) => (
                                          <div key={i} className="flex items-start gap-3 text-sm">
                                            <span className="text-[#64748b]">{inc.icon}</span>
                                            <span style={{ color: "#475569" }}>{inc.text}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CHECKOUT MODAL */}
                {checkoutVideo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,36,64,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                      <button onClick={() => setCheckoutVideo(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10">✕</button>

                      <div className="p-6 border-b border-gray-100 bg-[#f0f7f6]">
                        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#2a9d8f" }}>Finaliser l'inscription</div>
                        <h3 className="text-base font-semibold leading-snug" style={{ color: "#1a3a5c" }}>{checkoutVideo.title}</h3>
                      </div>

                      <div className="px-6 py-4 flex justify-between items-center text-sm font-semibold border-b border-gray-100">
                        <span style={{ color: "#6b7c93" }}>Total à régler TTC</span>
                        <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>{checkoutVideo.price}</span>
                      </div>

                      <div className="p-6 space-y-4">
                        {!isAuthenticated && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Adresse e-mail</label>
                              <input type="email" placeholder="votre@email.fr" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Création de mot de passe</label>
                              <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                            </div>
                          </>
                        )}
                        <div className="pt-2">
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Informations de paiement</label>
                          <div className="relative">
                            <input type="text" placeholder="Numéro de carte" className="w-full px-3 py-2.5 pl-10 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💳</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <input type="text" placeholder="MM/AA" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                            <input type="text" placeholder="CVC" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-white focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all" />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            alert("Paiement simulé avec succès ! Merci de votre inscription.");
                            if (checkoutVideo && !purchasedFormations.some(p => p.id === checkoutVideo.id)) {
                              setPurchasedFormations(prev => [...prev, checkoutVideo]);
                            }
                            setCheckoutVideo(null);
                          }}
                          className="w-full py-3.5 mt-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                          style={{ background: "#2a9d8f" }}
                        >
                          Payer {checkoutVideo.price}
                        </button>

                        <p className="text-center text-[10px] text-gray-400 mt-2">Paiement sécurisé. En cliquant sur "Payer", vous acceptez nos CGV.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            } />
          ))}

          <Route path="/mon-profil" element={
            <div className="pt-32 pb-24 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-7xl mx-auto px-6">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}>
                  ← Retour à l'accueil
                </Link>

                <div className="flex flex-col lg:flex-row gap-10">
                  {/* COLONNE GAUCHE : INFO UTILISATEUR */}
                  <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format" alt="Avatar Utilisateur" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold mb-1 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>
                        Dr. Martin
                      </h2>
                      <p className="text-sm text-[#6b7c93] mb-6">martin@clinique-exemple.fr</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#1a3a5c] mb-1">Profession</label>
                          <input type="text" disabled value="Médecin Algologue" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#1a3a5c] mb-1">Mot de passe</label>
                          <input type="password" disabled value="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                        <button className="w-full py-3 mt-2 rounded-xl text-sm font-bold border border-gray-200 text-[#1a3a5c] hover:bg-gray-50 transition-colors">
                          Modifier mes informations
                        </button>
                        <button onClick={() => { setIsAuthenticated(false); navigate('/'); }} className="w-full py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE DROITE : FORMATIONS ACHETÉES */}
                  <div className="flex-1">
                    {selectedPurchasedVideo ? (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={() => setSelectedPurchasedVideo(null)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}>
                          ← Retour à la bibliothèque
                        </button>

                        <div className="bg-[#1a3a5c] rounded-3xl overflow-hidden shadow-2xl mb-8 relative">
                          <div className="aspect-video bg-black relative flex items-center justify-center group cursor-pointer">
                            <img src={selectedPurchasedVideo.img} alt={selectedPurchasedVideo.title} className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-40" />
                            <div className="relative z-10 w-20 h-20 bg-[#2a9d8f] rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                              <span className="text-white text-3xl ml-2">▶</span>
                            </div>
                          </div>
                          <div className="p-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>{selectedPurchasedVideo.title}</h2>
                            <p className="text-[#8fb3d0] text-sm">Progression: 0% • {selectedPurchasedVideo.subVideos?.length || 0} modules</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                          <h3 className="text-xl font-bold text-[#1a3a5c] mb-6" style={{ fontFamily: "var(--font-display)" }}>Contenu du cours</h3>
                          <div className="space-y-3">
                            {selectedPurchasedVideo.subVideos?.map((sub, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#2a9d8f] hover:bg-[#f0f7f6] transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-[#2a9d8f] flex items-center justify-center transition-colors">
                                    ▶
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-[#1a3a5c]">{sub.title}</h4>
                                    <span className="text-xs text-[#6b7c93]">Module {idx + 1}</span>
                                  </div>
                                </div>
                                <div className="text-xs font-semibold text-[#6b7c93]">{sub.duration}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold mb-8 text-[#1a3a5c]" style={{ fontFamily: "var(--font-display)" }}>Ma Bibliothèque ({purchasedFormations.length})</h2>

                        {purchasedFormations.length === 0 ? (
                          <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-[#f0f7f6] flex items-center justify-center text-4xl mb-6 shadow-inner">📚</div>
                            <h3 className="text-xl font-bold text-[#1a3a5c] mb-2" style={{ fontFamily: "var(--font-display)" }}>Vous n'avez pas encore de formations</h3>
                            <p className="text-sm text-[#6b7c93] mb-8 max-w-sm">Découvrez nos catalogues et commencez votre apprentissage dès aujourd'hui.</p>
                            <button onClick={() => navigate('/formations')} className="px-8 py-4 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg" style={{ background: "#2a9d8f" }}>
                              Explorer les catalogues
                            </button>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {purchasedFormations.map((vid) => (
                              <div key={vid.id} className="rounded-2xl overflow-hidden flex flex-col bg-white border border-gray-200 transition-all hover:shadow-lg group">
                                <div className="relative h-40 bg-gray-100 overflow-hidden">
                                  <img src={vid.img} alt={vid.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-sm">Acquis</div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                  <h4 className="font-semibold text-sm mb-2 text-[#1a3a5c]" style={{ lineHeight: 1.4 }}>{vid.title}</h4>
                                  <div className="text-xs mb-4 text-[#6b7c93]">⏱ {vid.duration} • {vid.subVideos?.length || 0} modules</div>

                                  <div className="mt-auto">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                      <div className="bg-[#2a9d8f] h-1.5 rounded-full" style={{ width: "0%" }}></div>
                                    </div>
                                    <button onClick={() => setSelectedPurchasedVideo(vid)} className="w-full py-2.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "#2a9d8f" }}>
                                      <span>▶</span> Continuer l'apprentissage
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          } />

          <Route path="/a-propos" element={
            <div className="pt-32 pb-24 min-h-screen" style={{ background: "var(--background)" }}>
              <div className="max-w-5xl mx-auto px-6">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#6b7c93" }}>
                  ← Retour à l'accueil
                </Link>

                <div className="mb-16">
                  <div className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#2a9d8f" }}>Notre Philosophie</div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>À propos de l'ITID</h2>
                  <p className="text-lg leading-relaxed mb-6" style={{ color: "#6b7c93" }}>
                    L'Institut du Traitement Interventionnel de la Douleur (ITID) se consacre à l'amélioration de la qualité de vie des patients souffrant de douleurs chroniques grâce à des approches médicales innovantes, technologiques et humaines.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                  <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-6" style={{ background: "#f0f7f6" }}>🩺</div>
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Services Proposés</h3>
                    <ul className="space-y-4 text-sm" style={{ color: "#6b7c93" }}>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Consultations pluridisciplinaires (Algologues, Neurologues, Psychiatres)</li>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Traitements interventionnels sous imagerie (Infiltrations, Cryoneurolyse...)</li>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Parcours de soins personnalisés et suivi global</li>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Accompagnement psychologique et sophrologie</li>
                      <li className="flex items-start gap-3 font-semibold text-[#1a3a5c]"><span className="text-[#2a9d8f] mt-1">✔</span> Formations en ligne (E-learning) pour professionnels et patients</li>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Assistant IA médical interactif disponible 24/7</li>
                      <li className="flex items-start gap-3"><span className="text-[#2a9d8f] mt-1">✔</span> Modélisation anatomique 3D pour l'évaluation des douleurs</li>
                    </ul>
                  </div>

                  <div className="p-8 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-6" style={{ background: "#f0f7f6" }}>📍</div>
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Informations Utiles</h3>
                    <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#6b7c93" }}>
                      <p><strong>Adresse :</strong><br />Espace Médical de Spécialistes de Champagne<br />Troyes, Aube, France</p>
                      <p><strong>Heures d'ouverture :</strong><br />Lundi au Vendredi : 08h30 - 18h30<br />Fermé le week-end</p>
                      <p><strong>Contact :</strong><br />Tél : 03 51 53 20 26</p>
                    </div>
                  </div>
                </div>
                {/* GALERIE ITID */}
                <div className="mb-20">
                  <div className="text-sm font-medium uppercase tracking-widest mb-3 text-center" style={{ color: "#2a9d8f" }}>En images</div>
                  <h3 className="text-3xl font-bold mb-10 text-center" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Visitez l'ITID</h3>

                  <div className="relative w-full overflow-hidden pb-6 group/carousel">
                    <button
                      onClick={() => {
                        const container = carouselRef.current;
                        if (container) {
                          const firstChild = container.firstElementChild as HTMLElement;
                          const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 374;
                          if (container.scrollLeft <= 10) {
                            container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
                          } else {
                            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                          }
                        }
                      }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-[calc(50%+12px)] z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow-lg text-[#1a3a5c] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white text-lg font-bold"
                      aria-label="Image précédente"
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => {
                        const container = carouselRef.current;
                        if (container) {
                          const firstChild = container.firstElementChild as HTMLElement;
                          const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 374;
                          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                            container.scrollTo({ left: 0, behavior: 'smooth' });
                          } else {
                            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                          }
                        }
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-[calc(50%+12px)] z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 shadow-lg text-[#1a3a5c] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white text-lg font-bold"
                      aria-label="Image suivante"
                    >
                      ❯
                    </button>

                    <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
                    <div
                      ref={carouselRef}
                      className="flex overflow-x-auto gap-6 snap-x snap-mandatory hide-scroll"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {[...ITID_IMAGES, ...ITID_IMAGES].map((imgSrc, idx) => (
                        <div key={idx} onClick={() => setLightboxIndex(idx % ITID_IMAGES.length)} className="flex-none w-[80vw] sm:w-[350px] aspect-[4/3] rounded-3xl overflow-hidden shadow-md snap-center relative group cursor-pointer">
                          <img src={`/image_itid/${imgSrc}`} alt={`ITID - Vue ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <span className="text-white font-semibold text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                              <span>🔍</span> Agrandir l'image
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-10 md:p-12 rounded-3xl text-center relative overflow-hidden" style={{ background: "#1a3a5c" }}>
                  <div className="relative z-10 max-w-2xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Rejoignez notre Newsletter</h3>
                    <p className="text-sm mb-8" style={{ color: "#8fb3d0" }}>Recevez nos dernières actualités médicales, conseils santé et informations sur les avancées de nos traitements.</p>
                    <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Merci pour votre inscription !"); }}>
                      <input type="email" placeholder="Votre adresse e-mail" required className="flex-1 px-5 py-3 rounded-xl outline-none border-2 border-transparent focus:border-[#2a9d8f] transition-all bg-white text-sm" style={{ color: "#1a3a5c" }} />
                      <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ background: "#2a9d8f" }}>S'inscrire</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>

        {/* RÉSEAUX */}
        <section className="py-8" style={{ background: "#f0f7f6" }}>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="text-sm font-medium uppercase tracking-widest mb-1" style={{ color: "#2a9d8f" }}>Réseaux sociaux</div>
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>Suivez l'ITID</h2>
            <p className="text-sm mb-4" style={{ color: "#6b7c93" }}>Actualités médicales, conseils et informations sur nos traitements — directement sur vos plateformes.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://facebook.com/itid.france" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: "#1877F2" }}>
                <FaFacebook size={20} /> Facebook
              </a>
              <a href="https://linkedin.com/company/itid-france" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: "#0A66C2" }}>
                <FaLinkedin size={20} /> LinkedIn
              </a>
              <a href="https://instagram.com/itid.france" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: "#E1306C" }}>
                <FaInstagram size={20} /> Instagram
              </a>
              <a href="https://youtube.com/@itid.france" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: "#FF0000" }}>
                <FaYoutube size={20} /> YouTube
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        {["/", "/a-propos"].includes(location.pathname) && (
          <section id="contact" className="py-12" style={{ background: "var(--background)" }}>
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
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
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1a3a5c" }}>Vous êtes</label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                      style={{ background: "#f7f4ef", border: "1px solid var(--border)", color: "#1a3a5c" }}
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Patient">Patient</option>
                      <option value="Professionnel de santé">Professionnel de santé</option>
                    </select>
                  </div>
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
        )}

        {/* FOOTER */}
        <footer style={{ background: "#0f2440", color: "#8fb3d0" }}>
          <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logo} alt="ITID Logo" className="w-11 h-11 rounded-full object-contain" />
                <span className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }}>ITID France</span>
              </div>
              <p className="text-xs leading-relaxed mb-3">
                Institut du Traitement Interventionnel de la Douleur — Troyes, Aube.
              </p>
              <p className="text-xs" style={{ color: "#5a7a98" }}>Espace Médical de Spécialistes de Champagne</p>
            </div>

            {[
              { title: "Pathologies", link: "/pathologies", links: ["Lombalgies & sciatiques", "Douleurs neuropathiques", "SDRC / Algodystrophie", "Douleurs pelviennes", "Migraines résistantes"] },
              { title: "Traitements", link: "/traitements", links: ["Infiltrations", "Perfusions de lidocaïne", "Neuromodulation", "Cryoneurolyse", "Hypnose médicale"] },
              {
                title: "Cabinet", link: "/a-propos", links: [
                  { label: "À propos de nous", to: "/a-propos" },
                  { label: "Équipe médicale", to: "/equipe" },
                  { label: "Formations vidéo", to: "/formations" },
                  { label: "Mentions légales", to: "/a-propos" },
                  { label: "Politique de confidentialité", to: "/a-propos" }
                ]
              }
            ].map((col) => (
              <div key={col.title}>
                <Link to={col.link} className="block text-white text-sm font-semibold mb-3 hover:text-[#2a9d8f] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{col.title}</Link>
                <ul className="space-y-2">
                  {col.links.map((l, idx) => (
                    <li key={idx}>
                      {typeof l === "string" ? (
                        <Link to={col.link} className="text-xs transition-colors hover:text-white">{l}</Link>
                      ) : (
                        <Link to={l.to} className="text-xs transition-colors hover:text-white">{l.label}</Link>
                      )}
                    </li>
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

        {/* LIGHTBOX GALERIE ITID */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setLightboxIndex(null)}>
            <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white text-4xl opacity-70 hover:opacity-100 transition-opacity">&times;</button>

            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev! - 1 + ITID_IMAGES.length) % ITID_IMAGES.length); }} className="absolute left-4 md:left-10 text-white text-6xl opacity-60 hover:opacity-100 transition-opacity select-none p-4">&lsaquo;</button>

            <img src={`/image_itid/${ITID_IMAGES[lightboxIndex]}`} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()} />

            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev! + 1) % ITID_IMAGES.length); }} className="absolute right-4 md:right-10 text-white text-6xl opacity-60 hover:opacity-100 transition-opacity select-none p-4">&rsaquo;</button>
          </div>
        )}
      </div>
    </>
  );
}
