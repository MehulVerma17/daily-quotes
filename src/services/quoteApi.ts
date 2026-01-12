import { Quote, ZenQuoteResponse } from '../types';
import { logger } from '../utils';

// Using ZenQuotes API (Quotable API is down)
const BASE_URL = 'https://zenquotes.io/api';

// Default tags since ZenQuotes doesn't provide them
const DEFAULT_TAGS = ['inspiration', 'wisdom', 'life', 'motivation', 'mindfulness'];

const getRandomTags = (): string[] => {
  const shuffled = [...DEFAULT_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

const generateId = (quote: string, author: string): string => {
  // Generate a simple hash-based ID from quote and author
  const str = `${quote}-${author}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export class QuoteApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'QuoteApiError';
  }
}

export const fetchRandomQuote = async (): Promise<Quote> => {
  const url = `${BASE_URL}/random`;
  logger.api('GET', url);

  try {
    const response = await fetch(url);

    logger.api('GET', url, response.status);

    if (!response.ok) {
      const errorMsg = `Failed to fetch quote: ${response.statusText}`;
      logger.error('API Error', { status: response.status, message: errorMsg });
      throw new QuoteApiError(errorMsg, response.status);
    }

    const data: ZenQuoteResponse[] = await response.json();

    // ZenQuotes returns an array, we take the first item
    if (!data || data.length === 0) {
      throw new QuoteApiError('No quote received from API');
    }

    const zenQuote = data[0];
    logger.info('Quote fetched successfully', { author: zenQuote.a });

    // Transform ZenQuotes response to our Quote format
    return {
      _id: generateId(zenQuote.q, zenQuote.a),
      content: zenQuote.q,
      author: zenQuote.a,
      tags: getRandomTags(),
    };
  } catch (error) {
    if (error instanceof QuoteApiError) {
      throw error;
    }

    logger.error('Network/Fetch Error', error);

    if (error instanceof TypeError) {
      throw new QuoteApiError('No internet connection. Please check your network.');
    }

    throw new QuoteApiError('Unable to fetch quote. Please try again later.');
  }
};
