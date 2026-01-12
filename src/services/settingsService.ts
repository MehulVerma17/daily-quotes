/**
 * Settings Service
 *
 * Handles all user settings/preferences database operations with Supabase.
 */

import { supabase, TABLES } from '../config';
import { UserSettings, DEFAULT_SETTINGS } from '../types';

/**
 * Gets user settings, creates default settings if none exist
 */
export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from(TABLES.USER_SETTINGS)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No settings found, create default settings
    return createDefaultSettings(userId);
  }

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data;
};

/**
 * Creates default settings for a user
 */
export const createDefaultSettings = async (userId: string): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from(TABLES.USER_SETTINGS)
    .insert({
      user_id: userId,
      ...DEFAULT_SETTINGS,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating default settings:', error);
    throw error;
  }

  return data;
};

/**
 * Updates user settings
 */
export const updateUserSettings = async (
  userId: string,
  updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'updated_at'>>
): Promise<UserSettings> => {
  const { data, error } = await supabase
    .from(TABLES.USER_SETTINGS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }

  return data;
};

/**
 * Updates theme preference
 */
export const updateTheme = async (
  userId: string,
  theme: UserSettings['theme']
): Promise<UserSettings> => {
  return updateUserSettings(userId, { theme });
};

/**
 * Updates accent color
 */
export const updateAccentColor = async (
  userId: string,
  accentColor: UserSettings['accent_color']
): Promise<UserSettings> => {
  return updateUserSettings(userId, { accent_color: accentColor });
};

/**
 * Updates font size preference
 */
export const updateFontSize = async (
  userId: string,
  fontSize: UserSettings['font_size']
): Promise<UserSettings> => {
  return updateUserSettings(userId, { font_size: fontSize });
};

/**
 * Updates notification settings
 */
export const updateNotificationSettings = async (
  userId: string,
  enabled: boolean,
  time?: string
): Promise<UserSettings> => {
  const updates: Partial<UserSettings> = { notification_enabled: enabled };
  if (time) {
    updates.notification_time = time;
  }
  return updateUserSettings(userId, updates);
};
