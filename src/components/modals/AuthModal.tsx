import { ShimmerButton } from "../ui/ShimmerButton";

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
  userRole: "patient" | "pro";
  setUserRole: (v: "patient" | "pro") => void;
  authMode: "login" | "register";
  setAuthMode: (v: "login" | "register") => void;
}

export function AuthModal({
  showAuthModal,
  setShowAuthModal,
  setIsAuthenticated,
  userRole,
  setUserRole,
  authMode,
  setAuthMode,
}: AuthModalProps) {
  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2440]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#f0f7f6] flex items-center justify-center text-xl">🔒</div>
            <button onClick={() => setShowAuthModal(false)} className="text-[#cbd5e1] hover:text-[#f8fafc] text-xl font-bold">×</button>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-[#f8fafc]" style={{ fontFamily: "var(--font-display)" }}>
            {authMode === "login" ? "Connexion" : "Créer un compte"}
          </h2>
          <p className="text-sm text-[#cbd5e1] mb-8">
            {authMode === "login" ? "Connectez-vous pour accéder au catalogue de formations." : "Rejoignez-nous pour débloquer toutes les vidéos."}
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); setShowAuthModal(false); }}
            className="space-y-4"
          >
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setUserRole("patient")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userRole === "patient" ? "bg-white text-[#f8fafc] shadow-sm" : "text-gray-500 hover:text-[#f8fafc]"}`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setUserRole("pro")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userRole === "pro" ? "bg-white text-[#f8fafc] shadow-sm" : "text-gray-500 hover:text-[#f8fafc]"}`}
              >
                Pro de santé
              </button>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#f8fafc] mb-1">Nom complet</label>
                <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder={userRole === "pro" ? "Dr. Dupont" : "Jean Dupont"} />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#f8fafc] mb-1">Adresse E-mail</label>
              <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder="email@exemple.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#f8fafc] mb-1">Mot de passe</label>
              <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#2a9d8f]" placeholder="••••••••" />
            </div>
            <ShimmerButton type="submit" className="w-full py-4 mt-4 rounded-xl">
              {authMode === "login" ? "Se connecter" : "S'inscrire maintenant"}
            </ShimmerButton>
          </form>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <span className="text-sm text-[#cbd5e1]">
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
  );
}
