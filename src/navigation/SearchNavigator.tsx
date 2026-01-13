/**
 * Search Navigator
 *
 * Stack navigator for the Search tab.
 * Includes Search and Category screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchScreen } from '../screens/search';
import { CategoryScreen } from '../screens/category';

export type SearchStackParamList = {
  Search: undefined;
  Category: { category: string };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
    </Stack.Navigator>
  );
};

export default SearchNavigator;
