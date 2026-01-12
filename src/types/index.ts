export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

export interface SavedQuote extends Quote {
  savedAt: string; // ISO date string
}

// ZenQuotes API response format
export interface ZenQuoteResponse {
  q: string;  // quote text
  a: string;  // author
  h: string;  // HTML formatted quote
}
