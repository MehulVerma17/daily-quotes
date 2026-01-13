/**
 * Collections Store (Zustand)
 *
 * Manages user's collections state.
 * Provides centralized state for real-time quote count updates.
 */

import { create } from 'zustand';
import { getUserCollections } from '../services/collectionsService';
import { Collection } from '../types';

interface CollectionsState {
  // State
  collections: Collection[];
  loading: boolean;

  // Actions
  loadCollections: (userId: string) => Promise<void>;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  incrementQuoteCount: (collectionId: string) => void;
  decrementQuoteCount: (collectionId: string) => void;
  clearCollections: () => void;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  // Initial state
  collections: [],
  loading: false,

  // Load collections for a user
  loadCollections: async (userId: string) => {
    if (!userId) {
      set({ collections: [], loading: false });
      return;
    }

    set({ loading: true });

    try {
      const collections = await getUserCollections(userId);
      set({ collections, loading: false });
    } catch (error) {
      console.error('Error loading collections:', error);
      set({ loading: false });
    }
  },

  // Add a new collection to the store
  addCollection: (collection: Collection) => {
    set((state) => ({
      collections: [...state.collections, collection],
    }));
  },

  // Update an existing collection
  updateCollection: (id: string, updates: Partial<Collection>) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  // Remove a collection from the store
  deleteCollection: (id: string) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
  },

  // Increment quote count for a collection
  incrementQuoteCount: (collectionId: string) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, quote_count: (c.quote_count || 0) + 1 }
          : c
      ),
    }));
  },

  // Decrement quote count for a collection
  decrementQuoteCount: (collectionId: string) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, quote_count: Math.max((c.quote_count || 0) - 1, 0) }
          : c
      ),
    }));
  },

  // Clear collections (on logout)
  clearCollections: () => {
    set({
      collections: [],
      loading: false,
    });
  },
}));
