import { Link, useNavigate } from "react-router-dom";
import { ShimmerButton } from "../ui/ShimmerButton";
import type { Video } from "../../data";
import { useTranslation } from "react-i18next";

interface ProfilPageProps {
  purchasedFormations: Video[];
  setIsAuthenticated: (v: boolean) => void;
  selectedPurchasedVideo: Video | null;
  setSelectedPurchasedVideo: React.Dispatch<React.SetStateAction<Video | null>>;
}

export function ProfilPage({
  purchasedFormations,
  setIsAuthenticated,
  selectedPurchasedVideo,
  setSelectedPurchasedVideo,
}: ProfilPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-24 min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <ShimmerButton
          as="Link"
          to="/"
          className="mb-8"
        >
          ← {t('common.backHome')}
        </ShimmerButton>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* COLONNE GAUCHE : INFO UTILISATEUR */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format" alt="Avatar Utilisateur" className="w-full h-full object-cover" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1 text-[#f8fafc]" style={{ fontFamily: "var(--font-display)" }}>
                Dr. Martin
              </h2>
              <p className="text-sm text-[#cbd5e1] mb-6">martin@clinique-exemple.fr</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#f8fafc] mb-1">{t('profil.profession')}</label>
                  <input type="text" disabled value={t('profil.painDoctor')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#f8fafc] mb-1">{t('profil.password')}</label>
                  <input type="password" disabled value="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <button className="w-full py-3 mt-2 rounded-xl text-sm font-bold border border-gray-200 text-[#f8fafc] hover:bg-gray-50 transition-colors">
                  {t('profil.editInfo')}
                </button>
                <button onClick={() => { setIsAuthenticated(false); navigate('/'); }} className="w-full py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                  {t('profil.logout')}
                </button>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : FORMATIONS ACHETÉES */}
          <div className="flex-1">
            {selectedPurchasedVideo ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button onClick={() => setSelectedPurchasedVideo(null)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2a9d8f]" style={{ color: "#cbd5e1" }}>
                  ←  {t('common.backLibrary')}
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
                    <p className="text-[#8fb3d0] text-sm">{t('profil.progress', { count: selectedPurchasedVideo.subVideos?.length || 0 })}</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <h3 className="text-xl font-bold text-[#f8fafc] mb-6" style={{ fontFamily: "var(--font-display)" }}>{t('profil.courseContent')}</h3>
                  <div className="space-y-3">
                    {selectedPurchasedVideo.subVideos?.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#2a9d8f] hover:bg-[#f0f7f6] transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-[#2a9d8f] flex items-center justify-center transition-colors">
                            ▶
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-[#f8fafc]">{sub.title}</h4>
                            <span className="text-xs text-[#cbd5e1]">{t('profil.module')} {idx + 1}</span>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-[#cbd5e1]">{sub.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-8 text-[#f8fafc]" style={{ fontFamily: "var(--font-display)" }}>{t('profil.myLibrary', { count: purchasedFormations.length })}</h2>

                {purchasedFormations.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-[#f0f7f6] flex items-center justify-center text-4xl mb-6 shadow-inner">📚</div>
                    <h3 className="text-xl font-bold text-[#f8fafc] mb-2" style={{ fontFamily: "var(--font-display)" }}>{t('profil.noFormations')}</h3>
                    <p className="text-sm text-[#cbd5e1] mb-8 max-w-sm">{t('profil.discoverCatalog')}</p>
                    <button onClick={() => navigate('/formations')} className="px-8 py-4 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg" style={{ background: "#2a9d8f" }}>
                      {t('profil.exploreCatalog')}
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {purchasedFormations.map((vid) => (
                      <div key={vid.id} className="rounded-2xl overflow-hidden flex flex-col bg-white border border-gray-200 transition-all hover:shadow-lg group">
                        <div className="relative h-40 bg-gray-100 overflow-hidden">
                          <img src={vid.img} alt={vid.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-sm">{t('profil.acquired')}</div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-semibold text-sm mb-2 text-[#f8fafc]" style={{ lineHeight: 1.4 }}>{vid.title}</h4>
                          <div className="text-xs mb-4 text-[#cbd5e1]">â ± {vid.duration} • {t('profil.modulesCount', { count: vid.subVideos?.length || 0 })}</div>

                          <div className="mt-auto">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                              <div className="bg-[#2a9d8f] h-1.5 rounded-full" style={{ width: "0%" }}></div>
                            </div>
                            <button onClick={() => setSelectedPurchasedVideo(vid)} className="w-full py-2.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "#2a9d8f" }}>
                              <span>▶</span> {t('profil.continueLearning')}
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
  );
}
