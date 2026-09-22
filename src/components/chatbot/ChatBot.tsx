import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  MessageSquare, 
  X, 
  Send, 
  RotateCcw, 
  Calendar, 
  Stethoscope, 
  GraduationCap, 
  MapPin, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
  time: string;
  action?: {
    label: string;
    type: "route" | "contact" | "doctolib";
    target?: string;
  };
}

export function ChatBot() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitialMessage = (): ChatMessage => ({
    role: "bot",
    text: t('chatbot.default', "Bonjour, je suis l'assistant médical virtuel de l'ITID France. Comment puis-je vous renseigner aujourd'hui sur nos soins interventionnels, nos rendez-vous ou nos formations ?"),
    time: getCurrentTime(),
    action: {
      label: "Prendre RDV sur Doctolib",
      type: "doctolib",
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  // Auto-scroll on new message
  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const resetChat = () => {
    setMessages([getInitialMessage()]);
    setInput("");
    setTyping(false);
  };

  const getBotResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase().trim();
    const isEn = i18n.language.startsWith('en');
    const time = getCurrentTime();

    // 1. Rendez-vous / Doctolib / Téléphone
    if (q.includes("rdv") || q.includes("rendez") || q.includes("doctolib") || q.includes("contact") || q.includes("appel") || q.includes("téléphone") || q.includes("horaire") || q.includes("appointment") || q.includes("book") || q.includes("call")) {
      return {
        role: "bot",
        text: isEn
          ? "Appointments are booked directly online via Doctolib. You can also contact our medical secretariat at +33 3 51 53 20 26 (Monday to Friday from 8:30 AM to 6:00 PM)."
          : "La prise de rendez-vous s'effectue directement en ligne sur **Doctolib**. Vous pouvez également joindre le secrétariat médical au **03 51 53 20 26** (du lundi au vendredi de 8h30 à 18h00).",
        time,
        action: {
          label: isEn ? "Book on Doctolib" : "Ouvrir Doctolib",
          type: "doctolib"
        }
      };
    }

    // 2. Traitements & Infiltrations
    if (q.includes("traitement") || q.includes("infiltration") || q.includes("radiofréquence") || q.includes("cryo") || q.includes("lidocaine") || q.includes("bloc") || q.includes("treatment") || q.includes("therapy")) {
      return {
        role: "bot",
        text: isEn
          ? "ITID offers advanced image-guided interventional procedures: spinal and joint injections, pulsed radiofrequency, cryoneurolysis, lidocaine infusions, dorsal root ganglion stimulation, and rTMS."
          : "L'ITID propose des techniques interventionnelles de pointe guidées par imagerie (scanner & échographie) :\n\n• Infiltrations rachidiennes et articulaires\n• Radiofréquence pulsée\n• Cryoneurolyse\n• Perfusions de lidocaïne\n• Stimulation du ganglion dorsal & rTMS",
        time,
        action: {
          label: isEn ? "Discover treatments" : "Découvrir tous nos traitements",
          type: "route",
          target: "/traitements"
        }
      };
    }

    // 3. Pathologies & Douleurs (Dos, Sciatique, Arnold, SDRC, etc.)
    if (q.includes("douleur") || q.includes("mal") || q.includes("lombalgie") || q.includes("sciatique") || q.includes("dos") || q.includes("arnold") || q.includes("sdrc") || q.includes("fibro") || q.includes("migraine") || q.includes("endométriose") || q.includes("pain") || q.includes("back") || q.includes("ache")) {
      return {
        role: "bot",
        text: isEn
          ? "We specialize in managing chronic and refractory pain: sciatica, chronic low back pain, Arnold neuralgia, CRPS, neuropathic pain, endometriosis, and migraines. An initial consultation with our algologist evaluates your case."
          : "Nous prenons en charge les douleurs chroniques rebelles : lombalgies, sciatiques, névralgies d'Arnold, SDRC (algodystrophie), douleurs neuropathiques, migraines et endométriose.\n\nUne évaluation spécialisée avec nos médecins algologues permet de définir le protocole le plus adapté.",
        time,
        action: {
          label: isEn ? "View conditions map" : "Consulter la cartographie des pathologies",
          type: "route",
          target: "/pathologies"
        }
      };
    }

    // 4. Formations
    if (q.includes("formation") || q.includes("cours") || q.includes("dpc") || q.includes("apprendre") || q.includes("video") || q.includes("training") || q.includes("course") || q.includes("learn")) {
      return {
        role: "bot",
        text: isEn
          ? "ITID offers accredited masterclasses and training modules for healthcare professionals, paramedical staff, and public health awareness, including lifetime video access and certificates."
          : "L'ITID dispense des programmes de formation continue de haute qualité pour les professionnels de santé (médecins, kinésithérapeutes, infirmiers) ainsi que des modules d'information grand public avec vidéos cliniques.",
        time,
        action: {
          label: isEn ? "Explore training" : "Accéder à l'espace Formations",
          type: "route",
          target: "/formations"
        }
      };
    }

    // 5. Adresse, Localisation, Accès
    if (q.includes("adresse") || q.includes("ou") || q.includes("où") || q.includes("lieu") || q.includes("troyes") || q.includes("ville") || q.includes("address") || q.includes("location") || q.includes("where")) {
      return {
        role: "bot",
        text: isEn
          ? "ITID France is located in Troyes within the Espace Médical de Spécialistes de Champagne: 25 avenue des Mailles, 10800 Saint-Julien-les-Villas."
          : "L'institut ITID France est situé au sein de l'Espace Médical de Spécialistes de Champagne :\n📍 **25 avenue des Mailles, 10800 Saint-Julien-les-Villas (Troyes)**\n\nParking réservé aux patients et accès PMR garanti.",
        time,
        action: {
          label: isEn ? "Contact us" : "Nous contacter / Nous trouver",
          type: "contact"
        }
      };
    }

    // 6. Urgence
    if (q.includes("urgence") || q.includes("urgent") || q.includes("grave") || q.includes("emergency")) {
      return {
        role: "bot",
        text: isEn
          ? "⚠️ ITID is a scheduled consultation and interventional daycare center. In case of a vital medical emergency, please immediately call 15 (SAMU) or 112 (European emergency)."
          : "⚠️ **Rappel important** : L'ITID est un centre de soins programmés. En cas d'urgence médicale vitale ou d'apparition brutale de déficits neurologiques, composez immédiatement le **15 (SAMU)** ou le **112**.",
        time
      };
    }

    // 7. Défaut
    return {
      role: "bot",
      text: isEn
        ? "I am here to guide you. You can ask me about our medical procedures, chronic pain conditions, booking consultations, or practical information."
        : "Je suis à votre disposition. N'hésitez pas à me questionner sur nos **infiltrations et traitements**, vos **symptômes douloureux**, la prise de **rendez-vous**, ou encore nos **formations**.",
      time,
      action: {
        label: isEn ? "Contact team" : "Formulaire de contact",
        type: "contact"
      }
    };
  };

  const handleSend = (queryText?: string) => {
    const textToSend = (queryText ?? input).trim();
    if (!textToSend) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: textToSend,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const botResponse = getBotResponse(textToSend);
      setMessages((prev) => [...prev, botResponse]);
    }, 750);
  };

  const handleActionClick = (action: NonNullable<ChatMessage["action"]>) => {
    if (action.type === "doctolib") {
      window.open("https://www.doctolib.fr", "_blank", "noopener,noreferrer");
    } else if (action.type === "route" && action.target) {
      setOpen(false);
      navigate(action.target);
      window.scrollTo(0, 0);
    } else if (action.type === "contact") {
      setOpen(false);
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/#contact");
      }
    }
  };

  const quickSuggestions = [
    { label: "📅 " + t("chatbot.q1", "Prendre RDV"), query: "Prendre rendez-vous sur Doctolib" },
    { label: "💉 " + t("chatbot.q2", "Traitements"), query: "Quels sont vos traitements interventionnels ?" },
    { label: "🦴 " + t("pathologies.title", "Pathologies"), query: "Quelles douleurs prenez-vous en charge ?" },
    { label: "🎓 " + t("chatbot.q3", "Formations"), query: "Parlez-moi des formations médicales" },
    { label: "📍 " + t("contact.addressTitle", "Adresse"), query: "Où êtes-vous situés à Troyes ?" },
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-3 font-sans">
      {open && (
        <div
          role="dialog"
          aria-label="Assistant virtuel ITID"
          className="w-[calc(100vw-2rem)] max-w-[380px] sm:w-[390px] h-[540px] max-h-[78vh] rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(12,26,46,0.35)] overflow-hidden flex flex-col border border-white/20 bg-white animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header avec branding ITID */}
          <div className="bg-gradient-to-r from-[#0c1a2e] via-[#152e4d] to-[#1a3a5c] px-4 py-3.5 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#2a9d8f] to-[#48cae4] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-[#0c1a2e] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#48cae4]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c1a2e]" />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5" style={{ fontFamily: "var(--font-display)" }}>
                  <span>{t("chatbot.assistant", "Assistant ITID")}</span>
                  <span className="text-[10px] font-semibold bg-[#2a9d8f]/30 text-[#48cae4] px-1.5 py-0.2 rounded border border-[#2a9d8f]/40">IA</span>
                </div>
                <span className="text-xs text-slate-300 font-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("chatbot.online", "En ligne")} — Institut de la Douleur
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                title="Réinitialiser la conversation"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Recommencer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Fermer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fermer le chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Corps de conversation scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc]">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[85%]">
                  {m.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold text-[#48cae4]">
                      IA
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-[#1a3a5c] to-[#0c1a2e] text-white rounded-br-xs"
                        : "bg-white text-[#0c1a2e] font-normal border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Action Button si disponible */}
                    {m.action && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(m.action!)}
                        className="mt-2.5 w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/30 hover:bg-[#2a9d8f] hover:text-white transition-all group"
                      >
                        <span>{m.action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}

            {/* Animation de frappe */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#48cae4]">
                  IA
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions rapides horizontales */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.query)}
                className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-[#2a9d8f]/10 text-slate-700 hover:text-[#2a9d8f] border border-slate-200/80 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Zone de saisie — TEXTE BLEU FONCÉ & CONTRASTE PARFAIT */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-[#f1f5f9] text-[#0c1a2e] font-semibold placeholder:text-slate-500 placeholder:font-normal border border-slate-300 focus:border-[#2a9d8f] focus:bg-white focus:ring-2 focus:ring-[#2a9d8f]/20 transition-all"
              style={{ color: "#0c1a2e" }}
              placeholder={t('chatbot.placeholder', 'Posez votre question...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-[#2a9d8f] hover:bg-[#248277] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-[#2a9d8f]/20 shrink-0"
              aria-label="Envoyer le message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bouton Flottant d'Ouverture / Fermeture */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(42,157,143,0.4)] flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          open 
            ? "bg-[#0c1a2e] border-2 border-white/20 rotate-90" 
            : "bg-gradient-to-tr from-[#2a9d8f] to-[#48cae4] border-2 border-white/30"
        }`}
        aria-label="Ouvrir l'assistant virtuel"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
