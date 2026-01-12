/**
 * Favorites Store (Zustand)
 *
 * Manages user's favorite quotes state.
 * Replaces FavoritesContext with simpler, more performant state management.
 */

import { create } from 'zustand';
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
} from '../services/favoritesService';
import { Quote, UserFavorite } from '../types';

interface FavoritesState {
  // State
  favorites: UserFavorite[];
  favoriteIds: Set<string>;
  loading: boolean;

  // Actions
  loadFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, quote: Quote) => Promise<void>;
  isFavorite: (quoteId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  // Initial state
  favorites: [],
  favoriteIds: new Set<string>(),
  loading: false,

  // Load favorites for a user
  loadFavorites: async (userId: string) => {
    if (!userId) {
      set({ favorites: [], favoriteIds: new Set() });
      return;
    }

    set({ loading: true });

    try {
      const data = await getUserFavorites(userId);
      set({
        favorites: data,
        favoriteIds: new Set(data.map((f) => f.quote_id)),
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Check if a quote is favorited
  isFavorite: (quoteId: string) => {
    return get().favoriteIds.has(quoteId);
  },

  // Toggle favorite status
  toggleFavorite: async (userId: string, quote: Quote) => {
    if (!userId) return;

    const { favoriteIds, favorites, loadFavorites } = get();
    const quoteId = quote.id;
    const isCurrentlyFavorite = favoriteIds.has(quoteId);

    // Optimistic update
    if (isCurrentlyFavorite) {
      const newIds = new Set(favoriteIds);
      newIds.delete(quoteId);
      set({
        favoriteIds: newIds,
        favorites: favorites.filter((f) => f.quote_id !== quoteId),
      });
    } else {
      set({
        favoriteIds: new Set(favoriteIds).add(quoteId),
      });
    }

    try {
      if (isCurrentlyFavorite) {
        await removeFromFavorites(userId, quoteId);
      } else {
        const newFavorite = await addToFavorites(userId, quoteId);
        if (newFavorite) {
          set((state) => ({
            favorites: [newFavorite, ...state.favorites],
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      loadFavorites(userId);
    }
  },

  // Clear favorites (on logout)
  clearFavorites: () => {
    set({
      favorites: [],
      favoriteIds: new Set(),
      loading: false,
    });
  },
}));
