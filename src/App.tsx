import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import React, { Suspense } from "react";

import { useFormationState } from "./hooks/useFormationState";
import { useVisitorTracker } from "./hooks/useVisitorTracker";

import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SocialSection } from "./components/layout/SocialSection";
import { ChatBot } from "./components/chatbot/ChatBot";
import { AuthModal } from "./components/modals/AuthModal";
import { CartModal } from "./components/modals/CartModal";
import { CartCheckoutModal } from "./components/modals/CartCheckoutModal";
import { LightboxModal } from "./components/modals/LightboxModal";
import { ContactSection } from "./components/contact/ContactSection";

// Synchronous Homepage Components for instant render
import { HeroPremium } from "./components/home/HeroPremium";
import { ParcoursPatient } from "./components/home/ParcoursPatient";
import { FormationsPremium } from "./components/home/FormationsPremium";
import { ProjectsMasonry } from "./components/home/ProjectsMasonry";
import { StatsPremium } from "./components/home/StatsPremium";
import { ImmersionSection } from "./components/home/ImmersionSection";
import { EquipePanorama } from "./components/home/EquipePanorama";

// Lazy-loaded secondary routes for optimal initial bundle size and mobile speed
const PathologiesPremium = React.lazy(() =>
  import("./components/pages/PathologiesPremium").then((m) => ({ default: m.PathologiesPremium }))
);
const PathologyDetailPage = React.lazy(() =>
  import("./components/pages/PathologyDetailPage").then((m) => ({ default: m.PathologyDetailPage }))
);
const TraitementsPremium = React.lazy(() =>
  import("./components/pages/TraitementsPremium").then((m) => ({ default: m.TraitementsPremium }))
);
const TreatmentDetailPage = React.lazy(() =>
  import("./components/pages/TreatmentDetailPage").then((m) => ({ default: m.TreatmentDetailPage }))
);
const FormationsPage = React.lazy(() =>
  import("./components/pages/FormationsPage").then((m) => ({ default: m.FormationsPage }))
);
const ProfilPage = React.lazy(() =>
  import("./components/pages/ProfilPage").then((m) => ({ default: m.ProfilPage }))
);
const AProposPage = React.lazy(() =>
  import("./components/pages/AProposPage").then((m) => ({ default: m.AProposPage }))
);
const AssistantIA = React.lazy(() =>
  import("./components/AssistantIA").then((m) => ({ default: m.AssistantIA }))
);
const BlogPage = React.lazy(() => import("./components/pages/BlogPage"));
const BlogPostPage = React.lazy(() => import("./components/pages/BlogPostPage"));
const AdminApp = React.lazy(() => import("./admin/AdminApp"));

// Clean loader for route transitions
const PageLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-[#0c1a2e]">
    <div className="w-12 h-12 border-4 border-[#48cae4]/30 border-t-[#48cae4] rounded-full animate-spin"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  useVisitorTracker();

  // Route dédiée Back-Office Administrateur isolée du frontend public
  if (location.pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

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

  // Masquage de la section contact sur les pages dédiées demandées par l'utilisateur
  const hideContactRoutes = [
    "/traitements",
    "/pathologies",
    "/formations",
    "/ia",
    "/actualites",
  ];
  const shouldHideContact = hideContactRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

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

      <div
        className="min-h-screen"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="relative w-full overflow-hidden flex-1">
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/pathologies/:slug" element={<PathologyDetailPage />} />
              <Route path="/traitements" element={<TraitementsPremium />} />
              <Route path="/traitements/:slug" element={<TreatmentDetailPage />} />
              <Route path="/actualites" element={<BlogPage />} />
              <Route path="/actualites/:id" element={<BlogPostPage />} />
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
          </Suspense>
        </div>

        <SocialSection />
        {!shouldHideContact && <ContactSection />}
        <Footer />
      </div>

      <ChatBot />

      <LightboxModal
        lightboxIndex={lightboxIndex}
        setLightboxIndex={setLightboxIndex}
      />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
