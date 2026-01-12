/**
 * Favorites Service
 *
 * Handles all favorite-related database operations with Supabase.
 * Includes adding, removing, and fetching user favorites.
 */

import { supabase, TABLES } from '../config';
import { Quote, UserFavorite } from '../types';

/**
 * Gets all favorites for a user
 */
export const getUserFavorites = async (userId: string): Promise<UserFavorite[]> => {
  const { data, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select(`
      *,
      quote:quotes(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }

  return data || [];
};

/**
 * Adds a quote to user's favorites
 */
export const addToFavorites = async (
  userId: string,
  quoteId: string
): Promise<UserFavorite | null> => {
  // Check if already favorited
  const { data: existing } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select('id')
    .eq('user_id', userId)
    .eq('quote_id', quoteId)
    .single();

  if (existing) {
    console.log('Quote already in favorites');
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .insert({ user_id: userId, quote_id: quoteId })
    .select(`
      *,
      quote:quotes(*)
    `)
    .single();

  if (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }

  return data;
};

/**
 * Removes a quote from user's favorites
 */
export const removeFromFavorites = async (
  userId: string,
  quoteId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .delete()
    .eq('user_id', userId)
    .eq('quote_id', quoteId);

  if (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }

  return true;
};

/**
 * Checks if a quote is in user's favorites
 */
export const isFavorite = async (
  userId: string,
  quoteId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select('id')
    .eq('user_id', userId)
    .eq('quote_id', quoteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite:', error);
  }

  return !!data;
};

/**
 * Gets favorite count for a user
 */
export const getFavoriteCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Gets unique categories from user's favorites
 */
export const getFavoriteCategories = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select(`
      quote:quotes(category)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorite categories:', error);
    return [];
  }

  const categories = data
    ?.map((f: any) => f.quote?.category)
    .filter((c): c is string => !!c);
  return [...new Set(categories)];
};

/**
 * Gets unique authors from user's favorites
 */
export const getFavoriteAuthors = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from(TABLES.USER_FAVORITES)
    .select(`
      quote:quotes(author)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorite authors:', error);
    return [];
  }

  const authors = data
    ?.map((f: any) => f.quote?.author)
    .filter((a): a is string => !!a);
  return [...new Set(authors)];
};
