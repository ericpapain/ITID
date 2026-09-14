import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Video, Category } from "../data";
import { useTransitionStore } from "../store/transitionStore";

interface UseFormationStateReturn {
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: "patient" | "pro";
  setUserRole: React.Dispatch<React.SetStateAction<"patient" | "pro">>;
  showAuthModal: boolean;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: "login" | "register";
  setAuthMode: React.Dispatch<React.SetStateAction<"login" | "register">>;
  // Cart
  cart: Video[];
  setCart: React.Dispatch<React.SetStateAction<Video[]>>;
  showCartModal: boolean;
  setShowCartModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCartCheckoutModal: boolean;
  setShowCartCheckoutModal: React.Dispatch<React.SetStateAction<boolean>>;
  // Profile
  showProfileModal: boolean;
  setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
  purchasedFormations: Video[];
  setPurchasedFormations: React.Dispatch<React.SetStateAction<Video[]>>;
  selectedPurchasedVideo: Video | null;
  setSelectedPurchasedVideo: React.Dispatch<React.SetStateAction<Video | null>>;
  // Formations
  selectedCategory: Category | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  selectedVideoDetail: Video | null;
  setSelectedVideoDetail: React.Dispatch<React.SetStateAction<Video | null>>;
  checkoutVideo: Video | null;
  setCheckoutVideo: React.Dispatch<React.SetStateAction<Video | null>>;
  formationMode: "3d" | "classic";
  setFormationMode: React.Dispatch<React.SetStateAction<"3d" | "classic">>;
  formationFilter: string;
  setFormationFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedSuggestedVideos: Video[];
  setSelectedSuggestedVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  // Handlers
  handleCategoryClick: (cat: Category) => void;
}

export function useFormationState(): UseFormationStateReturn {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"patient" | "pro">("patient");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [cart, setCart] = useState<Video[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCartCheckoutModal, setShowCartCheckoutModal] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [purchasedFormations, setPurchasedFormations] = useState<Video[]>([]);
  const [selectedPurchasedVideo, setSelectedPurchasedVideo] = useState<Video | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<Video | null>(null);
  const [checkoutVideo, setCheckoutVideo] = useState<Video | null>(null);
  const [formationMode, setFormationMode] = useState<"3d" | "classic">("3d");
  const [formationFilter, setFormationFilter] = useState("Tous");
  const [selectedSuggestedVideos, setSelectedSuggestedVideos] = useState<Video[]>([]);

  const handleCategoryClick = (cat: Category) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setSelectedVideoDetail(null);
      navigate("/formations/" + cat.tag.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    cart,
    setCart,
    showCartModal,
    setShowCartModal,
    showCartCheckoutModal,
    setShowCartCheckoutModal,
    showProfileModal,
    setShowProfileModal,
    purchasedFormations,
    setPurchasedFormations,
    selectedPurchasedVideo,
    setSelectedPurchasedVideo,
    selectedCategory,
    setSelectedCategory,
    selectedVideoDetail,
    setSelectedVideoDetail,
    checkoutVideo,
    setCheckoutVideo,
    formationMode,
    setFormationMode,
    formationFilter,
    setFormationFilter,
    selectedSuggestedVideos,
    setSelectedSuggestedVideos,
    handleCategoryClick,
  };
}
