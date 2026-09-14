import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { useFormationState } from "./hooks/useFormationState";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SocialSection } from "./components/layout/SocialSection";
import { ChatBot } from "./components/chatbot/ChatBot";
import { AuthModal } from "./components/modals/AuthModal";
import { CartModal } from "./components/modals/CartModal";
import { CartCheckoutModal } from "./components/modals/CartCheckoutModal";
import { LightboxModal } from "./components/modals/LightboxModal";
import { ContactSection } from "./components/contact/ContactSection";

import { HeroPremium } from "./components/home/HeroPremium";
import { ParcoursPatient } from "./components/home/ParcoursPatient";
import { FormationsPremium } from "./components/home/FormationsPremium";
import { ProjectsMasonry } from "./components/home/ProjectsMasonry";
import { StatsPremium } from "./components/home/StatsPremium";
import { ImmersionSection } from "./components/home/ImmersionSection";
import { EquipePanorama } from "./components/home/EquipePanorama";

import { PathologiesPremium } from "./components/pages/PathologiesPremium";
import { TraitementsPremium } from "./components/pages/TraitementsPremium";
import { EquipePage } from "./components/pages/EquipePage";
import { FormationsPage } from "./components/pages/FormationsPage";
import { ProfilPage } from "./components/pages/ProfilPage";
import { AProposPage } from "./components/pages/AProposPage";
import { AssistantIA } from "./components/AssistantIA";

function AppContent() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const formationState = useFormationState();
  const {
    cart,
    setCart,
    showAuthModal,
    setShowAuthModal,
    showCartModal,
    setShowCartModal,
    showCartCheckoutModal,
    setShowCartCheckoutModal,
    setPurchasedFormations,
  } = formationState;

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        setIsAuthenticated={formationState.setIsAuthenticated}
        userRole={formationState.userRole}
        setUserRole={formationState.setUserRole}
        authMode={formationState.authMode}
        setAuthMode={formationState.setAuthMode}
      />
      <CartModal
        showCartModal={showCartModal}
        setShowCartModal={setShowCartModal}
        cart={cart}
        setCart={setCart}
        setShowCartCheckoutModal={setShowCartCheckoutModal}
      />
      <CartCheckoutModal
        showCartCheckoutModal={showCartCheckoutModal}
        setShowCartCheckoutModal={setShowCartCheckoutModal}
        cart={cart}
        setCart={setCart}
        setPurchasedFormations={setPurchasedFormations}
      />

      <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "Inter, system-ui, sans-serif" }}>
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="relative w-full overflow-hidden flex-1">
          <Routes location={location}>
            <Route
              path="/"
              element={
                <>
                  <HeroPremium />
                  <ParcoursPatient />
                  <ImmersionSection />
                  <FormationsPremium />
                  <ProjectsMasonry />
                  <EquipePanorama />
                  <StatsPremium />
                </>
              }
            />
            <Route path="/pathologies" element={<PathologiesPremium />} />
            <Route path="/traitements" element={<TraitementsPremium />} />
            <Route path="/equipe" element={<EquipePage />} />
            <Route
              path="/ia"
              element={
                <AssistantIA
                  isAuthenticated={formationState.isAuthenticated}
                  userRole={formationState.userRole}
                  setShowAuthModal={setShowAuthModal}
                />
              }
            />
            <Route path="/formations" element={<FormationsPage {...formationState} />} />
            <Route path="/formations/:categoryId" element={<FormationsPage {...formationState} />} />
            <Route
              path="/mon-profil"
              element={
                <ProfilPage
                  purchasedFormations={formationState.purchasedFormations}
                  setIsAuthenticated={formationState.setIsAuthenticated}
                  selectedPurchasedVideo={formationState.selectedPurchasedVideo}
                  setSelectedPurchasedVideo={formationState.setSelectedPurchasedVideo}
                />
              }
            />
            <Route path="/a-propos" element={<AProposPage />} />
          </Routes>
        </div>

        <SocialSection />
        {["/", "/a-propos"].includes(location.pathname) && <ContactSection />}
        <Footer />
        <ChatBot />
        <LightboxModal lightboxIndex={lightboxIndex} setLightboxIndex={setLightboxIndex} />
      </div>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
