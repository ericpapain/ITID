import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useNavigate, useParams } from "react-router-dom";
import { HumanModel } from "../three/HumanModel";
import { useAnatomyStore } from "../../store/anatomyStore";
import { TransitionLink } from "../ui/TransitionLink";
import { ShimmerButton } from "../ui/ShimmerButton";
import { AnimatedGridPattern } from "../animations/AnimatedGridPattern";
import { GlowOrbs } from "../animations/GlowOrbs";
import { CATEGORIES_FORMATIONS } from "../../data";
import type { Category, Video } from "../../data";

interface FormationsPageProps {
  isAuthenticated: boolean;
  setShowAuthModal: (v: boolean) => void;
  cart: Video[];
  setCart: (v: Video[]) => void;
  setShowCartModal: (v: boolean) => void;
  purchasedFormations: Video[];
  setPurchasedFormations: React.Dispatch<React.SetStateAction<Video[]>>;
  formationMode: "3d" | "classic";
  setFormationMode: (v: "3d" | "classic") => void;
  formationFilter: string;
  setFormationFilter: (v: string) => void;
  selectedSuggestedVideos: Video[];
  setSelectedSuggestedVideos: (v: Video[]) => void;
  selectedVideoDetail: Video | null;
  setSelectedVideoDetail: (v: Video | null) => void;
  checkoutVideo: Video | null;
  setCheckoutVideo: (v: Video | null) => void;
  handleCategoryClick: (cat: Category) => void;
}

export function FormationsPage({
  isAuthenticated,
  setShowAuthModal,
  cart,
  setCart,
  setShowCartModal,
  purchasedFormations,
  setPurchasedFormations,
  formationMode,
  setFormationMode,
  formationFilter,
  setFormationFilter,
  selectedSuggestedVideos,
  setSelectedSuggestedVideos,
  selectedVideoDetail,
  setSelectedVideoDetail,
  checkoutVideo,
  setCheckoutVideo,
  handleCategoryClick,
}: FormationsPageProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const currentCategory = categoryId
    ? CATEGORIES_FORMATIONS.find((c) => c.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-") === categoryId)
    : null;

  const { selectedParts, isMultiSelect, setIsMultiSelect } = useAnatomyStore();

  const selectedBodyPartsFr = selectedParts.map(p => {
    switch (p) {
      case "head": return "Tête & Cou";
      case "spine": return "Rachis";
      case "pelvis": return "Bassin & Périnée";
      case "shoulder_l": case "shoulder_r": return "Épaules";
      case "arm_l": case "arm_r": case "hand_l": case "hand_r": return "Membres Supérieurs";
      case "leg_l": case "leg_r": case "foot_l": case "foot_r": return "Membres Inférieurs";
      default: return p;
    }
  }).filter((v, i, a) => a.indexOf(v) === i).join(", ");

  return (
    <GlowOrbs>
      <div className="pt-32 pb-12 min-h-screen relative overflow-hidden text-[#1a3a5c]">
        <AnimatedGridPattern cols={22} rows={14} litCount={22} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {!currentCategory ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <TransitionLink
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}
                >
                  ←  Retour à l'accueil
                </TransitionLink>

                {isAuthenticated && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/mon-profil')}
                      className="flex items-center gap-2 text-sm font-bold text-[#f8fafc] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
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
                  <h2 className="text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>Nos Formations</h2>
                  <p className="text-sm mt-2" style={{ color: "#cbd5e1" }}>Explorez nos catalogues complets ou trouvez une formation par zone anatomique.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setFormationMode("3d")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formationMode === "3d" ? "bg-white text-[#f8fafc] shadow-sm" : "text-[#cbd5e1] hover:text-[#f8fafc]"}`}
                  >
                    🧠  Modèle 3D
                  </button>
                  <button
                    onClick={() => setFormationMode("classic")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formationMode === "classic" ? "bg-white text-[#f8fafc] shadow-sm" : "text-[#cbd5e1] hover:text-[#f8fafc]"}`}
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
                      <div className="text-[#f8fafc] text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Anatomie Interactive</div>
                      <div className="text-sm font-semibold mt-1" style={{ color: "#2a9d8f" }}>Faites pivoter et cliquez sur une zone</div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <label className="flex items-center gap-2 cursor-pointer bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-max transition-colors hover:bg-white">
                        <input type="checkbox" checked={isMultiSelect} onChange={(e) => setIsMultiSelect(e.target.checked)} className="form-checkbox h-4 w-4 text-[#2a9d8f] rounded accent-[#2a9d8f]" />
                        <span className="text-xs font-bold text-[#f8fafc]">Sélection multiple</span>
                      </label>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-[#f8fafc]" style={{ fontFamily: "var(--font-display)" }}>
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
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-[#f8fafc] focus:outline-none focus:border-[#2a9d8f] shadow-sm cursor-pointer"
                        >
                          <option value="Tous">Toutes les spécialités</option>
                          <option value="Professionnel de santé">Médecins & Spécialistes</option>
                          <option value="Grand public">Grand public</option>
                          <option value="InfirmierÂ·ère / Kiné">Paramédical</option>
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
                                    <h4 className="font-bold text-[#f8fafc] text-sm mb-1">{video.title}</h4>
                                    <p className="text-xs text-[#cbd5e1] mb-2">{video.duration} • Focus : {selectedBodyPartsFr}</p>
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
                          <ShimmerButton
                            onClick={() => {
                              if (!isAuthenticated) { setShowAuthModal(true); return; }
                              setCart([...cart, ...selectedSuggestedVideos]);
                              setSelectedSuggestedVideos([]);
                            }}
                            className="w-full py-4 rounded-xl shadow-lg"
                          >
                            🛒 Ajouter la sélection au panier ({selectedSuggestedVideos.length})
                          </ShimmerButton>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-[#cbd5e1] bg-gray-50/50">
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
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-[#f8fafc] focus:outline-none focus:border-[#2a9d8f] shadow-sm cursor-pointer"
                    >
                      <option value="Tous">Toutes les spécialités</option>
                      <option value="Professionnel de santé">Médecins & Spécialistes</option>
                      <option value="Grand public">Grand public</option>
                      <option value="InfirmierÂ·ère / Kiné">Paramédical</option>
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
                          <h3 className="font-semibold text-2xl md:text-3xl mb-4 leading-snug transition-colors group-hover:text-[#2a9d8f]" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>{cat.title}</h3>
                          <p className="text-base md:text-lg mb-8" style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{cat.desc}</p>

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
                      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}
                    >
                      ←  Retour aux catalogues
                    </button>
                    <div className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: "#2a9d8f" }}>Catalogue : {currentCategory.tag}</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>{currentCategory.title}</h2>
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
                          <h4 className="font-semibold text-sm mb-3 group-hover:text-[#2a9d8f] transition-colors" style={{ color: "#f8fafc", lineHeight: 1.4 }}>{vid.title}</h4>
                          <div className="text-xs mb-4" style={{ color: "#cbd5e1" }}>â ± {vid.duration} • {vid.subVideos?.length || 0} vidéos</div>

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
                            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>{vid.price}</span>
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
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}
                  >
                    ←  Retour à la liste du catalogue
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
                            <span className="text-[#f4c150]">⭐ ⭐ ⭐ ⭐ ⭐ </span>
                            <span className="font-semibold text-white ml-1">4.8</span>
                            <span className="text-[#8fb3d0]">(124 avis)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#c8dff0]">
                            <span>👤</span> 1,250 participants
                          </div>
                          <div className="flex items-center gap-2 text-[#c8dff0]">
                            <span>â ±</span> {selectedVideoDetail.duration} de vidéo à la demande
                          </div>
                          <div className="flex items-center gap-2 text-[#c8dff0]">
                            <span>🌍 </span> Français
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content & Sidebar */}
                    <div className="flex flex-col lg:flex-row">
                      {/* Main Content (Left) */}
                      <div className="flex-1 p-8 md:p-12">
                        <div className="mb-12">
                          <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>Ce que vous apprendrez</h3>
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
                          <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>Description</h3>
                          <div className="text-sm leading-relaxed space-y-4" style={{ color: "#475569" }}>
                            <p>Cette formation a été conçue pour répondre aux défis quotidiens rencontrés dans la prise en charge de la douleur chronique et aiguë. À travers des modules théoriques et des démonstrations pratiques, vous acquerrez des compétences directement applicables dans votre pratique.</p>
                            <p>Le contenu est régulièrement mis à jour pour refléter les dernières avancées médicales et les protocoles établis par l'ITID. Vous aurez accès à des cas cliniques concrets, des quiz d'évaluation et des ressources téléchargeables.</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>Contenu du cours</h3>
                          <div className="text-sm font-medium mb-4 text-[#64748b]">
                            {selectedVideoDetail.subVideos?.length || 0} vidéos • Durée totale : {selectedVideoDetail.duration}
                          </div>
                          <div className="rounded-xl border border-gray-200 overflow-hidden">
                            {selectedVideoDetail.subVideos?.map((section, idx) => (
                              <div key={idx} onClick={() => alert(`Lecture de la vidéo : ${section.title}`)} className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <span className="text-[#cbd5e1] group-hover:text-[#2a9d8f] transition-colors">▶</span>
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

                          <div className="text-4xl font-bold mb-6 text-center" style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}>
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
                            <h4 className="font-semibold text-sm mb-4" style={{ color: "#f8fafc" }}>Ce cours comprend :</h4>
                            <div className="space-y-3">
                              {[
                                { icon: "📺", text: `${selectedVideoDetail.duration} de vidéo à la demande` },
                                { icon: "📄", text: "5 articles et ressources téléchargeables" },
                                { icon: "📱", text: "Accès sur mobiles et ordinateurs" },
                                { icon: "♾️ ", text: "Accès illimité à vie" },
                                { icon: "ðŸ †", text: "Certificat de fin de formation" },
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
      
      {/* CHECKOUT MODAL is separated but called from App.tsx via state */}
    </GlowOrbs>
  );
}
