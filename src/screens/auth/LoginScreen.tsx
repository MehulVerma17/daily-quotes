/**
 * Login Screen
 *
 * Allows users to sign in with email/password or Google OAuth.
 * Design matches image 1 from the designs folder.
 *
 * Features:
 * - Email/password login
 * - Google OAuth login
 * - Password visibility toggle
 * - Navigation to Sign Up and Forgot Password
 * - Form validation
 * - Loading states
 * - Error handling with toast notifications
 */

import React, { useState, useRef } from 'react';
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
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS, scale, moderateScale } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';

// ============================================
// TYPES
// ============================================

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// ============================================
// CONSTANTS
// ============================================

const { width, height } = Dimensions.get('window');

// ============================================
// COMPONENT
// ============================================

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Zustand store
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for input focus management
  const passwordInputRef = useRef<TextInput>(null);

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
  const handleSignIn = async (): Promise<void> => {
    // Validate inputs
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
        text1: STRINGS.AUTH.INVALID_PASSWORD,
        text2: STRINGS.AUTH.INVALID_PASSWORD_DESC,
      });
      return;
    }

    // Attempt sign in
    setIsSubmitting(true);

    const result = await signIn({ email: email.trim(), password });

    setIsSubmitting(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: STRINGS.AUTH.SIGN_IN_FAILED,
        text2: result.error || STRINGS.AUTH.SIGN_IN_FAILED_DESC,
      });
    }
    // Navigation will happen automatically via auth state change
  };

  /**
   * Navigate to Sign Up screen
   */
  const handleNavigateToSignUp = (): void => {
    navigation.navigate('SignUp');
  };

  /**
   * Navigate to Forgot Password screen
   */
  const handleNavigateToForgotPassword = (): void => {
    navigation.navigate('ForgotPassword');
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
            { paddingTop: insets.top + SPACING.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button - Hidden on login as it's the first screen */}
          {/* <Pressable style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </Pressable> */}

          {/* Logo Section */}
          <View style={styles.logoSection}>
            {/* Decorative Quote Marks */}
            <Text style={styles.decorativeQuote}>"</Text>

            {/* App Title */}
            <Text style={styles.appTitle}>{STRINGS.APP.NAME}</Text>

            {/* Tagline */}
            <Text style={styles.tagline}>{STRINGS.APP.TAGLINE}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{STRINGS.AUTH.EMAIL}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
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
                  placeholder={STRINGS.AUTH.ENTER_PASSWORD}
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
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
            </View>

            {/* Forgot Password Link */}
            <Pressable
              style={styles.forgotPasswordButton}
              onPress={handleNavigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>{STRINGS.AUTH.FORGOT_PASSWORD}</Text>
            </Pressable>

            {/* Sign In Button */}
            <Pressable
              style={[
                styles.signInButton,
                isFormDisabled && styles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isFormDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.signInButtonText}>{STRINGS.AUTH.SIGN_IN}</Text>
              )}
            </Pressable>

          </View>

          {/* Bottom Sign Up Link */}
          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <Text style={styles.bottomText}>{STRINGS.AUTH.DONT_HAVE_ACCOUNT} </Text>
            <Pressable onPress={handleNavigateToSignUp}>
              <Text style={styles.signUpLink}>{STRINGS.AUTH.SIGN_UP}</Text>
            </Pressable>
          </View>
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

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },
  decorativeQuote: {
    fontSize: moderateScale(120),
    fontFamily: 'serif',
    color: 'rgba(180, 160, 150, 0.3)',
    lineHeight: moderateScale(100),
    marginBottom: -moderateScale(60),
  },
  appTitle: {
    fontSize: moderateScale(36),
    fontFamily: 'serif',
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 3,
    marginTop: SPACING.sm,
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

  // Forgot Password
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.terracotta,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Sign In Button
  signInButton: {
    backgroundColor: COLORS.terracotta,
    height: moderateScale(56),
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  signInButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xxl,
  },
  bottomText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.terracotta,
  },
});

export default LoginScreen;
