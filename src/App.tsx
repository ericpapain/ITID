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

// Pages Stratégiques Référencement & SEO Local Troyes / Aube
const CentreDouleurTroyesPage = React.lazy(() =>
  import("./components/pages/CentreDouleurTroyesPage").then((m) => ({ default: m.CentreDouleurTroyesPage }))
);
const PriseEnChargeDouleurPage = React.lazy(() =>
  import("./components/pages/PriseEnChargeDouleurPage").then((m) => ({ default: m.PriseEnChargeDouleurPage }))
);
const ConsultationSuiviDouleurPage = React.lazy(() =>
  import("./components/pages/ConsultationSuiviDouleurPage").then((m) => ({ default: m.ConsultationSuiviDouleurPage }))
);
import { SEOHead } from "./components/seo/SEOHead";

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
                    <SEOHead
                      title="Centre du Traitement de la Douleur à Troyes (10)"
                      description="Institut spécialisé dans l'évaluation et le traitement interventionnel guidé des douleurs chroniques et rebelles à Troyes (Aube). Infiltrations, radiofréquence, cryoneurolyse et consultations d'algologie."
                      canonical="https://itid-france.com/"
                    />
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
              {/* Pages Stratégiques Référencement Local Troyes & Intentions Majeures */}
              <Route path="/centre-douleur-troyes" element={<CentreDouleurTroyesPage />} />
              <Route path="/medecine-douleur-troyes" element={<CentreDouleurTroyesPage />} />
              <Route path="/prise-en-charge-douleur-chronique" element={<PriseEnChargeDouleurPage />} />
              <Route path="/consultation-suivi-douleur" element={<ConsultationSuiviDouleurPage />} />
              <Route path="/traitement-interventionnel-douleur" element={<TraitementsPremium />} />
              <Route path="/pathologies-douleur" element={<PathologiesPremium />} />

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
