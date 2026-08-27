import { create } from 'zustand';

type BodyPart = 'head' | 'neck' | 'shoulder' | 'elbow' | 'wrist_hand' | 'fingers' | 'spine' | 'back' | 'abdomen' | 'pelvis' | 'hip' | 'thigh' | 'knee' | 'ankle' | 'toes' | null;
type ViewMode = 'front' | 'back' | 'left' | 'right';
type Layer = 'skin' | 'muscles' | 'nerves' | 'joints' | 'pain';

interface AnatomyState {
  selectedBodyPart: BodyPart;
  selectedBodyParts: NonNullable<BodyPart>[];
  isMultiSelect: boolean;
  setIsMultiSelect: (val: boolean) => void;
  setSelectedBodyPart: (part: BodyPart) => void;
  
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  activeLayers: Record<Layer, boolean>;
  toggleLayer: (layer: Layer) => void;
}

export const useAnatomyStore = create<AnatomyState>((set) => ({
  selectedBodyPart: null,
  selectedBodyParts: [],
  isMultiSelect: false,
  setIsMultiSelect: (val) => set({ isMultiSelect: val, selectedBodyParts: [], selectedBodyPart: null }),
  setSelectedBodyPart: (part) => set((state) => {
    if (!state.isMultiSelect) {
      return { selectedBodyPart: part, selectedBodyParts: part ? [part as NonNullable<BodyPart>] : [] };
    }
    if (!part) return { selectedBodyPart: null, selectedBodyParts: [] };
    
    const exists = state.selectedBodyParts.includes(part as NonNullable<BodyPart>);
    const newParts = exists 
      ? state.selectedBodyParts.filter(p => p !== part)
      : [...state.selectedBodyParts, part as NonNullable<BodyPart>];
    
    return { 
      selectedBodyParts: newParts,
      selectedBodyPart: newParts.length > 0 ? newParts[newParts.length - 1] : null
    };
  }),

  viewMode: 'front',
  setViewMode: (mode) => set({ viewMode: mode }),

  activeLayers: {
    skin: true,
    muscles: false,
    nerves: false,
    joints: true,
    pain: false,
  },
  toggleLayer: (layer) => set((state) => ({
    activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] }
  })),
}));
