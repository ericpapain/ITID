import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { HumanModel } from "./three/HumanModel";
import { useAnatomyStore } from "../store/anatomyStore";
import { useTranslation } from "react-i18next";

export function AssistantIA({ isAuthenticated, userRole, setShowAuthModal }: { isAuthenticated: boolean; userRole: string; setShowAuthModal: (v: boolean) => void }) {
  const { t } = useTranslation();
  const selectedBodyPart = useAnatomyStore(state => state.selectedBodyPart);
  const isMultiSelect = useAnatomyStore(state => state.isMultiSelect);
  const setIsMultiSelect = useAnatomyStore(state => state.setIsMultiSelect);
  const selectedBodyParts = useAnatomyStore(state => state.selectedBodyParts);
  const [messages, setMessages] = useState<{ role: "user" | "ia", text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && userRole === "pro" && messages.length === 0) {
      setMessages([
        { role: "ia", text: t("ia.welcomePro", "Bonjour Docteur. Je suis l'assistant IA de l'ITID spécialisé dans le diagnostic et l'orientation des douleurs chroniques. Décrivez-moi le cas clinique de votre patient, ses symptômes et l'historique de sa douleur pour que je puisse vous proposer des pistes diagnostiques, des examens complémentaires pertinents ou le spécialiste adapté sur la plateforme.") }
      ]);
    }
  }, [isAuthenticated, userRole, messages.length, t]);

  useEffect(() => {
    if (selectedBodyPart && !isMultiSelect && isAuthenticated && userRole === "pro") {
      const part = selectedBodyPart;
      setIsTyping(true);
      
      let response = "";
      if (part === "head") {
        response = "Vous avez ciblé la région de la **Tête**. \n\n- **Pathologies fréquentes** : Céphalées de tension, migraines chroniques, algies vasculaires de la face, névralgies du trijumeau ou d'Arnold.\n- **Questions pour le patient** : La douleur est-elle unilatérale ? Pulsatile ? Y a-t-il des signes d'accompagnement (phono/photophobie) ? Est-elle déclenchée par le toucher ?\n- **Recommandation ITID** : Orientation vers le Dr. Martin (Neurologue expert céphalées) pour évaluation d'une neuromodulation ou d'un bloc nerveux.";
      } else if (part === "neck") {
        response = "Vous avez ciblé la région du **Cou (Cervicales)**. \n\n- **Pathologies fréquentes** : Névralgie cervico-brachiale, arthrose cervicale, syndrome du défilé thoraco-brachial.\n- **Questions pour le patient** : La douleur irradie-t-elle dans le bras (trajet radiculaire) ? Y a-t-il des paresthésies ou une perte de force ?\n- **Recommandation ITID** : Évaluation pour une infiltration foraminale sous imagerie (Dr. Lefevre, Radiologue interventionnel).";
      } else if (part === "chest") {
        response = "Vous avez ciblé le **Thorax**. \n\n- **Pathologies fréquentes** : Algies post-zostériennes, douleurs pariétales, névralgies intercostales, douleurs post-opératoires (thoracotomie).\n- **Questions pour le patient** : Antécédent de zona ? Douleur type brûlure ou décharge électrique au toucher de la peau (allodynie) ?\n- **Recommandation ITID** : Application de patchs de capsaïcine ou bloc intercostal. Référer au Dr. Dubois (Algologue).";
      } else if (part === "spine" || part === "lower_back") {
        response = "Vous avez ciblé la **Région Lombaire**. \n\n- **Pathologies fréquentes** : Lombalgie chronique, sciatique, cruralgie, canal lombaire étroit, syndrome facettaire.\n- **Questions pour le patient** : Claudication à la marche ? Soulagement en antéflexion (signe du caddie) ? Douleur irradiante sous le genou ?\n- **Recommandation ITID** : Infiltration épidurale ou rhizolyse facettaire. Prise en charge par le Dr. Bernard (Spécialiste Rachis).";
      } else if (part === "pelvis") {
        response = "Vous avez ciblé le **Pelvis**. \n\n- **Pathologies fréquentes** : Endométriose, névralgie pudendale, syndrome de la vessie douloureuse.\n- **Questions pour le patient** : Douleur majorée en position assise ? En lien avec le cycle menstruel ?\n- **Recommandation ITID** : Consultation pluridisciplinaire (Gynécologue + Algologue) avec le Dr. Moreau.";
      } else if (part === "shoulder" || part === "arm" || part === "hand") {
        response = "Vous avez ciblé le **Membre Supérieur**. \n\n- **Pathologies fréquentes** : Syndrome douloureux régional complexe (SDRC/Algodystrophie), tendinopathie rompue, syndrome du canal carpien.\n- **Questions pour le patient** : Antécédent de traumatisme ou chirurgie ? Modification de la couleur/température de la peau ?\n- **Recommandation ITID** : Prise en charge urgente pour SDRC. Centre de rééducation et perfusions de kétamine. Référer au Dr. Simon.";
      } else if (part === "hip" || part === "knee" || part === "leg" || part === "foot") {
        response = "Vous avez ciblé le **Membre Inférieur**. \n\n- **Pathologies fréquentes** : Coxarthrose/Gonarthrose sévère, neuropathie diabétique, radiculopathie lombaire irradiante.\n- **Questions pour le patient** : La douleur est-elle symétrique (en chaussette) ou asymétrique ? Gêne importante à la marche ?\n- **Recommandation ITID** : Infiltration articulaire guidée ou neurostimulation médullaire. Référer au Dr. Petit (Rhumatologue).";
      } else {
        response = `Vous avez ciblé la zone : **${part}**. \n\n- **Questions pour le patient** : Depuis quand la douleur est-elle présente ? Quelle est son intensité (EVA) ? Y a-t-il une composante neuropathique (brûlure, décharge électrique) ?\n- **Orientation** : Saisissez plus de détails dans le chat (réponses du patient, contexte) pour que je vous recommande un spécialiste ITID adapté.`;
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "ia",
          text: response
        }]);
      }, 800);
    }
  }, [selectedBodyPart, isAuthenticated, userRole]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "ia",
        text: "D'après les éléments fournis, voici mon analyse :\n\n- **Hypothèses diagnostiques** : Possible neuropathie périphérique ou syndrome canalaire.\n- **Questions suggérées pour le patient** : La douleur est-elle pulsatile, fulgurante ou à type de brûlure ? Y a-t-il une allodynie au toucher ?\n- **Orientation clinique** : Je recommande un électromyogramme (EMG) pour confirmer. Vous pourriez également orienter le patient vers un neurologue spécialisé de notre réseau.\n\n*Ceci est un outil d'aide à la décision et ne se substitue pas à votre expertise clinique.*"
      }]);
    }, 1500);
  };

  const handleSuggest = (text: string) => {
    setInput(text);
  };

  if (!isAuthenticated || userRole !== "pro") {
    return (
      <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="max-w-xl text-center px-4 sm:px-6">
          <div className="w-24 h-24 mx-auto mb-8 bg-[#1a3a5c] rounded-full flex items-center justify-center shadow-xl">
            <span className="text-5xl text-white">🔒</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1a3a5c" }}>
            {t("ia.lockedTitle", "Accès strictement réservé")}
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: "#6b7c93" }}>
            {t("ia.lockedDesc", "L'outil « Docteur j'ai une question » est un outil d'aide au diagnostic exclusif aux professionnels de santé. Cet outil ne doit en aucun cas être utilisé pour l'autodiagnostic.")}
          </p>
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl mb-8">
            <p className="text-sm text-yellow-800 font-medium">
              {t("ia.lockedNotice", "Si vous êtes praticien, veuillez vous connecter avec un compte validé \"Professionnel de santé\" pour débloquer cette fonctionnalité.")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              disabled
              className="px-8 py-4 rounded-xl font-bold text-gray-500 bg-gray-200 border border-gray-300 cursor-not-allowed opacity-70 shadow-none select-none"
            >
              {isAuthenticated ? t("ia.btnEditProfile", "Modifier mon profil") : t("ia.btnLoginPro", "Me connecter en tant que Pro")}
            </button>
            <span className="text-sm font-medium text-[#6b7c93] bg-gray-100/90 px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
              {t("ia.comingSoonBadge", "⏳ Cette fonctionnalité arrive bientôt")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Disclaimer Banner */}
      <div className="w-full bg-[#1a3a5c] text-white py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-medium z-10 shadow-md">
        <span className="mr-2">⚠️</span> <strong>{t("common.warning", "Avertissement")} :</strong> {t("ia.disclaimer", "Cet assistant IA est un outil d'aide à la décision clinique. Il ne remplace en aucun cas le jugement et l'expertise du médecin.")}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left Column : 3D Humanoid */}
        <div className="w-full lg:w-2/5 h-[50vh] lg:h-[calc(100vh-140px)] relative bg-gray-50 border-r border-gray-200 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)]">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            <Environment preset="city" />
            <HumanModel />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              minDistance={2} 
              maxDistance={7}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Canvas>
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex flex-col items-center gap-3">
            <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 text-xs text-[#1a3a5c] font-medium pointer-events-auto text-center flex items-center gap-3">
              <span>{t("ia.rotateHint", "Faites pivoter pour localiser la douleur ↺")}</span>
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isMultiSelect} 
                  onChange={(e) => setIsMultiSelect(e.target.checked)} 
                  className="rounded text-[#2a9d8f] focus:ring-[#2a9d8f]"
                />
                {t("common.multiSelect", "Sélection multiple")}
              </label>
            </div>
            {isMultiSelect && selectedBodyParts.length > 0 && (
              <button 
                onClick={() => {
                  const partsFr = selectedBodyParts.join(", ");
                  setMessages(prev => [...prev, {
                    role: "user",
                    text: `J'ai sélectionné les zones suivantes : ${partsFr}. Que suggérez-vous ?`
                  }]);
                  setIsTyping(true);
                  setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev, {
                      role: "ia",
                      text: `Pour une douleur impliquant simultanément **${partsFr}**, il faut évoquer une atteinte systémique ou radiculaire étendue. \n\n- **Hypothèses diagnostiques** : Polyneuropathie, fibromyalgie, syndrome douloureux régional complexe (SDRC) de type 2, ou radiculopathie multi-étagée.\n- **Questions pour le patient** : Les douleurs sont-elles symétriques ? S'accompagnent-elles d'une fatigue chronique ou de troubles du sommeil ? Y a-t-il eu un traumatisme déclencheur ?\n- **Recommandation ITID** : Ce tableau complexe nécessite un bilan pluridisciplinaire complet (Algologue + Neurologue + Rhumatologue).`
                    }]);
                  }, 1200);
                }}
                className="pointer-events-auto px-6 py-2 bg-[#1a3a5c] text-white rounded-xl shadow-xl font-bold text-sm hover:bg-[#2a9d8f] transition-colors"
              >
                Analyser la sélection ({selectedBodyParts.length})
              </button>
            )}
          </div>
        </div>

        {/* Right Column : Chat Interface */}
        <div className="w-full lg:w-3/5 h-[60vh] lg:h-[calc(100vh-140px)] flex flex-col bg-white relative">
          
          <div className="p-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2a9d8f]/10 flex items-center justify-center text-[#2a9d8f] text-xl font-bold">IA</div>
              <div>
                <h2 className="font-bold text-[#1a3a5c] leading-tight">Docteur j'ai une question</h2>
                <div className="text-[10px] uppercase font-bold text-[#2a9d8f] tracking-wider">Expertise Douleur Chronique</div>
              </div>
            </div>
            <button className="text-sm font-semibold text-gray-400 hover:text-[#1a3a5c] transition-colors" onClick={() => setMessages([])}>
              Nouvelle consultation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    m.role === "user" 
                      ? "bg-[#1a3a5c] text-white rounded-tr-sm" 
                      : "bg-white text-[#1a3a5c] border border-gray-100 rounded-tl-sm"
                  }`}
                >
                  {m.text.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line.startsWith('- **') ? (
                        <div className="mt-2 pl-2 border-l-2 border-[#2a9d8f]"><span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/, '<strong>$1</strong>') }} /></div>
                      ) : line.startsWith('*') && line.endsWith('*') ? (
                        <div className="mt-4 text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">{line.replace(/\*/g, '')}</div>
                      ) : (
                        <>{line}<br/></>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => handleSuggest("Patient de 45 ans, lombalgie irradiant jambe droite depuis 3 mois. Pas de déficit moteur.")} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-semibold text-[#6b7c93] hover:bg-gray-100 border border-gray-200 transition-colors">
                Lombalgie irradiante
              </button>
              <button onClick={() => handleSuggest("Douleur type brûlure post-zostérienne région thoracique D6-D8. Intense, insomniante.")} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-semibold text-[#6b7c93] hover:bg-gray-100 border border-gray-200 transition-colors">
                Algie post-zostérienne
              </button>
              <button onClick={() => handleSuggest("Patiente 35 ans. Douleurs pelviennes chroniques, majorées lors des cycles. Suspecte endométriose.")} className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-semibold text-[#6b7c93] hover:bg-gray-100 border border-gray-200 transition-colors">
                Douleurs pelviennes
              </button>
            </div>
            
            <div className="flex items-end gap-3 relative">
              <textarea 
                className="flex-1 max-h-32 min-h-[50px] p-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 transition-all text-sm resize-none"
                placeholder="Décrivez les symptômes, localisations ou historique du patient..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-md ${input.trim() ? "bg-[#2a9d8f] hover:bg-[#21867a]" : "bg-gray-300 cursor-not-allowed"}`}
              >
                ➤
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Génération de rapport de consultation possible
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
