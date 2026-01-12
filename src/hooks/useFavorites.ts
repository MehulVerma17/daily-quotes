import { useState, useEffect, useCallback } from 'react';
import { SavedQuote, Quote } from '../types';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
} from '../services/storage';
import { logger } from '../utils';
import Toast from 'react-native-toast-message';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    logger.info('Loading favorites...');

    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data);
      logger.info('Favorites loaded into state', { count: data.length });
    } catch (error) {
      logger.error('useFavorites loadFavorites error', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to load favorites',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(async (quote: Quote) => {
    logger.info('Adding quote to favorites...', { quoteId: quote._id });

    try {
      const updated = await saveFavorite(quote);
      setFavorites(updated);
      logger.info('Favorites state updated after add');
      Toast.show({
        type: 'success',
        text1: 'Saved!',
        text2: 'Quote added to favorites',
      });
      return true;
    } catch (error) {
      logger.error('useFavorites addFavorite error', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to save quote',
      });
      return false;
    }
  }, []);

  const removeFavoriteById = useCallback(async (quoteId: string) => {
    logger.info('Removing quote from favorites...', { quoteId });

    try {
      const updated = await removeFavorite(quoteId);
      setFavorites(updated);
      logger.info('Favorites state updated after remove');
      Toast.show({
        type: 'success',
        text1: 'Removed',
        text2: 'Quote removed from favorites',
      });
      return true;
    } catch (error) {
      logger.error('useFavorites removeFavorite error', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to remove quote',
      });
      return false;
    }
  }, []);

  const checkFavorite = useCallback(async (quoteId: string): Promise<boolean> => {
    return await checkIsFavorite(quoteId);
  }, []);

  const isFavoriteSync = useCallback(
    (quoteId: string): boolean => {
      return favorites.some((fav) => fav._id === quoteId);
    },
    [favorites]
  );

  const getUniqueTags = useCallback((): string[] => {
    const tagsSet = new Set<string>();
    favorites.forEach((quote) => {
      quote.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite: removeFavoriteById,
    checkFavorite,
    isFavoriteSync,
    getUniqueTags,
    refreshFavorites: loadFavorites,
  };
};
