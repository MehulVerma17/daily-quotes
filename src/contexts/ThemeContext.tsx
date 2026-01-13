/**
 * Theme Context
 *
 * Provides global access to theme colors, accent colors, and font sizes.
 * Wraps the app to make theme settings available everywhere.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import {
  COLORS,
  DARK_COLORS,
  ACCENT_COLORS,
  GRADIENTS,
  DARK_GRADIENTS,
  QUOTE_FONT_SIZES,
} from '../constants/theme';
import { ThemeMode, AccentColor, FontSize, DEFAULT_SETTINGS } from '../types';

// Type for the accent color object
type AccentColorSet = {
  primary: string;
  light: string;
  dark: string;
};

// Color palette type (works for both light and dark)
type ColorPalette = typeof COLORS | typeof DARK_COLORS;
type GradientPalette = typeof GRADIENTS | typeof DARK_GRADIENTS;

// Context value type
interface ThemeContextValue {
  // Current colors based on theme mode
  colors: ColorPalette;
  // Current gradients based on theme mode
  gradients: GradientPalette;
  // Current accent color set
  accent: AccentColorSet;
  // Current accent color name
  accentName: AccentColor;
  // Quote font size based on user preference
  quoteFontSize: number;
  // Font size preference name
  fontSizeName: FontSize;
  // Whether dark mode is active
  isDark: boolean;
  // Current theme mode setting
  themeMode: ThemeMode;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextValue>({
  colors: COLORS,
  gradients: GRADIENTS,
  accent: ACCENT_COLORS.terracotta,
  accentName: 'terracotta',
  quoteFontSize: QUOTE_FONT_SIZES.medium,
  fontSizeName: 'medium',
  isDark: false,
  themeMode: 'light',
});

// Provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Loads settings and provides theme values to the app
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Get user and settings from stores
  const user = useAuthStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  // Load settings when user changes
  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id, loadSettings]);

  // Compute theme values
  const themeValue = useMemo(() => {
    // Get theme mode from settings or use default
    const themeMode: ThemeMode = settings?.theme ?? DEFAULT_SETTINGS.theme;

    // Determine if dark mode should be active
    let isDark = false;
    if (themeMode === 'dark') {
      isDark = true;
    } else if (themeMode === 'system') {
      isDark = systemColorScheme === 'dark';
    }

    // Select colors and gradients based on theme
    const colors = isDark ? DARK_COLORS : COLORS;
    const gradients = isDark ? DARK_GRADIENTS : GRADIENTS;

    // Get accent color from settings or use default
    const accentName: AccentColor = settings?.accent_color ?? DEFAULT_SETTINGS.accent_color;
    const accent = ACCENT_COLORS[accentName];

    // Get font size from settings or use default
    const fontSizeName: FontSize = settings?.font_size ?? DEFAULT_SETTINGS.font_size;
    const quoteFontSize = QUOTE_FONT_SIZES[fontSizeName];

    return {
      colors,
      gradients,
      accent,
      accentName,
      quoteFontSize,
      fontSizeName,
      isDark,
      themeMode,
    };
  }, [settings, systemColorScheme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * @returns Theme context value with colors, accent, font size, etc.
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
