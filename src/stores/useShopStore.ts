import { create } from 'zustand';
import { CoffeeShop } from '@/types/shop';

interface ShopState {
  shops: CoffeeShop[];
  nearbyShops: CoffeeShop[];
  selectedShop: CoffeeShop | null;
  favorites: string[]; // place_id list
  setShops: (shops: CoffeeShop[]) => void;
  setNearbyShops: (shops: CoffeeShop[]) => void;
  setSelectedShop: (shop: CoffeeShop | null) => void;
  setFavorites: (placeIds: string[]) => void;
  toggleFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  nearbyShops: [],
  selectedShop: null,
  favorites: [],
  setShops: (shops) => set({ shops }),
  setNearbyShops: (nearbyShops) => set({ nearbyShops }),
  setSelectedShop: (selectedShop) => set({ selectedShop }),
  setFavorites: (favorites) => set({ favorites }),
  toggleFavorite: (placeId) =>
    set((state) => {
      const exists = state.favorites.includes(placeId);
      const updated = exists
        ? state.favorites.filter((id) => id !== placeId)
        : [...state.favorites, placeId];
      return { favorites: updated };
    }),
  isFavorite: (placeId) => get().favorites.includes(placeId),
}));
