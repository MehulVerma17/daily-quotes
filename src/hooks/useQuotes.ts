import { useState, useCallback } from 'react';
import { Quote } from '../types';
import { fetchRandomQuote } from '../services/quoteApi';
import { logger } from '../utils';
import Toast from 'react-native-toast-message';

export const useQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNewQuote = useCallback(async () => {
    logger.info('Fetching new quote...');

    try {
      setLoading(true);
      setError(null);
      const quote = await fetchRandomQuote();
      setCurrentQuote(quote);
      logger.info('New quote set', { author: quote.author });
      return quote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      logger.error('useQuotes error', err);
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentQuote,
    loading,
    error,
    getNewQuote,
  };
};
