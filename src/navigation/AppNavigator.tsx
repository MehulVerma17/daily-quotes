import React, { useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Pressable, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { SavedScreen } from '../screens/SavedScreen';

const { width } = Dimensions.get('window');

export type RootTabParamList = {
  Home: undefined;
  Saved: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Animated Tab Item
const TabItem: React.FC<{
  isFocused: boolean;
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  isHomeScreen: boolean;
}> = ({ isFocused, onPress, iconName, label, isHomeScreen }) => {
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

  const activeColor = isHomeScreen ? '#FFFFFF' : '#C4785A';
  const inactiveColor = isHomeScreen ? 'rgba(255, 255, 255, 0.5)' : '#9E9E9E';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Ionicons
          name={iconName}
          size={Math.min(24, width * 0.06)}
          color={isFocused ? activeColor : inactiveColor}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? activeColor : inactiveColor },
            isHomeScreen && styles.tabLabelHome,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

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
  const isHomeScreen = state.index === 0;

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: insets.bottom },
        isHomeScreen ? styles.tabBarHome : styles.tabBarSaved,
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
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

        const iconName =
          route.name === 'Home'
            ? isFocused
              ? 'home'
              : 'home-outline'
            : isFocused
            ? 'heart'
            : 'heart-outline';

        const label = route.name === 'Home' ? 'HOME' : 'SAVED';

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            iconName={iconName}
            label={label}
            isHomeScreen={isHomeScreen}
          />
        );
      })}
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    paddingTop: 14,
    paddingBottom: 10,
  },
  tabBarHome: {
    backgroundColor: 'rgba(180, 140, 130, 0.35)',
    borderTopWidth: 0,
  },
  tabBarSaved: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 1,
  },
  tabLabelHome: {
    fontWeight: '500',
  },
});
