/**
 * Settings Screen
 *
 * User settings for appearance, notifications, and data.
 * Matches design from image 11.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useAuthStore } from '../../stores';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, ACCENT_COLORS, scale } from '../../constants/theme';
import { UserSettings, ThemeMode, AccentColor, FontSize } from '../../types';
import { getUserSettings, updateUserSettings } from '../../services/settingsService';
import { APP_CONFIG } from '../../config';

const { width } = Dimensions.get('window');

// Accent color options
const ACCENT_COLOR_OPTIONS: { color: AccentColor; hex: string }[] = [
  { color: 'terracotta', hex: ACCENT_COLORS.terracotta.primary },
  { color: 'amber', hex: ACCENT_COLORS.amber.primary },
  { color: 'ocean', hex: ACCENT_COLORS.ocean.primary },
  { color: 'forest', hex: ACCENT_COLORS.forest.primary },
  { color: 'purple', hex: ACCENT_COLORS.purple.primary },
];

// Theme options
const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
];

// Favorite categories (for notification preferences)
const CATEGORY_OPTIONS = [
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'stoicism', label: 'Stoicism' },
  { id: 'poetry', label: 'Poetry' },
];

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Zustand store
  const user = useAuthStore((state) => state.user);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['wisdom']);

  // Font size preview value (0-1 range for slider)
  const [fontSizeValue, setFontSizeValue] = useState(0.5);

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getUserSettings(user.id);
      setSettings(data);
      // Set font size slider value
      const fontSizeMap: Record<FontSize, number> = { small: 0, medium: 0.5, large: 1 };
      setFontSizeValue(fontSizeMap[data.font_size]);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!user?.id || !settings) return;
    try {
      const updated = await updateUserSettings(user.id, { [key]: value });
      setSettings(updated);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    handleUpdateSetting('theme', mode);
  };

  const handleAccentColorChange = (color: AccentColor) => {
    handleUpdateSetting('accent_color', color);
  };

  const handleFontSizeChange = (value: number) => {
    setFontSizeValue(value);
  };

  const handleFontSizeComplete = (value: number) => {
    let fontSize: FontSize;
    if (value < 0.33) fontSize = 'small';
    else if (value < 0.67) fontSize = 'medium';
    else fontSize = 'large';
    handleUpdateSetting('font_size', fontSize);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    handleUpdateSetting('notification_enabled', enabled);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.terracotta} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            {/* Theme Toggle */}
            <View style={styles.themeToggle}>
              {THEME_OPTIONS.map((option) => (
                <Pressable
                  key={option.mode}
                  style={[
                    styles.themeOption,
                    settings?.theme === option.mode && styles.themeOptionActive,
                  ]}
                  onPress={() => handleThemeChange(option.mode)}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      settings?.theme === option.mode && styles.themeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Accent Color */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Accent Color</Text>
              <View style={styles.colorOptions}>
                {ACCENT_COLOR_OPTIONS.map((option) => (
                  <Pressable
                    key={option.color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: option.hex },
                      settings?.accent_color === option.color && styles.colorOptionActive,
                    ]}
                    onPress={() => handleAccentColorChange(option.color)}
                  />
                ))}
              </View>
            </View>

            {/* Font Size Preview */}
            <View style={styles.previewContainer}>
              <Text style={[styles.previewText, { fontSize: 16 + fontSizeValue * 8 }]}>
                "The journey is the reward"
              </Text>
            </View>

            {/* Font Size Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Tr</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={fontSizeValue}
                onValueChange={handleFontSizeChange}
                onSlidingComplete={handleFontSizeComplete}
                minimumTrackTintColor={COLORS.terracotta}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.terracotta}
              />
              <Text style={[styles.sliderLabel, { fontSize: FONT_SIZES.lg }]}>Tr</Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            {/* Daily Quote Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Daily Quote</Text>
                <Text style={styles.toggleSubtitle}>Receive a fresh quote every morning</Text>
              </View>
              <Switch
                value={settings?.notification_enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: COLORS.border, true: COLORS.terracotta + '50' }}
                thumbColor={settings?.notification_enabled ? COLORS.terracotta : COLORS.white}
              />
            </View>

            {/* Reminder Time */}
            <Pressable style={styles.settingRowPressable}>
              <Text style={styles.settingLabel}>Reminder Time</Text>
              <Text style={styles.settingValue}>{settings?.notification_time || '09:00'} AM</Text>
            </Pressable>

            {/* Favorite Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesLabel}>Favorite Categories</Text>
              <View style={styles.categoryChips}>
                {CATEGORY_OPTIONS.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category.id) && styles.categoryChipActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategories.includes(category.id) && styles.categoryChipTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Data & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Security</Text>
          <View style={styles.card}>
            {/* Cloud Sync Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Cloud Sync</Text>
                <Text style={styles.toggleSubtitle}>Keep quotes across all devices</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: COLORS.border, true: COLORS.terracotta + '50' }}
                thumbColor={COLORS.terracotta}
              />
            </View>

            {/* Last Sync */}
            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <Ionicons name="sync" size={16} color={COLORS.textMuted} />
                <Text style={styles.syncText}>Last synced: 2 mins ago</Text>
              </View>
              <Pressable style={styles.syncButton}>
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>QUOTEVAULT V{APP_CONFIG.version}</Text>
          <View style={styles.appLinks}>
            <Pressable>
              <Text style={styles.appLink}>Privacy Policy</Text>
            </Pressable>
            <Text style={styles.linkDivider}>·</Text>
            <Pressable>
              <Text style={styles.appLink}>Terms of Service</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  themeOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  themeOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  themeOptionTextActive: {
    color: COLORS.textPrimary,
  },
  settingRow: {
    marginBottom: SPACING.lg,
  },
  settingRowPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  settingValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
  colorOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewContainer: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewText: {
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    fontFamily: FONTS.serifItalic,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  toggleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  categoriesSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  categoriesLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryChipActive: {
    backgroundColor: COLORS.terracotta,
    borderColor: COLORS.terracotta,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  syncText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  syncButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.terracotta,
  },
  syncButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  appName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  appLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  linkDivider: {
    marginHorizontal: SPACING.sm,
    color: COLORS.textMuted,
  },
});

export default SettingsScreen;
