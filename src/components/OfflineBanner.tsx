/**
 * OfflineBanner Component
 *
 * Displays a banner at the top of the screen when the device is offline.
 * Automatically shows/hides based on network connectivity.
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SPACING, FONT_SIZES, FONTS } from '../constants/theme';
import { STRINGS } from '../constants/strings';

interface OfflineBannerProps {
  /** Custom message to display when offline */
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = STRINGS.OFFLINE.NO_CONNECTION,
}) => {
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isConnected) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E53E3E',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  text: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.sansMedium,
    fontWeight: '500',
  },
});

export default OfflineBanner;
