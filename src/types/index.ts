/**
 * Type Definitions for QuoteVault App
 *
 * This file contains all TypeScript interfaces and types used throughout the app.
 * Types are organized by feature/domain for easy navigation.
 */

import { User } from '@supabase/supabase-js';

// ============================================
// QUOTE TYPES
// ============================================

/**
 * Base quote interface matching Supabase quotes table
 */
export interface Quote {
  id: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
}

/**
 * Legacy quote format (for backward compatibility with ZenQuotes API)
 * @deprecated Use Quote interface instead
 */
export interface LegacyQuote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

/**
 * Saved/favorited quote with additional metadata
 */
export interface SavedQuote extends Quote {
  saved_at: string;
  user_id: string;
}

/**
 * Quote of the day record
 */
export interface QuoteOfDay {
  id: string;
  quote_id: string;
  date: string;
  quote?: Quote;
}

// ============================================
// USER & AUTH TYPES
// ============================================

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Sign up form data
 */
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Login form data
 */
export interface LoginData {
  email: string;
  password: string;
}

// ============================================
// COLLECTION TYPES
// ============================================

/**
 * User-created quote collection
 */
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  quote_count?: number;
}

/**
 * Quote in a collection (junction table)
 */
export interface CollectionQuote {
  id: string;
  collection_id: string;
  quote_id: string;
  added_at: string;
  quote?: Quote;
}

/**
 * Collection with its quotes included
 */
export interface CollectionWithQuotes extends Collection {
  quotes: Quote[];
}

// ============================================
// USER FAVORITES TYPES
// ============================================

/**
 * User favorite record from Supabase
 */
export interface UserFavorite {
  id: string;
  user_id: string;
  quote_id: string;
  created_at: string;
  quote?: Quote;
}

// ============================================
// SETTINGS TYPES
// ============================================

/**
 * Available theme options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Available accent color options
 */
export type AccentColor = 'terracotta' | 'ocean' | 'forest' | 'purple' | 'amber';

/**
 * Available font size options
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * User settings/preferences
 */
export interface UserSettings {
  id: string;
  user_id: string;
  theme: ThemeMode;
  accent_color: AccentColor;
  font_size: FontSize;
  notification_enabled: boolean;
  notification_time: string; // HH:mm format
  updated_at: string;
}

/**
 * Default user settings
 */
export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'updated_at'> = {
  theme: 'light',
  accent_color: 'terracotta',
  font_size: 'medium',
  notification_enabled: true,
  notification_time: '09:00',
};

// ============================================
// SHARE CARD TYPES
// ============================================

/**
 * Share card template styles
 */
export type CardTemplate = 'minimal' | 'gradient' | 'dark';

/**
 * Share card configuration
 */
export interface ShareCardConfig {
  template: CardTemplate;
  showAuthor: boolean;
  showWatermark: boolean;
  textAlignment: 'left' | 'center' | 'right';
}

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Auth stack navigation params
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

/**
 * Main tab navigation params
 */
export type MainTabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  CollectionsTab: undefined;
  ProfileTab: undefined;
};

/**
 * Home stack navigation params
 */
export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  Category: { category: string };
  QuoteDetail: { quoteId: string };
};

/**
 * Collections stack navigation params
 */
export type CollectionsStackParamList = {
  CollectionsList: undefined;
  CollectionDetail: { collectionId: string };
  CreateCollection: undefined;
};

/**
 * Profile stack navigation params
 */
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================

/**
 * ZenQuotes API response format
 * @deprecated Will be removed when fully migrated to Supabase
 */
export interface ZenQuoteResponse {
  q: string;
  a: string;
  h: string;
}
