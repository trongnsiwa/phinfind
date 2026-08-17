import { create } from 'zustand';
import { ShopFilterState } from '@/types/shop';

interface UIState {
  viewMode: 'map' | 'list';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  filters: ShopFilterState;
  mobileNavOpen: boolean;
  setViewMode: (mode: 'map' | 'list') => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ShopFilterState>) => void;
  resetFilters: () => void;
  toggleMobileNav: () => void;
}

const defaultFilters: ShopFilterState = {
  openNowOnly: false,
  minRating: 0,
  sortBy: 'distance',
  searchQuery: '',
};

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'map',
  searchQuery: '',
  isLoading: false,
  error: null,
  filters: defaultFilters,
  mobileNavOpen: false,
  setViewMode: (viewMode) => set({ viewMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}));
