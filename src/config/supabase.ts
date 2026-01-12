/**
 * Supabase Configuration
 *
 * This file initializes the Supabase client for authentication and database operations.
 * Environment variables are loaded from .env file with EXPO_PUBLIC_ prefix.
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy .env.example to .env
 * 3. Fill in your Supabase URL and Anon Key from the project dashboard
 *
 * @see https://supabase.com/docs/guides/getting-started/tutorials/with-expo
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

/**
 * Supabase project URL
 * Found in: Supabase Dashboard > Settings > API > Project URL
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

/**
 * Supabase anonymous key (safe to use in client-side code)
 * Found in: Supabase Dashboard > Settings > API > anon public key
 */
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || SUPABASE_URL === 'your_supabase_project_url') {
  console.warn(
    '⚠️ Supabase URL not configured. Please update EXPO_PUBLIC_SUPABASE_URL in .env file.'
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
  console.warn(
    '⚠️ Supabase Anon Key not configured. Please update EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file.'
  );
}

// ============================================
// SUPABASE CLIENT
// ============================================

/**
 * Supabase client instance configured with AsyncStorage for session persistence.
 * This allows the user to stay logged in between app sessions.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Use AsyncStorage to persist auth session
    storage: AsyncStorage,
    // Automatically refresh the token before it expires
    autoRefreshToken: true,
    // Persist the session to storage
    persistSession: true,
    // Detect session from URL (for OAuth callbacks)
    detectSessionInUrl: false,
  },
});

// ============================================
// DATABASE CONSTANTS
// ============================================

/**
 * Database table names as constants to avoid typos
 */
export const TABLES = {
  /** Quotes table - stores all quotes */
  QUOTES: 'quotes',
  /** User favorites - stores user's favorited quotes */
  USER_FAVORITES: 'user_favorites',
  /** Collections - stores user's custom collections */
  COLLECTIONS: 'collections',
  /** Collection quotes - junction table for quotes in collections */
  COLLECTION_QUOTES: 'collection_quotes',
  /** User settings - stores user preferences */
  USER_SETTINGS: 'user_settings',
  /** Quote of the day - stores daily featured quotes */
  QUOTE_OF_DAY: 'quote_of_day',
  /** User profiles - stores user profile information */
  PROFILES: 'profiles',
} as const;

// ============================================
// QUOTE CATEGORIES
// ============================================

/**
 * Quote categories available in the app
 * These should match the categories in your Supabase quotes table
 */
export const CATEGORIES = [
  'Motivation',
  'Love',
  'Success',
  'Wisdom',
  'Humor',
] as const;

export type Category = (typeof CATEGORIES)[number];

// ============================================
// APP CONFIGURATION
// ============================================

/**
 * App configuration from environment variables
 */
export const APP_CONFIG = {
  /** App name */
  name: process.env.EXPO_PUBLIC_APP_NAME || 'QuoteVault',
  /** App version */
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  /** Current environment */
  env: process.env.EXPO_PUBLIC_ENV || 'development',
  /** Is development mode */
  isDev: process.env.EXPO_PUBLIC_ENV !== 'production',
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Feature flags from environment variables
 */
export const FEATURES = {
  /** Enable Google OAuth */
  googleAuth: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
  /** Enable Apple OAuth */
  appleAuth: process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === 'true',
  /** Enable push notifications */
  notifications: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  /** Enable analytics */
  analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

// ============================================
// API CONFIGURATION
// ============================================

/**
 * API configuration from environment variables
 */
export const API_CONFIG = {
  /** Default page size for paginated queries */
  defaultPageSize: parseInt(process.env.EXPO_PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
  /** Hour to refresh quote of the day (0-23) */
  qotdRefreshHour: parseInt(process.env.EXPO_PUBLIC_QOTD_REFRESH_HOUR || '0', 10),
  /** Default notification time */
  defaultNotificationTime: process.env.EXPO_PUBLIC_DEFAULT_NOTIFICATION_TIME || '09:00',
} as const;
