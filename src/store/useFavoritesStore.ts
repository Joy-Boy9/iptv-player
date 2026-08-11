// =============================================
// Favorites Store - Manages favorite channels
// =============================================

import { create } from 'zustand';
import { storage } from '../utils/storage';

interface FavoritesStore {
  favoriteIds: Set<string>;

  // Actions
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set<string>(storage.get<string[]>('favorites', [])),

  toggleFavorite: (channelId) => {
    const { favoriteIds } = get();
    const newSet = new Set(favoriteIds);

    if (newSet.has(channelId)) {
      newSet.delete(channelId);
    } else {
      newSet.add(channelId);
    }

    storage.set('favorites', Array.from(newSet));
    set({ favoriteIds: newSet });
  },

  isFavorite: (channelId) => {
    return get().favoriteIds.has(channelId);
  },

  clearFavorites: () => {
    storage.set('favorites', []);
    set({ favoriteIds: new Set() });
  },
}));
