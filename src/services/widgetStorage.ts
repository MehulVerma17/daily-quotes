/**
 * Widget Storage Service
 *
 * Handles AsyncStorage operations for the Android widget.
 * Acts as a bridge between the main app and the widget process.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_QUOTE_KEY = '@widget_quote';

export interface WidgetQuoteData {
  content: string;
  author: string;
  updatedAt: string;
}

/**
 * Saves the Quote of the Day to AsyncStorage for widget access
 */
export const saveWidgetQuote = async (quote: { content: string; author: string }): Promise<void> => {
  try {
    const data: WidgetQuoteData = {
      content: quote.content,
      author: quote.author,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WIDGET_QUOTE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving widget quote:', error);
  }
};

/**
 * Retrieves the stored Quote of the Day for the widget
 */
export const getWidgetQuote = async (): Promise<WidgetQuoteData | null> => {
  try {
    const data = await AsyncStorage.getItem(WIDGET_QUOTE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting widget quote:', error);
    return null;
  }
};
