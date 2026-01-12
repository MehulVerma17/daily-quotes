/**
 * Home Navigator
 *
 * Stack navigator for the Home tab.
 * Includes Home, Search, and Category screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home';
import { SearchScreen } from '../screens/search';
import { CategoryScreen } from '../screens/category';

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  Category: { category: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
