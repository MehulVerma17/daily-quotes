import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, SavedQuote } from '../types';
import { logger } from '../utils';

const FAVORITES_KEY = '@daily_quotes_favorites';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const getFavorites = async (): Promise<SavedQuote[]> => {
  logger.storage('GET', FAVORITES_KEY);

  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    if (jsonValue === null) {
      logger.info('No favorites found, returning empty array');
      return [];
    }

    const favorites = JSON.parse(jsonValue);
    logger.info('Favorites loaded', { count: favorites.length });
    return favorites;
  } catch (error) {
    logger.error('Storage GET Error', error);
    throw new StorageError('Failed to load saved quotes. Please try again.');
  }
};

export const saveFavorite = async (quote: Quote): Promise<SavedQuote[]> => {
  logger.storage('SAVE', FAVORITES_KEY, { quoteId: quote._id });

  try {
    const favorites = await getFavorites();

    // Check if already saved
    const exists = favorites.some((fav) => fav._id === quote._id);
    if (exists) {
      logger.warn('Quote already in favorites', { quoteId: quote._id });
      return favorites;
    }

    const savedQuote: SavedQuote = {
      ...quote,
      savedAt: new Date().toISOString(),
    };

    const updatedFavorites = [savedQuote, ...favorites];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));

    logger.info('Quote saved to favorites', { quoteId: quote._id, totalFavorites: updatedFavorites.length });
    return updatedFavorites;
  } catch (error) {
    logger.error('Storage SAVE Error', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to save quote. Please try again.');
  }
};

export const removeFavorite = async (quoteId: string): Promise<SavedQuote[]> => {
  logger.storage('REMOVE', FAVORITES_KEY, { quoteId });

  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter((fav) => fav._id !== quoteId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));

    logger.info('Quote removed from favorites', { quoteId, totalFavorites: updatedFavorites.length });
    return updatedFavorites;
  } catch (error) {
    logger.error('Storage REMOVE Error', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to remove quote. Please try again.');
  }
};

export const isFavorite = async (quoteId: string): Promise<boolean> => {
  logger.storage('CHECK', FAVORITES_KEY, { quoteId });

  try {
    const favorites = await getFavorites();
    const exists = favorites.some((fav) => fav._id === quoteId);
    logger.debug('Favorite check result', { quoteId, isFavorite: exists });
    return exists;
  } catch (error) {
    logger.error('Storage CHECK Error', error);
    return false;
  }
};

export const clearAllFavorites = async (): Promise<void> => {
  logger.storage('CLEAR', FAVORITES_KEY);

  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    logger.info('All favorites cleared');
  } catch (error) {
    logger.error('Storage CLEAR Error', error);
    throw new StorageError('Failed to clear favorites. Please try again.');
  }
};
