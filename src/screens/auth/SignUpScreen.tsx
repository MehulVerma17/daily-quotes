/**
 * Sign Up Screen
 *
 * Allows new users to create an account with email/password.
 * Design matches image 2 from the designs folder.
 *
 * Features:
 * - Full name, email, password inputs
 * - Password strength indicator
 * - Password confirmation
 * - Terms of Service agreement checkbox
 * - Google/Apple OAuth options
 * - Form validation
 * - Loading states
 * - Error handling with toast notifications
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '../../stores';
import { AuthStackParamList } from '../../types';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS, moderateScale } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

// ============================================
// TYPES
// ============================================

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

// ============================================
// CONSTANTS
// ============================================

const { height } = Dimensions.get('window');

// Password strength colors
const STRENGTH_COLORS = {
  weak: '#D64545',
  medium: '#E8A87C',
  strong: '#7BAE7F',
  'very-strong': '#5A9E5F',
};

// ============================================
// COMPONENT
// ============================================

export const SignUpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  // Zustand store
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for input focus management
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // ============================================
  // PASSWORD STRENGTH CALCULATION
  // ============================================

  /**
   * Calculate password strength based on various criteria
   */
  const passwordStrength = useMemo((): { strength: PasswordStrength; label: string; score: number } => {
    if (!password) {
      return { strength: 'weak', label: '', score: 0 };
    }

    let score = 0;

    // Length checks
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      return { strength: 'weak', label: STRINGS.AUTH.PASSWORD_WEAK, score: 1 };
    } else if (score <= 4) {
      return { strength: 'medium', label: STRINGS.AUTH.PASSWORD_MEDIUM, score: 2 };
    } else if (score <= 5) {
      return { strength: 'strong', label: STRINGS.AUTH.PASSWORD_STRONG, score: 3 };
    } else {
      return { strength: 'very-strong', label: STRINGS.AUTH.PASSWORD_VERY_STRONG, score: 4 };
    }
  }, [password]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle form submission
   */
  const handleSignUp = async (): Promise<void> => {
    // Validate full name
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.NAME_REQUIRED,
        text2: STRINGS.AUTH.NAME_REQUIRED_DESC,
      });
      return;
    }

    // Validate email
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.EMAIL_REQUIRED,
        text2: STRINGS.AUTH.EMAIL_REQUIRED_DESC,
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.INVALID_EMAIL,
        text2: STRINGS.AUTH.INVALID_EMAIL_DESC,
      });
      return;
    }

    // Validate password
    if (!password) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.PASSWORD_REQUIRED,
        text2: STRINGS.AUTH.PASSWORD_REQUIRED_DESC,
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.WEAK_PASSWORD,
        text2: STRINGS.AUTH.WEAK_PASSWORD_DESC,
      });
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.PASSWORDS_DONT_MATCH,
        text2: STRINGS.AUTH.PASSWORDS_DONT_MATCH_DESC,
      });
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.TERMS_REQUIRED,
        text2: STRINGS.AUTH.TERMS_REQUIRED_DESC,
      });
      return;
    }

    // Attempt sign up
    setIsSubmitting(true);

    const result = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: STRINGS.AUTH.ACCOUNT_CREATED,
        text2: STRINGS.AUTH.ACCOUNT_CREATED_DESC,
      });
      // Navigation will happen automatically via auth state change
    } else {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.SIGN_UP_FAILED,
        text2: result.error || STRINGS.AUTH.SIGN_UP_FAILED_DESC,
      });
    }
  };

  /**
   * Navigate back to Login
   */
  const handleNavigateToLogin = (): void => {
    navigation.navigate('Login');
  };

  /**
   * Go back
   */
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  /**
   * Render password strength indicator bars
   */
  const renderStrengthBars = () => {
    const bars = [];
    const currentScore = password ? passwordStrength.score : 0;

    for (let i = 0; i < 4; i++) {
      const isActive = i < currentScore;
      const barColor = isActive ? STRENGTH_COLORS[passwordStrength.strength] : COLORS.inputBorder;

      bars.push(
        <View
          key={i}
          style={[
            styles.strengthBar,
            { backgroundColor: barColor },
          ]}
        />
      );
    }

    return bars;
  };

  // ============================================
  // RENDER
  // ============================================

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <LinearGradient
      colors={['#F5E6DC', '#E8D5D0', '#E0D8D0']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.md },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>{STRINGS.AUTH.CREATE_ACCOUNT}</Text>
            <Text style={styles.subtitle}>{STRINGS.AUTH.START_JOURNEY}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{STRINGS.AUTH.FULL_NAME}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={STRINGS.AUTH.ENTER_NAME}
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  editable={!isFormDisabled}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{STRINGS.AUTH.EMAIL}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  placeholder={STRINGS.AUTH.ENTER_EMAIL}
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  editable={!isFormDisabled}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{STRINGS.AUTH.PASSWORD}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, styles.passwordInput]}
                  placeholder={STRINGS.AUTH.CREATE_PASSWORD}
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  editable={!isFormDisabled}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {renderStrengthBars()}
                  </View>
                  <Text style={[
                    styles.strengthText,
                    { color: STRENGTH_COLORS[passwordStrength.strength] }
                  ]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{STRINGS.AUTH.CONFIRM_PASSWORD}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={styles.input}
                  placeholder={STRINGS.AUTH.CONFIRM_PASSWORD_PLACEHOLDER}
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  editable={!isFormDisabled}
                />
              </View>
            </View>

            {/* Terms Agreement Checkbox */}
            <Pressable
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
              ]}>
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                {STRINGS.AUTH.AGREE_TO}{' '}
                <Text style={styles.termsLink}>{STRINGS.AUTH.TERMS_OF_SERVICE}</Text>
                {' '}{STRINGS.COMMON.AND}{' '}
                <Text style={styles.termsLink}>{STRINGS.AUTH.PRIVACY_POLICY}</Text>.
              </Text>
            </Pressable>

            {/* Create Account Button */}
            <Pressable
              style={[
                styles.createAccountButton,
                isFormDisabled && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isFormDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.createAccountButtonText}>{STRINGS.AUTH.CREATE_ACCOUNT}</Text>
              )}
            </Pressable>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>{STRINGS.AUTH.ALREADY_HAVE_ACCOUNT} </Text>
              <Pressable onPress={handleNavigateToLogin}>
                <Text style={styles.signInLink}>{STRINGS.AUTH.SIGN_IN}</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: insets.bottom + SPACING.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  // Header Section
  headerSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: moderateScale(32),
    fontFamily: 'serif',
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  // Form Section
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    height: moderateScale(56),
    paddingHorizontal: SPACING.base,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  passwordInput: {
    paddingRight: moderateScale(50),
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.base,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Password Strength
  strengthContainer: {
    marginTop: SPACING.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
  },
  checkboxChecked: {
    backgroundColor: COLORS.terracotta,
    borderColor: COLORS.terracotta,
  },
  termsText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  termsLink: {
    color: COLORS.terracotta,
    fontWeight: '500',
  },

  // Create Account Button
  createAccountButton: {
    backgroundColor: COLORS.terracotta,
    height: moderateScale(56),
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  createAccountButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Sign In
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signInText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.terracotta,
  },
});

export default SignUpScreen;
