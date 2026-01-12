/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email.
 * Design matches image 3 from the designs folder.
 *
 * Features:
 * - Email input for reset request
 * - Send reset link functionality
 * - Success/error feedback
 * - Navigation back to login
 */

import React, { useState } from 'react';
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

import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS, moderateScale } from '../../constants/theme';

// ============================================
// TYPES
// ============================================

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

// ============================================
// CONSTANTS
// ============================================

const { width, height } = Dimensions.get('window');

// ============================================
// COMPONENT
// ============================================

export const ForgotPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const { resetPassword, isLoading } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

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
   * Handle reset password request
   */
  const handleResetPassword = async (): Promise<void> => {
    // Validate email
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address',
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    // Send reset email
    setIsSubmitting(true);

    const result = await resetPassword(email.trim());

    setIsSubmitting(false);

    if (result.success) {
      setIsEmailSent(true);
      Toast.show({
        type: 'success',
        text1: 'Email Sent!',
        text2: 'Check your inbox for password reset instructions',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: result.error || 'Please try again',
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
            <Ionicons name="arrow-back" size={24} color={COLORS.terracotta} />
          </Pressable>

          {/* Illustration Section */}
          <View style={styles.illustrationSection}>
            {/* Decorative Circle Background */}
            <View style={styles.illustrationCircle}>
              {/* Sparkle decorations */}
              <View style={[styles.sparkle, styles.sparkleTopRight]}>
                <Text style={styles.sparkleText}>✦</Text>
              </View>
              <View style={[styles.sparkle, styles.sparkleBottomLeft]}>
                <Text style={styles.sparkleText}>✦</Text>
              </View>
              <View style={[styles.sparkle, styles.sparkleTop]}>
                <Text style={[styles.sparkleText, styles.sparkleSmall]}>✦</Text>
              </View>
              <View style={[styles.sparkle, styles.sparkleRight]}>
                <Text style={[styles.sparkleText, styles.sparkleSmall]}>✦</Text>
              </View>

              {/* Email Icon */}
              <Ionicons name="mail" size={48} color={COLORS.terracotta} />
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Enter the email associated with your account and we'll send an email with instructions to reset your password.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  editable={!isFormDisabled && !isEmailSent}
                />
              </View>
            </View>

            {/* Send Reset Link Button */}
            <Pressable
              style={[
                styles.resetButton,
                (isFormDisabled || isEmailSent) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isFormDisabled || isEmailSent}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : isEmailSent ? (
                <View style={styles.sentContainer}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.resetButtonText}>Email Sent!</Text>
                </View>
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </Pressable>

            {/* Resend option after email sent */}
            {isEmailSent && (
              <Pressable
                style={styles.resendButton}
                onPress={() => {
                  setIsEmailSent(false);
                }}
              >
                <Text style={styles.resendText}>Didn't receive email? Try again</Text>
              </Pressable>
            )}
          </View>

          {/* Bottom Section */}
          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <Pressable onPress={handleNavigateToLogin}>
              <Text style={styles.backToSignIn}>Back to Sign In</Text>
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

  // Illustration Section
  illustrationSection: {
    alignItems: 'center',
    marginTop: height * 0.02,
    marginBottom: SPACING.xl,
  },
  illustrationCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(196, 120, 90, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: moderateScale(14),
    color: COLORS.terracotta,
    opacity: 0.6,
  },
  sparkleSmall: {
    fontSize: moderateScale(10),
    opacity: 0.4,
  },
  sparkleTopRight: {
    top: -5,
    right: -5,
  },
  sparkleBottomLeft: {
    bottom: 5,
    left: -10,
  },
  sparkleTop: {
    top: -15,
    left: '50%',
    marginLeft: -5,
  },
  sparkleRight: {
    top: '50%',
    right: -15,
    marginTop: -5,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: 'serif',
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
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

  // Reset Button
  resetButton: {
    backgroundColor: COLORS.terracotta,
    height: moderateScale(56),
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  resetButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  sentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  resendText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.terracotta,
    fontWeight: '500',
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xxl,
  },
  backToSignIn: {
    fontSize: FONT_SIZES.base,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
