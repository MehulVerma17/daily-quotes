/**
 * Theme Constants for QuoteVault App
 *
 * Centralized theme configuration including colors, typography, spacing, and more.
 * All design tokens are defined here to ensure consistency across the app.
 */

import { Dimensions } from 'react-native';

// ============================================
// SCREEN DIMENSIONS
// ============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Responsive scaling utilities
 * Scales values based on screen width (base: 390px - iPhone 14 Pro)
 */
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const scale = (size: number): number => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
export const moderateScale = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;

// ============================================
// COLOR PALETTE
// ============================================

/**
 * Base colors used throughout the app
 */
export const COLORS = {
  // Primary accent colors
  terracotta: '#C4785A',
  terracottaLight: '#D4927A',
  terracottaDark: '#A45E40',

  // Background gradients
  gradientStart: '#F5E6DC',
  gradientMiddle: '#E8D5D0',
  gradientEnd: '#D4DDD5',

  // Warm background tones
  warmPeach: '#E8A87C',
  dustyRose: '#D4A5A5',
  mutedSage: '#A8B5C4',
  warmBeige: '#C9B8A8',

  // Card and surface colors
  white: '#FFFFFF',
  offWhite: '#FAF8F5',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  inputBorder: '#F0EBE3',

  // Text colors
  textPrimary: '#2D2D2D',
  textSecondary: '#8B7355',
  textMuted: '#9B8579',
  textPlaceholder: '#B5A89A',

  // UI colors
  border: '#F0EBE3',
  divider: '#E8E0D8',
  shadow: '#8B7355',

  // Status colors
  success: '#7BAE7F',
  error: '#D64545',
  warning: '#E8A87C',
  info: '#5A8EC4',

  // Tab bar
  tabActive: '#C4785A',
  tabInactive: '#9E9E9E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

/**
 * Dark mode colors
 */
export const DARK_COLORS = {
  // Primary accent colors (same as light mode)
  terracotta: '#C4785A',
  terracottaLight: '#D4927A',
  terracottaDark: '#A45E40',

  // Background gradients (dark versions)
  gradientStart: '#1A1A1A',
  gradientMiddle: '#242424',
  gradientEnd: '#1E2420',

  // Warm background tones (muted for dark mode)
  warmPeach: '#8B6650',
  dustyRose: '#8B7070',
  mutedSage: '#5A6570',
  warmBeige: '#6B5E50',

  // Card and surface colors
  white: '#2D2D2D',
  offWhite: '#1A1A1A',
  cardBackground: '#2D2D2D',
  inputBackground: '#363636',
  inputBorder: '#404040',

  // Text colors
  textPrimary: '#F5F5F5',
  textSecondary: '#B0A090',
  textMuted: '#8B8078',
  textPlaceholder: '#6B6560',

  // UI colors
  border: '#404040',
  divider: '#383838',
  shadow: '#000000',

  // Status colors (same as light mode)
  success: '#7BAE7F',
  error: '#D64545',
  warning: '#E8A87C',
  info: '#5A8EC4',

  // Tab bar
  tabActive: '#C4785A',
  tabInactive: '#6E6E6E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * Dark mode gradients
 */
export const DARK_GRADIENTS = {
  background: ['#1A1A1A', '#242424', '#1E2420'],
  auth: ['#1A1A1A', '#242424', '#202020'],
  cardGradient: ['#8B6650', '#8B7070', '#6B5E50'],
  cardSunset: ['#8B6650', '#8B7070', '#5A6570'],
  motivation: ['#8B6650', '#A45E40'],
  love: ['#8B7070', '#9B8080'],
  success: ['#8B7840', '#9B8850'],
  wisdom: ['#5A6570', '#6A7580'],
  humor: ['#8B8050', '#9B9060'],
} as const;

/**
 * Accent color themes
 */
export const ACCENT_COLORS = {
  terracotta: {
    primary: '#C4785A',
    light: '#D4927A',
    dark: '#A45E40',
  },
  ocean: {
    primary: '#5A8EC4',
    light: '#7AA8D4',
    dark: '#406EA4',
  },
  forest: {
    primary: '#5AC478',
    light: '#7AD498',
    dark: '#40A458',
  },
  purple: {
    primary: '#8E5AC4',
    light: '#A87AD4',
    dark: '#6E40A4',
  },
  amber: {
    primary: '#C4A85A',
    light: '#D4B87A',
    dark: '#A48840',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

/**
 * Font families
 * Note: Custom fonts need to be loaded via expo-font
 */
export const FONTS = {
  // Serif fonts for quotes and headings
  serifRegular: 'serif',
  serifItalic: 'serif',
  serifBold: 'serif',

  // Sans-serif fonts for UI elements
  sansRegular: 'System',
  sansMedium: 'System',
  sansBold: 'System',
} as const;

/**
 * Font sizes with responsive scaling
 */
export const FONT_SIZES = {
  // Extra small (labels, captions)
  xs: moderateScale(10),
  // Small (secondary text, tags)
  sm: moderateScale(12),
  // Base (body text)
  base: moderateScale(14),
  // Medium (buttons, inputs)
  md: moderateScale(16),
  // Large (section headers)
  lg: moderateScale(18),
  // Extra large (screen titles)
  xl: moderateScale(24),
  // 2X large (hero text)
  xxl: moderateScale(28),
  // 3X large (splash/brand)
  xxxl: moderateScale(36),
} as const;

/**
 * Font size options for user settings
 */
export const QUOTE_FONT_SIZES = {
  small: moderateScale(16),
  medium: moderateScale(20),
  large: moderateScale(24),
} as const;

/**
 * Line heights
 */
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/**
 * Letter spacing
 */
export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 1,
  wider: 1.5,
  widest: 3,
} as const;

// ============================================
// SPACING
// ============================================

/**
 * Spacing scale (based on 4px grid)
 */
export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  base: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(48),
} as const;

// ============================================
// BORDER RADIUS
// ============================================

/**
 * Border radius values
 */
export const RADIUS = {
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  full: 9999,
} as const;

// ============================================
// SHADOWS
// ============================================

/**
 * Shadow presets for iOS and Android
 */
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================
// GRADIENTS
// ============================================

/**
 * Gradient color arrays for LinearGradient
 */
export const GRADIENTS = {
  // Main app background gradient
  background: ['#F5E6DC', '#E8D5D0', '#D4DDD5'],

  // Auth screens gradient
  auth: ['#F5E6DC', '#E8D5D0', '#E0D8D0'],

  // Quote card templates
  cardGradient: ['#E8A87C', '#D4A5A5', '#C9B8A8'],
  cardSunset: ['#E8A87C', '#D4A5A5', '#A8B5C4'],

  // Category gradients
  motivation: ['#E8A87C', '#D4927A'],
  love: ['#D4A5A5', '#E8B5B5'],
  success: ['#C4A85A', '#D4B87A'],
  wisdom: ['#A8B5C4', '#B8C5D4'],
  humor: ['#E8D87C', '#F0E0A0'],
} as const;

// ============================================
// ANIMATION
// ============================================

/**
 * Animation timing presets
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ============================================
// Z-INDEX
// ============================================

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  base: 0,
  card: 10,
  header: 100,
  modal: 1000,
  toast: 2000,
} as const;

// ============================================
// SCREEN DIMENSIONS EXPORT
// ============================================

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} as const;
