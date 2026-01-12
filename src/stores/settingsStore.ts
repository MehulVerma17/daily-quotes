/**
 * Settings Store (Zustand)
 *
 * Manages user settings/preferences state.
 * Syncs with Supabase for persistence.
 */

import { create } from 'zustand';
import {
  getUserSettings,
  updateUserSettings,
  updateTheme,
  updateAccentColor,
  updateFontSize,
  updateNotificationSettings,
} from '../services/settingsService';
import { UserSettings, DEFAULT_SETTINGS, ThemeMode, AccentColor, FontSize } from '../types';

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

  // Load settings for a user
  loadSettings: async (userId: string) => {
    if (!userId) {
      set({ settings: null });
      return;
    }

    set({ loading: true });

    try {
      const data = await getUserSettings(userId);
      set({ settings: data });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use defaults if loading fails
      set({
        settings: {
          id: '',
          user_id: userId,
          ...DEFAULT_SETTINGS,
          updated_at: new Date().toISOString(),
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  // Update theme
  setTheme: async (userId: string, theme: ThemeMode) => {
    const { settings } = get();

    // Optimistic update
    if (settings) {
      set({ settings: { ...settings, theme } });
    }

    try {
      const updated = await updateTheme(userId, theme);
      set({ settings: updated });
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
      set({ settings: { ...settings, accent_color: color } });
    }

    try {
      const updated = await updateAccentColor(userId, color);
      set({ settings: updated });
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
      set({ settings: { ...settings, font_size: size } });
    }

    try {
      const updated = await updateFontSize(userId, size);
      set({ settings: updated });
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
      set({
        settings: {
          ...settings,
          notification_enabled: enabled,
          ...(time ? { notification_time: time } : {}),
        },
      });
    }

    try {
      const updated = await updateNotificationSettings(userId, enabled, time);
      set({ settings: updated });
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
      set({ settings: { ...settings, ...updates } });
    }

    try {
      const updated = await updateUserSettings(userId, updates);
      set({ settings: updated });
    } catch (error) {
      console.error('Error updating settings:', error);
      get().loadSettings(userId);
    }
  },

  // Clear settings (on logout)
  clearSettings: () => {
    set({ settings: null, loading: false });
  },
}));
