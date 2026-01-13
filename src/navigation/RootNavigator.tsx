/**
 * Root Navigator
 *
 * Main navigation controller that switches between Auth and Main navigators
 * based on the user's authentication state.
 *
 * - Shows AuthNavigator when user is not logged in
 * - Shows MainNavigator when user is authenticated
 * - Handles loading state during auth initialization
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Navigation ref for use outside of React components (e.g., notification handlers)
export const navigationRef = createNavigationContainerRef();

import { useAuthStore } from '../stores';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { COLORS } from '../constants/theme';

// ============================================
// LOADING SCREEN
// ============================================

/**
 * Loading screen shown while checking auth state
 */
const LoadingScreen: React.FC = () => (
  <LinearGradient
    colors={['#F5E6DC', '#E8D5D0', '#E0D8D0']}
    style={styles.loadingContainer}
  >
    <ActivityIndicator size="large" color={COLORS.terracotta} />
  </LinearGradient>
);

// ============================================
// ROOT NAVIGATOR
// ============================================

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        // User is authenticated - show main app
        <AppNavigator />
      ) : (
        // User is not authenticated - show auth flow
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
