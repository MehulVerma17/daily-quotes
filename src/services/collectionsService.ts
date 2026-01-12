/**
 * Collections Service
 *
 * Handles all collection-related database operations with Supabase.
 * Includes creating, updating, deleting collections and managing quotes in collections.
 */

import { supabase, TABLES } from '../config';
import { Collection, CollectionQuote, CollectionWithQuotes, Quote } from '../types';

/**
 * Gets all collections for a user
 */
export const getUserCollections = async (userId: string): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from(TABLES.COLLECTIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }

  // Get quote counts for each collection
  const collectionsWithCounts = await Promise.all(
    (data || []).map(async (collection) => {
      const { count } = await supabase
        .from(TABLES.COLLECTION_QUOTES)
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collection.id);
      return { ...collection, quote_count: count || 0 };
    })
  );

  return collectionsWithCounts;
};

/**
 * Gets a single collection with its quotes
 */
export const getCollectionWithQuotes = async (
  collectionId: string
): Promise<CollectionWithQuotes | null> => {
  // Get collection details
  const { data: collection, error: collectionError } = await supabase
    .from(TABLES.COLLECTIONS)
    .select('*')
    .eq('id', collectionId)
    .single();

  if (collectionError || !collection) {
    console.error('Error fetching collection:', collectionError);
    return null;
  }

  // Get quotes in collection
  const { data: collectionQuotes, error: quotesError } = await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .select(`
      *,
      quote:quotes(*)
    `)
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (quotesError) {
    console.error('Error fetching collection quotes:', quotesError);
    return { ...collection, quotes: [] };
  }

  const quotes = collectionQuotes
    ?.map((cq: any) => cq.quote)
    .filter((q): q is Quote => !!q) || [];

  return { ...collection, quotes };
};

/**
 * Creates a new collection
 */
export const createCollection = async (
  userId: string,
  name: string,
  description?: string,
  icon = 'folder',
  color = '#C4785A'
): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from(TABLES.COLLECTIONS)
    .insert({
      user_id: userId,
      name,
      description: description || null,
      icon,
      color,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    throw error;
  }

  return data;
};

/**
 * Updates a collection
 */
export const updateCollection = async (
  collectionId: string,
  updates: Partial<Pick<Collection, 'name' | 'description' | 'icon' | 'color'>>
): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from(TABLES.COLLECTIONS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', collectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    throw error;
  }

  return data;
};

/**
 * Deletes a collection and all its quotes
 */
export const deleteCollection = async (collectionId: string): Promise<boolean> => {
  // Delete collection quotes first (foreign key constraint)
  await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .delete()
    .eq('collection_id', collectionId);

  const { error } = await supabase
    .from(TABLES.COLLECTIONS)
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }

  return true;
};

/**
 * Adds a quote to a collection
 */
export const addQuoteToCollection = async (
  collectionId: string,
  quoteId: string
): Promise<CollectionQuote | null> => {
  // Check if already exists
  const { data: existing } = await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .select('id')
    .eq('collection_id', collectionId)
    .eq('quote_id', quoteId)
    .single();

  if (existing) {
    console.log('Quote already in collection');
    return null;
  }

  const { data, error } = await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .insert({ collection_id: collectionId, quote_id: quoteId })
    .select()
    .single();

  if (error) {
    console.error('Error adding quote to collection:', error);
    throw error;
  }

  return data;
};

/**
 * Removes a quote from a collection
 */
export const removeQuoteFromCollection = async (
  collectionId: string,
  quoteId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .delete()
    .eq('collection_id', collectionId)
    .eq('quote_id', quoteId);

  if (error) {
    console.error('Error removing quote from collection:', error);
    throw error;
  }

  return true;
};

/**
 * Gets collection count for a user
 */
export const getCollectionCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from(TABLES.COLLECTIONS)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting collection count:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Checks if a quote is in a specific collection
 */
export const isQuoteInCollection = async (
  collectionId: string,
  quoteId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from(TABLES.COLLECTION_QUOTES)
    .select('id')
    .eq('collection_id', collectionId)
    .eq('quote_id', quoteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking collection quote:', error);
  }

  return !!data;
};
