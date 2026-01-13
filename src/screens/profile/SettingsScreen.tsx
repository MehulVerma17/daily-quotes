/**
 * Settings Screen
 *
 * User settings for appearance, notifications, and data.
 * Matches design from image 11.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useAuthStore, useSettingsStore } from "../../stores";
import {
  SPACING,
  RADIUS,
  FONTS,
  FONT_SIZES,
  ACCENT_COLORS,
  scale,
} from "../../constants/theme";
import { useTheme } from "../../contexts";
import { ThemeMode, AccentColor, FontSize } from "../../types";
import {
  requestNotificationPermissions,
  scheduleDailyQuoteNotification,
  cancelDailyQuoteNotification,
  sendTestNotification,
  formatNotificationTime,
  timeStringToDate,
  dateToTimeString,
} from "../../services/notificationService";
import Toast from "react-native-toast-message";
import { APP_CONFIG } from "../../config";
import { STRINGS } from "../../constants/strings";

const { width } = Dimensions.get("window");

// Accent color options
const ACCENT_COLOR_OPTIONS: { color: AccentColor; hex: string }[] = [
  { color: "terracotta", hex: ACCENT_COLORS.terracotta.primary },
  { color: "amber", hex: ACCENT_COLORS.amber.primary },
  { color: "ocean", hex: ACCENT_COLORS.ocean.primary },
  { color: "forest", hex: ACCENT_COLORS.forest.primary },
  { color: "purple", hex: ACCENT_COLORS.purple.primary },
];

// Theme options (labels set dynamically for STRINGS access)
const THEME_OPTIONS: { mode: ThemeMode; labelKey: "THEME_LIGHT" | "THEME_DARK" | "THEME_SYSTEM" }[] = [
  { mode: "light", labelKey: "THEME_LIGHT" },
  { mode: "dark", labelKey: "THEME_DARK" },
  { mode: "system", labelKey: "THEME_SYSTEM" },
];

// Favorite categories (for notification preferences)
const CATEGORY_OPTIONS = [
  { id: "wisdom", label: "Wisdom" },
  { id: "motivation", label: "Motivation" },
  { id: "philosophy", label: "Philosophy" },
  { id: "stoicism", label: "Stoicism" },
  { id: "poetry", label: "Poetry" },
];

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Theme
  const { colors, accent } = useTheme();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const {
    settings,
    loading,
    setTheme,
    setAccentColor,
    setFontSize,
    setNotifications,
    loadSettings,
  } = useSettingsStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "wisdom",
  ]);

  // Font size preview value (0-1 range for slider)
  const [fontSizeValue, setFontSizeValue] = useState(0.5);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load settings from store on mount
  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id, loadSettings]);

  // Sync font size slider with settings
  useEffect(() => {
    if (settings?.font_size) {
      const fontSizeMap: Record<FontSize, number> = {
        small: 0,
        medium: 0.5,
        large: 1,
      };
      setFontSizeValue(fontSizeMap[settings.font_size]);
    }
  }, [settings?.font_size]);

  // Theme change - uses Zustand store for instant update
  const handleThemeChange = (mode: ThemeMode) => {
    if (user?.id) {
      setTheme(user.id, mode);
    }
  };

  // Accent color change - uses Zustand store for instant update
  const handleAccentColorChange = (color: AccentColor) => {
    if (user?.id) {
      setAccentColor(user.id, color);
    }
  };

  const handleFontSizeChange = (value: number) => {
    setFontSizeValue(value);
  };

  // Font size complete - uses Zustand store for instant update
  const handleFontSizeComplete = (value: number) => {
    let fontSize: FontSize;
    if (value < 0.33) fontSize = "small";
    else if (value < 0.67) fontSize = "medium";
    else fontSize = "large";
    if (user?.id) {
      setFontSize(user.id, fontSize);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Request permissions first
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          STRINGS.SETTINGS.PERMISSION_REQUIRED,
          STRINGS.SETTINGS.PERMISSION_REQUIRED_DESC,
          [{ text: STRINGS.COMMON.OK }]
        );
        return;
      }
      // Schedule the notification
      const time = settings?.notification_time || "09:00";
      const scheduledFor = await scheduleDailyQuoteNotification(time);
      Toast.show({
        type: "success",
        text1: STRINGS.SETTINGS.NOTIFICATIONS_ENABLED,
        text2: STRINGS.SETTINGS.NOTIFICATIONS_ENABLED_DESC(scheduledFor),
      });
    } else {
      // Cancel notifications
      await cancelDailyQuoteNotification();
      Toast.show({
        type: "info",
        text1: STRINGS.SETTINGS.NOTIFICATIONS_DISABLED,
        text2: STRINGS.SETTINGS.NOTIFICATIONS_DISABLED_DESC,
      });
    }
    // Use store to update notification setting
    if (user?.id) {
      setNotifications(user.id, enabled);
    }
  };

  const handleTimeChange = async (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowTimePicker(Platform.OS === "ios");

    if (event.type === "set" && selectedDate) {
      const newTime = dateToTimeString(selectedDate);
      // Update setting via store
      if (user?.id) {
        setNotifications(user.id, settings?.notification_enabled ?? true, newTime);
      }
      // Reschedule notification if enabled
      if (settings?.notification_enabled) {
        const scheduledFor = await scheduleDailyQuoteNotification(newTime);
        Toast.show({
          type: "success",
          text1: STRINGS.SETTINGS.REMINDER_SET,
          text2: STRINGS.SETTINGS.NOTIFICATIONS_ENABLED_DESC(scheduledFor),
        });
      }
    }
  };

  const handleTestNotification = async () => {
    try {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          STRINGS.SETTINGS.PERMISSION_REQUIRED,
          STRINGS.SETTINGS.PERMISSION_REQUIRED_DESC,
          [{ text: STRINGS.COMMON.OK }]
        );
        return;
      }
      await sendTestNotification();
      Toast.show({
        type: "success",
        text1: STRINGS.SETTINGS.TEST_SENT,
        text2: STRINGS.SETTINGS.TEST_SENT_DESC,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: STRINGS.COMMON.ERROR,
        text2: STRINGS.SETTINGS.TEST_FAILED,
      });
    }
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
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.offWhite }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.offWhite }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{STRINGS.SETTINGS.APPEARANCE}</Text>
          <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
            {/* Theme Toggle */}
            <View style={[styles.themeToggle, { backgroundColor: colors.offWhite }]}>
              {THEME_OPTIONS.map((option) => (
                <Pressable
                  key={option.mode}
                  style={[
                    styles.themeOption,
                    settings?.theme === option.mode && [styles.themeOptionActive, { backgroundColor: colors.white, shadowColor: colors.shadow }],
                  ]}
                  onPress={() => handleThemeChange(option.mode)}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: colors.textMuted },
                      settings?.theme === option.mode && { color: colors.textPrimary },
                    ]}
                  >
                    {STRINGS.SETTINGS[option.labelKey]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Accent Color */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.textMuted }]}>{STRINGS.SETTINGS.ACCENT_COLOR}</Text>
              <View style={styles.colorOptions}>
                {ACCENT_COLOR_OPTIONS.map((option) => (
                  <Pressable
                    key={option.color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: option.hex },
                      settings?.accent_color === option.color && [styles.colorOptionActive, { borderColor: colors.white }],
                    ]}
                    onPress={() => handleAccentColorChange(option.color)}
                  />
                ))}
              </View>
            </View>

            {/* Font Size Preview */}
            <View style={[styles.previewContainer, { backgroundColor: colors.offWhite }]}>
              <Text
                style={[
                  styles.previewText,
                  { fontSize: 16 + fontSizeValue * 8, color: colors.textPrimary },
                ]}
              >
                "{STRINGS.SETTINGS.FONT_PREVIEW_QUOTE}"
              </Text>
            </View>

            {/* Font Size Slider */}
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>Tr</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={fontSizeValue}
                onValueChange={handleFontSizeChange}
                onSlidingComplete={handleFontSizeComplete}
                minimumTrackTintColor={accent.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={accent.primary}
              />
              <Text style={[styles.sliderLabel, { fontSize: FONT_SIZES.lg, color: colors.textMuted }]}>
                Tr
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{STRINGS.SETTINGS.NOTIFICATIONS}</Text>
          <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
            {/* Daily Quote Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>{STRINGS.SETTINGS.DAILY_QUOTE}</Text>
                <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
                  {STRINGS.SETTINGS.DAILY_QUOTE_DESC}
                </Text>
              </View>
              <Switch
                value={settings?.notification_enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{
                  false: colors.border,
                  true: accent.primary + "50",
                }}
                thumbColor={
                  settings?.notification_enabled
                    ? accent.primary
                    : colors.white
                }
              />
            </View>

            {/* Reminder Time */}
            <Pressable
              style={[styles.settingRowPressable, { borderTopColor: colors.border }]}
              onPress={() => setShowTimePicker(true)}
              disabled={!settings?.notification_enabled}
            >
              <Text
                style={[
                  styles.settingLabel,
                  { color: colors.textMuted },
                  !settings?.notification_enabled && { color: colors.textPlaceholder },
                ]}
              >
                {STRINGS.SETTINGS.REMINDER_TIME}
              </Text>
              <View style={styles.timeValueContainer}>
                <Text
                  style={[
                    styles.settingValue,
                    { color: accent.primary },
                    !settings?.notification_enabled && { color: colors.textPlaceholder },
                  ]}
                >
                  {formatNotificationTime(
                    settings?.notification_time || "09:00"
                  )}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={
                    settings?.notification_enabled
                      ? accent.primary
                      : colors.textMuted
                  }
                />
              </View>
            </Pressable>

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={timeStringToDate(settings?.notification_time || "09:00")}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />
            )}

            {/* Test Notification Button */}
            {/* <Pressable
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="notifications-outline" size={18} color={accent.primary} />
              <Text style={styles.testButtonText}>Test Notification</Text>
            </Pressable> */}

            {/* Favorite Categories */}
            {/* <View style={styles.categoriesSection}>
              <Text style={styles.categoriesLabel}>Favorite Categories</Text>
              <View style={styles.categoryChips}>
                {CATEGORY_OPTIONS.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category.id) &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategories.includes(category.id) &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View> */}
          </View>
        </View>

        {/* Data & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{STRINGS.SETTINGS.DATA_SECURITY}</Text>
          <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
            {/* Cloud Sync Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>{STRINGS.SETTINGS.CLOUD_SYNC}</Text>
                <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
                  {STRINGS.SETTINGS.CLOUD_SYNC_DESC}
                </Text>
              </View>
              <Switch
                value={true}
                trackColor={{
                  false: colors.border,
                  true: accent.primary + "50",
                }}
                thumbColor={accent.primary}
              />
            </View>

            {/* Last Sync */}
            <View style={[styles.syncRow, { borderTopColor: colors.border }]}>
              <View style={styles.syncInfo}>
                <Ionicons name="sync" size={16} color={colors.textMuted} />
                <Text style={[styles.syncText, { color: colors.textMuted }]}>{STRINGS.SETTINGS.LAST_SYNCED}</Text>
              </View>
              <Pressable style={[styles.syncButton, { borderColor: accent.primary }]}>
                <Text style={[styles.syncButtonText, { color: accent.primary }]}>{STRINGS.SETTINGS.SYNC_NOW}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.textMuted }]}>{STRINGS.APP.VERSION_PREFIX}{APP_CONFIG.version}</Text>
          <View style={styles.appLinks}>
            <Pressable>
              <Text style={[styles.appLink, { color: colors.textMuted }]}>{STRINGS.SETTINGS.PRIVACY_POLICY}</Text>
            </Pressable>
            <Text style={[styles.linkDivider, { color: colors.textMuted }]}>·</Text>
            <Pressable>
              <Text style={[styles.appLink, { color: colors.textMuted }]}>{STRINGS.SETTINGS.TERMS_OF_SERVICE}</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
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
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggle: {
    flexDirection: "row",
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  themeOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: "center",
  },
  themeOptionActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  themeOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  settingRow: {
    marginBottom: SPACING.lg,
  },
  settingRowPressable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
  },
  settingLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  settingValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
  },
  timeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  colorOptions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionActive: {
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  previewText: {
    fontStyle: "italic",
    fontFamily: FONTS.serifItalic,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  toggleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  testButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  categoriesSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  categoriesLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryChipActive: {
    // colors set dynamically
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
  },
  categoryChipTextActive: {
    // colors set dynamically
  },
  syncRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  syncText: {
    fontSize: FONT_SIZES.sm,
  },
  syncButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  syncButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  appName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  appLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  appLink: {
    fontSize: FONT_SIZES.sm,
  },
  linkDivider: {
    marginHorizontal: SPACING.sm,
  },
});

export default SettingsScreen;
