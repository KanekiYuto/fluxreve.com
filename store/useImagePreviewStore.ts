import { create } from 'zustand';

interface ImagePreviewStore {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  open: (images: string[], initialIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const useImagePreviewStore = create<ImagePreviewStore>((set, get) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,

  open: (images, initialIndex = 0) =>
    set({
      isOpen: true,
      images,
      currentIndex: Math.min(initialIndex, images.length - 1),
    }),

  close: () =>
    set({
      isOpen: false,
      images: [],
      currentIndex: 0,
    }),

  next: () => {
    const { images, currentIndex } = get();
    if (currentIndex < images.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goTo: (index) => {
    const { images } = get();
    if (index >= 0 && index < images.length) {
      set({ currentIndex: index });
    }
  },
}));

export default useImagePreviewStore;

