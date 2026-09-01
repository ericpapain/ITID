import { create } from 'zustand';

interface TransitionState {
  isAnimating: boolean;
  targetRoute: string | null;
  startTransition: (route: string) => void;
  endTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isAnimating: false,
  targetRoute: null,
  startTransition: (route: string) => set({ isAnimating: true, targetRoute: route }),
  endTransition: () => set({ isAnimating: false, targetRoute: null }),
}));
