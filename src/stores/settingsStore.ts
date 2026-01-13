/**
 * Settings Store (Zustand)
 *
 * Manages user settings/preferences state.
 * Syncs with Supabase for persistence.
 * Caches locally with AsyncStorage for offline support and instant loading.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserSettings,
  updateUserSettings,
  updateTheme,
  updateAccentColor,
  updateFontSize,
  updateNotificationSettings,
} from '../services/settingsService';
import { UserSettings, DEFAULT_SETTINGS, ThemeMode, AccentColor, FontSize } from '../types';

// AsyncStorage key for settings cache
const SETTINGS_CACHE_KEY = '@quotevault_settings';

/**
 * Save settings to local cache
 */
const cacheSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to cache settings:', error);
  }
};

/**
 * Load settings from local cache
 */
const getCachedSettings = async (): Promise<UserSettings | null> => {
  try {
    const cached = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to load cached settings:', error);
    return null;
  }
};

/**
 * Clear settings cache (on logout)
 */
const clearSettingsCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SETTINGS_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear settings cache:', error);
  }
};

interface SettingsState {
  // State
  settings: UserSettings | null;
  loading: boolean;

  // Actions
  loadSettings: (userId: string) => Promise<void>;
  setTheme: (userId: string, theme: ThemeMode) => Promise<void>;
  setAccentColor: (userId: string, color: AccentColor) => Promise<void>;
  setFontSize: (userId: string, size: FontSize) => Promise<void>;
  setNotifications: (userId: string, enabled: boolean, time?: string) => Promise<void>;
  updateSettings: (userId: string, updates: Partial<UserSettings>) => Promise<void>;
  clearSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  settings: null,
  loading: false,

  // Load settings for a user (cache first, then sync from server)
  loadSettings: async (userId: string) => {
    if (!userId) {
      set({ settings: null });
      return;
    }

    set({ loading: true });

    try {
      // Try to load from cache first for instant display
      const cached = await getCachedSettings();
      if (cached && cached.user_id === userId) {
        set({ settings: cached });
      }

      // Then fetch from server to sync
      const data = await getUserSettings(userId);
      set({ settings: data });
      // Update cache with latest from server
      await cacheSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use cached if available, otherwise use defaults
      const cached = await getCachedSettings();
      if (cached && cached.user_id === userId) {
        set({ settings: cached });
      } else {
        set({
          settings: {
            id: '',
            user_id: userId,
            ...DEFAULT_SETTINGS,
            updated_at: new Date().toISOString(),
          },
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  // Update theme
  setTheme: async (userId: string, theme: ThemeMode) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      const optimistic = { ...settings, theme };
      set({ settings: optimistic });
      // Cache immediately for instant persistence
      await cacheSettings(optimistic);
    }

    try {
      const updated = await updateTheme(userId, theme);
      set({ settings: updated });
      await cacheSettings(updated);
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert on error
      get().loadSettings(userId);
    }
  },

  // Update accent color
  setAccentColor: async (userId: string, color: AccentColor) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      const optimistic = { ...settings, accent_color: color };
      set({ settings: optimistic });
      await cacheSettings(optimistic);
    }

    try {
      const updated = await updateAccentColor(userId, color);
      set({ settings: updated });
      await cacheSettings(updated);
    } catch (error) {
      console.error('Error updating accent color:', error);
      get().loadSettings(userId);
    }
  },

  // Update font size
  setFontSize: async (userId: string, size: FontSize) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      const optimistic = { ...settings, font_size: size };
      set({ settings: optimistic });
      await cacheSettings(optimistic);
    }

    try {
      const updated = await updateFontSize(userId, size);
      set({ settings: updated });
      await cacheSettings(updated);
    } catch (error) {
      console.error('Error updating font size:', error);
      get().loadSettings(userId);
    }
  },

  // Update notification settings
  setNotifications: async (userId: string, enabled: boolean, time?: string) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      const optimistic = {
        ...settings,
        notification_enabled: enabled,
        ...(time ? { notification_time: time } : {}),
      };
      set({ settings: optimistic });
      await cacheSettings(optimistic);
    }

    try {
      const updated = await updateNotificationSettings(userId, enabled, time);
      set({ settings: updated });
      await cacheSettings(updated);
    } catch (error) {
      console.error('Error updating notifications:', error);
      get().loadSettings(userId);
    }
  },

  // Generic settings update
  updateSettings: async (userId: string, updates: Partial<UserSettings>) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      const optimistic = { ...settings, ...updates };
      set({ settings: optimistic });
      await cacheSettings(optimistic);
    }

    try {
      const updated = await updateUserSettings(userId, updates);
      set({ settings: updated });
      await cacheSettings(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
      get().loadSettings(userId);
    }
  },

  // Clear settings (on logout)
  clearSettings: () => {
    set({ settings: null, loading: false });
    // Also clear the cache
    clearSettingsCache();
  },
}));
