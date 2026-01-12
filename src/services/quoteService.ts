/**
 * Quote Service
 *
 * Handles all quote-related database operations with Supabase.
 * Includes fetching quotes, filtering by category, search, and quote of the day.
 */

import { supabase, TABLES, API_CONFIG } from '../config';
import { Quote, QuoteOfDay, PaginatedResponse } from '../types';

/**
 * Fetches all quotes with optional pagination
 */
export const getQuotes = async (
  page = 1,
  pageSize = API_CONFIG.defaultPageSize
): Promise<PaginatedResponse<Quote>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(TABLES.QUOTES)
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > to + 1,
  };
};

/**
 * Fetches quotes by category with pagination
 */
export const getQuotesByCategory = async (
  category: string,
  page = 1,
  pageSize = API_CONFIG.defaultPageSize
): Promise<PaginatedResponse<Quote>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(TABLES.QUOTES)
    .select('*', { count: 'exact' })
    .eq('category', category)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes by category:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > to + 1,
  };
};

/**
 * Searches quotes by content or author
 */
export const searchQuotes = async (
  query: string,
  page = 1,
  pageSize = API_CONFIG.defaultPageSize
): Promise<PaginatedResponse<Quote>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const searchPattern = `%${query}%`;

  const { data, error, count } = await supabase
    .from(TABLES.QUOTES)
    .select('*', { count: 'exact' })
    .or(`content.ilike.${searchPattern},author.ilike.${searchPattern}`)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching quotes:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > to + 1,
  };
};

/**
 * Fetches quotes by author
 */
export const getQuotesByAuthor = async (
  author: string,
  page = 1,
  pageSize = API_CONFIG.defaultPageSize
): Promise<PaginatedResponse<Quote>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(TABLES.QUOTES)
    .select('*', { count: 'exact' })
    .ilike('author', `%${author}%`)
    .range(from, to)
    .order('author', { ascending: true });

  if (error) {
    console.error('Error fetching quotes by author:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > to + 1,
  };
};

/**
 * Gets a random quote
 */
export const getRandomQuote = async (): Promise<Quote | null> => {
  // Get total count
  const { count } = await supabase
    .from(TABLES.QUOTES)
    .select('*', { count: 'exact', head: true });

  if (!count || count === 0) return null;

  // Get random offset
  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from(TABLES.QUOTES)
    .select('*')
    .range(randomOffset, randomOffset)
    .single();

  if (error) {
    console.error('Error fetching random quote:', error);
    return null;
  }

  return data;
};

/**
 * Gets the quote of the day
 * Returns existing QOTD if one exists for today, otherwise creates a new one
 */
export const getQuoteOfDay = async (): Promise<Quote | null> => {
  const today = new Date().toISOString().split('T')[0];

  // Check if QOTD exists for today
  const { data: existingQotd, error: fetchError } = await supabase
    .from(TABLES.QUOTE_OF_DAY)
    .select(`
      *,
      quote:quotes(*)
    `)
    .eq('date', today)
    .single();

  if (existingQotd?.quote) {
    return existingQotd.quote as Quote;
  }

  // Create new QOTD
  const randomQuote = await getRandomQuote();
  if (!randomQuote) return null;

  const { error: insertError } = await supabase
    .from(TABLES.QUOTE_OF_DAY)
    .insert({ quote_id: randomQuote.id, date: today });

  if (insertError) {
    console.error('Error creating QOTD:', insertError);
  }

  return randomQuote;
};

/**
 * Gets a single quote by ID
 */
export const getQuoteById = async (quoteId: string): Promise<Quote | null> => {
  const { data, error } = await supabase
    .from(TABLES.QUOTES)
    .select('*')
    .eq('id', quoteId)
    .single();

  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }

  return data;
};

/**
 * Gets unique authors from all quotes
 */
export const getUniqueAuthors = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from(TABLES.QUOTES)
    .select('author')
    .order('author', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    return [];
  }

  const uniqueAuthors = [...new Set(data?.map((q) => q.author) || [])];
  return uniqueAuthors;
};
