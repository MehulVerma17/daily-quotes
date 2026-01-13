/**
 * App Navigator
 *
 * Main bottom tab navigator for authenticated users.
 * Contains 5 tabs: Home, Search, Favorites, Collections, Profile
 *
 * Note: NavigationContainer is provided by RootNavigator
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeNavigator } from './HomeNavigator';
import { SearchNavigator } from './SearchNavigator';
import { CollectionsNavigator } from './CollectionsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { FavoritesScreen } from '../screens/favorites';
import { SPACING, scale } from '../constants/theme';
import { useTheme } from '../contexts';

export type RootTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  FavoritesTab: undefined;
  CollectionsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Tab bar icons mapping
const TAB_ICONS: Record<keyof RootTabParamList, { active: string; inactive: string }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  SearchTab: { active: 'search', inactive: 'search-outline' },
  FavoritesTab: { active: 'heart', inactive: 'heart-outline' },
  CollectionsTab: { active: 'folder', inactive: 'folder-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

// Tab bar labels
const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  HomeTab: 'Home',
  SearchTab: 'Search',
  FavoritesTab: 'Favorites',
  CollectionsTab: 'Collections',
  ProfileTab: 'Profile',
};

// Animated Tab Button Component
const TabButton: React.FC<{
  isFocused: boolean;
  onPress: () => void;
  routeName: keyof RootTabParamList;
  activeColor: string;
  inactiveColor: string;
}> = ({ isFocused, onPress, routeName, activeColor, inactiveColor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const icons = TAB_ICONS[routeName];
  const label = TAB_LABELS[routeName];
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabButtonInner, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={(isFocused ? icons.active : icons.inactive) as any}
          size={22}
          color={color}
        />
        <Text style={[styles.tabLabel, { color }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// Custom Tab Bar Component
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, accent } = useTheme();

  // Cache the initial bottom inset to prevent jumping when share sheet opens
  // This is critical for Android where share sheet can cause inset changes
  const cachedBottomInset = useRef<number | null>(null);

  // Only cache once we have a valid (non-zero) inset value
  // This ensures we don't cache incorrect values from initial render
  if (cachedBottomInset.current === null && insets.bottom > 0) {
    cachedBottomInset.current = insets.bottom;
  }

  // Use cached value if available, otherwise use current insets (or 0 fallback)
  const bottomPadding = cachedBottomInset.current ?? insets.bottom;

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            routeName={route.name as keyof RootTabParamList}
            activeColor={accent.primary}
            inactiveColor={colors.tabInactive}
          />
        );
      })}
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen name="SearchTab" component={SearchNavigator} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} />
      <Tab.Screen name="CollectionsTab" component={CollectionsNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabButtonInner: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: scale(10),
    fontWeight: '500',
    marginTop: 4,
  },
});

export default AppNavigator;
