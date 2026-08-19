import { create } from 'zustand';
import { ShopFilterState } from '@/types/shop';

export interface ImagePreviewItem {
  url: string;
  title?: string;
  category?: string;
}

interface ImagePreviewState {
  isOpen: boolean;
  images: ImagePreviewItem[];
  currentIndex: number;
}

interface UIState {
  viewMode: 'map' | 'list';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  filters: ShopFilterState;
  mobileNavOpen: boolean;
  imagePreview: ImagePreviewState;
  setViewMode: (mode: 'map' | 'list') => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ShopFilterState>) => void;
  resetFilters: () => void;
  toggleMobileNav: () => void;
  openImagePreview: (images: (string | ImagePreviewItem)[], initialIndex?: number) => void;
  closeImagePreview: () => void;
  nextImagePreview: () => void;
  prevImagePreview: () => void;
  setImagePreviewIndex: (index: number) => void;
}

const defaultFilters: ShopFilterState = {
  openNowOnly: false,
  minRating: 0,
  sortBy: 'distance',
};

const defaultImagePreview: ImagePreviewState = {
  isOpen: false,
  images: [],
  currentIndex: 0,
};

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'map',
  searchQuery: '',
  isLoading: false,
  error: null,
  filters: defaultFilters,
  mobileNavOpen: false,
  imagePreview: defaultImagePreview,
  setViewMode: (viewMode) => set({ viewMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      searchQuery: '',
      filters: defaultFilters,
    }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  openImagePreview: (images, initialIndex = 0) => {
    const formattedImages: ImagePreviewItem[] = images.map((img) =>
      typeof img === 'string' ? { url: img } : img
    );
    if (formattedImages.length === 0) return;
    const safeIndex = Math.max(0, Math.min(initialIndex, formattedImages.length - 1));
    set({
      imagePreview: {
        isOpen: true,
        images: formattedImages,
        currentIndex: safeIndex,
      },
    });
  },
  closeImagePreview: () =>
    set({
      imagePreview: {
        isOpen: false,
        images: [],
        currentIndex: 0,
      },
    }),
  nextImagePreview: () =>
    set((state) => {
      const { images, currentIndex } = state.imagePreview;
      if (images.length <= 1) return state;
      const nextIndex = (currentIndex + 1) % images.length;
      return {
        imagePreview: {
          ...state.imagePreview,
          currentIndex: nextIndex,
        },
      };
    }),
  prevImagePreview: () =>
    set((state) => {
      const { images, currentIndex } = state.imagePreview;
      if (images.length <= 1) return state;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      return {
        imagePreview: {
          ...state.imagePreview,
          currentIndex: prevIndex,
        },
      };
    }),
  setImagePreviewIndex: (currentIndex) =>
    set((state) => ({
      imagePreview: {
        ...state.imagePreview,
        currentIndex: Math.max(0, Math.min(currentIndex, state.imagePreview.images.length - 1)),
      },
    })),
}));
