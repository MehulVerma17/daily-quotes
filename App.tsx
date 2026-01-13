/**
 * QuoteVault App
 *
 * Main entry point for the QuoteVault mobile application.
 * A full-featured quote discovery and collection app with:
 * - User authentication (Supabase)
 * - Quote browsing by category
 * - Favorites with cloud sync
 * - Custom collections
 * - Daily quote notifications
 * - Share cards
 * - Theme customization
 *
 * @author QuoteVault Team
 * @version 2.0.0
 */

import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import { RootNavigator, navigationRef } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores';
import { ThemeProvider, useTheme } from './src/contexts';

// ============================================
// NOTIFICATION CONFIGURATION
// ============================================

/**
 * Configure how notifications are handled when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============================================
// TOAST CONFIGURATION
// ============================================

/**
 * Custom toast styling to match app theme
 */
const toastConfig: ToastConfig = {
  // Success toast (green accent)
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#7BAE7F',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6B6B6B',
      }}
    />
  ),

  // Error toast (terracotta accent)
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#C4785A',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6B6B6B',
      }}
    />
  ),

  // Info toast (neutral)
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#5A8EC4',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#2D2D2D',
      }}
      text2Style={{
        fontSize: 13,
        color: '#6B6B6B',
      }}
    />
  ),
};

// ============================================
// APP CONTENT COMPONENT
// ============================================

/**
 * Inner app content that has access to theme context
 */
function AppContent() {
  const { isDark } = useTheme();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to Home screen when notification is tapped
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'Home' && navigationRef.isReady()) {
        navigationRef.navigate('HomeTab' as never);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Status bar styling - adapts to theme */}
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Root navigation - switches between Auth and Main based on auth state */}
      <RootNavigator />

      {/* Toast notifications */}
      <Toast config={toastConfig} position="top" topOffset={60} />
    </>
  );
}

// ============================================
// APP COMPONENT
// ============================================

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
